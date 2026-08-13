# API — Maisara (Contracts)

**Tarikh:** 13 Ogos 2026
**Nota:** Semua endpoint adalah Route Handlers Next.js di bawah `/api`. Format ralat seragam: `{ "error": { "code": "...", "message": "..." } }`.

---

## 1. Auth (Better Auth)

Better Auth mengurus `/api/auth/*` (register, login, logout, session). Rujuk dokumentasi Better Auth untuk request/response tepat. Kita guna:
- `POST /api/auth/sign-up/email` — daftar (name, email, password)
- `POST /api/auth/sign-in/email` — login
- `POST /api/auth/sign-out` — logout
- `GET /api/auth/get-session` — session semasa

## 2. Katalog

### GET /api/products
Senarai produk dengan filter.

Query params:
| Param | Type | Keterangan |
|---|---|---|
| `category` | string (slug) | Filter kategori |
| `search` | string | Carian nama |
| `minPrice` / `maxPrice` | number | Julat harga |
| `color` | string | Filter warna variant |
| `size` | string | Filter saiz variant |
| `sort` | string | `popular` \| `price-asc` \| `price-desc` \| `newest` (default `popular`) |
| `page` | number | Default 1 |
| `pageSize` | number | Default 12, max 24 |

Response 200:
```json
{
  "items": [
    {
      "id": "ck...",
      "name": "Tudung Bawal Premium",
      "slug": "tudung-bawal-premium",
      "price": "49.00",
      "image": "https://...",
      "category": { "name": "Tudung", "slug": "tudung" },
      "colors": ["Sage", "Ivory"],
      "sizes": ["S", "M", "L"],
      "minStock": 3,
      "avgRating": 4.6,
      "reviewCount": 12
    }
  ],
  "total": 28,
  "page": 1,
  "pageSize": 12
}
```

### GET /api/products/[id]
Detail produk penuh: variants (dengan stock per variant), reviews approved, category. Response termasuk `variants: [{ id, color, size, sku, stock }]` dan `reviews: [...]`.

### GET /api/categories
Senarai kategori dengan kiraan produk aktif:
```json
{ "items": [{ "id": "...", "name": "Tudung", "slug": "tudung", "image": "...", "productCount": 28 }] }
```

## 3. Cart

Cart guna cookie `cart-session` untuk guest; untuk user berdaftar guna userId. Merge berlaku masa login.

### GET /api/cart
Senarai item cart + ringkasan:
```json
{
  "items": [
    {
      "id": "...", "variantId": "...", "quantity": 2,
      "product": { "id": "...", "name": "...", "slug": "..." },
      "variant": { "color": "Sage", "size": "M", "sku": "...", "stock": 10 },
      "unitPrice": "49.00", "lineTotal": "98.00",
      "image": "https://..."
    }
  ],
  "subtotal": "98.00",
  "itemCount": 2
}
```

### POST /api/cart
Body: `{ "variantId": "string", "quantity": 1 }`
- Jika item sudah wujud, tambah kuantiti (cap pada stok).
- Jika stok habis → 409 `OUT_OF_STOCK`.

### PATCH /api/cart/[itemId]
Body: `{ "quantity": 3 }` (1-99, cap stok).

### DELETE /api/cart/[itemId]
Buang item. Response 204.

## 4. Order & Checkout

### POST /api/orders (Auth: CUSTOMER)
Cipta order dari cart user + alamat + kaedah penghantaran.

Body:
```json
{
  "shippingAddress": {
    "name": "Nurul Aisyah",
    "phone": "0123456789",
    "address": "No. 12, Jalan Mawar",
    "state": "Selangor",
    "postcode": "40000"
  },
  "shippingMethod": "J&T Express"
}
```

Validation (Zod):
- name: 3-100 chars
- phone: format Malaysia (01x-xxxxxxx, 9-11 digit)
- address: 5-200 chars
- state: dalam senarai negeri Malaysia (14 negeri)
- postcode: 5 digit
- shippingMethod: `J&T Express` | `Pos Laju`

Server-side (service):
1. Semak session + ambil cart user.
2. Kira semula harga setiap item DARI DB (jangan percaya client).
3. Semak stok setiap variant; jika tak cukup → 409 `INSUFFICIENT_STOCK` dengan detail.
4. Kira shipping fee mengikut negeri + kaedah.
5. Kurangkan stok (transaction).
6. Cipta Order (PENDING) + OrderItem (snapshot) + Payment (PENDING, provider mock).
7. Initiate payment → dapat redirectUrl.

Response 201:
```json
{
  "orderId": "...",
  "paymentReference": "MOCK-...",
  "redirectUrl": "/pembayaran/[orderId]"
}
```

### GET /api/orders (Auth: CUSTOMER)
Sejarah order user sendiri. Response: array order (id, status, total, createdAt, itemCount, paymentStatus).

### GET /api/orders/[id] (Auth: CUSTOMER/ADMIN)
Detail order: items (dengan snapshot), shippingAddress, payment, status. Customer hanya boleh lihat order sendiri; admin semua.

### PATCH /api/orders/[id]/status (Auth: ADMIN)
Body: `{ "status": "PROCESSING" }` — salah satu `PENDING | PROCESSING | SHIPPED | COMPLETED | CANCELLED`.
- Transition validation: PENDING→PROCESSING→SHIPPED→COMPLETED; CANCELLED hanya dari PENDING/PROCESSING.
- Jika CANCELLED: pulangkan stok variants.

## 5. Payment (Mock FPX)

### POST /api/payments/[orderId] (Auth: CUSTOMER)
Initiate semula payment untuk order (guna bila payment gagal dan cuba semula).
- Semak order kepunyaan user + status payment PENDING/FAILED.
- Response: `{ "redirectUrl": "/pembayaran/[orderId]" }`.

### POST /api/payments/callback
Callback dari provider (mock: dipanggil halaman simulasi FPX).

Body (mock):
```json
{ "reference": "MOCK-abc123", "status": "paid" }
```
- Status `paid` | `failed`.
- Verify reference wujud + status PENDING.
- Update Payment → PAID/FAILED dan Order.paymentStatus sepadan.
- Jika paid: Order kekal PENDING (menunggu admin proses).
- Response 200. Idempotent: panggilan kedua dengan status sama → 200 tanpa perubahan.

## 6. Review

### GET /api/reviews?productId=...
Senarai review APPROVED untuk produk (public). Termasuk user name + createdAt.

### POST /api/reviews (Auth: CUSTOMER)
Body: `{ "productId": "...", "rating": 5, "comment": "..." }`
- Validation: rating integer 1-5; comment 10-1000 chars.
- Syarat: user telah beli produk tersebut DAN order COMPLETED (semak OrderItem). Jika tidak → 403 `ORDER_NOT_COMPLETED`.
- Satu review per produk per user (unique constraint) → 409 `ALREADY_REVIEWED`.
- Status awal PENDING (menunggu moderasi).

### PATCH /api/reviews/[id] (Auth: ADMIN)
Body: `{ "status": "APPROVED" | "HIDDEN" }` — moderasi.

## 7. Admin

### GET /api/admin/dashboard (Auth: ADMIN)
```json
{
  "stats": {
    "totalOrders": 128,
    "totalRevenue": "18420.50",
    "pendingOrders": 6,
    "lowStockCount": 4
  },
  "recentOrders": [ /* 5 order terkini */ ],
  "lowStockItems": [ /* variants stok <= 5 */ ]
}
```

### GET /api/admin/stock (Auth: ADMIN)
Senarai semua variants dengan stock + status rendah. Query: `?lowOnly=true` untuk stok ≤ 5.

### Produk CRUD (Auth: ADMIN)

**POST /api/products** — cipta produk + variants.
```json
{
  "name": "Tudung Bawal Premium",
  "slug": "tudung-bawal-premium",
  "description": "...",
  "price": "49.00",
  "categoryId": "...",
  "images": ["https://..."],
  "featured": false,
  "variants": [
    { "color": "Sage", "size": null, "sku": "TB-SAGE", "stock": 10 },
    { "color": "Ivory", "size": null, "sku": "TB-IVORY", "stock": 3 }
  ]
}
```
- Slug auto-generate dari name jika kosong (normalize: lowercase, hyphen).
- SKU wajib unik → 409 `SKU_EXISTS`.
- Harga: Decimal, 0.01-99999.99.

**PATCH /api/products/[id]** — update asas + variants (replace list variants).
**DELETE /api/products/[id]** — soft delete? Cadangan: set `isActive=false` (JANGAN hard delete jika ada order). Endpoint set inactive. Hard delete hanya jika tiada rujukan.

## 8. Ralat Umum

| Code | HTTP | Maksud |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Zod fail; `issues` disertakan |
| `UNAUTHORIZED` | 401 | Tiada session |
| `FORBIDDEN` | 403 | Session ada, role/izin tidak cukup |
| `NOT_FOUND` | 404 | Resource tiada |
| `OUT_OF_STOCK` | 409 | Variant habis stok |
| `INSUFFICIENT_STOCK` | 409 | Stok tak cukup semasa checkout |
| `SKU_EXISTS` | 409 | SKU duplicate |
| `ALREADY_REVIEWED` | 409 | Review duplicate |
| `ORDER_NOT_COMPLETED` | 403 | Belum layak review |
| `PAYMENT_INVALID` | 422 | Callback payment tidak sah |
| `INTERNAL_ERROR` | 500 | Generic; detail dilog server |

Mesej ralat dalam Bahasa Melayu untuk paparan user (cth. "Stok tidak mencukupi untuk Tudung Bawal Premium (Sage)").
