# Maisara — Butik Modest Fashion (Design Spec)

**Tarikh:** 13 Ogos 2026
**Status:** Approved
**Author:** Sarae (dengan Haris)

---

## 1. Ringkasan

Project e-commerce showcase untuk portfolio freelance Haris. Butik modest fashion Malaysia — brand fiksyen **Maisara** — dibina sebagai full-stack production-quality application:

- Katalog produk multi-kategori dengan variants (warna/saiz)
- Cart, checkout dan payment flow (mock FPX dengan abstraction layer)
- Authentication (customer & admin) dan admin panel penuh
- Inventory / stok management
- Live deployment (Vercel + Postgres)

**Matlamat utama:** menunjukkan full-stack skill (frontend design, backend, auth, payment architecture, testing, security) kepada client freelance Malaysia.

## 2. Matlamat & Kriteria Kejayaan

1. Demo live yang boleh diklik client (Vercel + Neon/Supabase).
2. Code production-quality: testing, security, architecture yang bersih.
3. Design soft luxury elegant yang menonjol dalam portfolio.
4. Mock payment yang realistik tetapi sedia ditukar ke gateway sebenar (BillPlz/ToyyibPay) tanpa ubah code perniagaan.

## 3. Target User

| Role | Penerangan |
|---|---|
| Pelanggan | Wanita Malaysia, pembeli fesyen modest |
| Admin | Pemilik butik (Haris untuk demo) |
| Client freelance | Yang menilai portfolio — menonton demo dan membaca code |

## 4. Feature Scope

### 4.1 Pelanggan

**Homepage**
- Hero (soft luxury, brand storytelling)
- Kategori pilihan (Tudung, Baju Kurung, Dress, Abaya, Aksesori)
- Produk featured / koleksi
- Testimoni
- Kisah jenama (Maisara)

**Katalog produk**
- Senarai produk mengikut kategori
- Filter: kategori, harga, warna, saiz
- Carian (nama produk)
- Susun: popular, harga (rendah→tinggi / tinggi→rendah), terbaru

**Halaman produk (PDP)**
- Galeri gambar (multiple images)
- Variants: warna, saiz
- Status stok (in stock / low stock / out of stock)
- Add to cart, add to wishlist
- Review & rating (paparan)

**Cart & Checkout**
- Cart (drawer + halaman penuh)
- Alamat penghantaran (nama, telefon, alamat, negeri, poskod)
- Pilihan penghantaran (mock: J&T Express / Pos Laju — kadar mengikut negeri)
- Ringkasan order (subtotal, shipping, jumlah)
- Payment: mock FPX — redirect ke halaman pembayaran simulasi, status success/fail
- Order confirmation

**Akaun pengguna**
- Daftar / log masuk (email + password)
- Profil (nama, email, alamat)
- Sejarah order + status (pending, diproses, dihantar, selesai, dibatalkan)
- Wishlist

**Review produk**
- Pelanggan boleh review selepas order selesai
- Rating 1–5 + komen
- Moderasi oleh admin sebelum paparan awam

### 4.2 Admin Panel

**Dashboard**
- Ringkasan: jumlah jualan, bilangan order, revenue
- Order terkini
- Amaran stok rendah (≤ ambang)

**Produk**
- CRUD penuh: produk, variants (warna/saiz), stok, kategori, gambar, harga, status aktif

**Order**
- Senarai order
- Update status: pending → diproses → dihantar → selesai (dan batal)

**Stok / Inventory**
- Lihat stok semua variants
- Tandakan stok rendah

**Review**
- Moderasi: approve / sembunyikan review

## 5. User Flows (Ringkas)

1. **Browse → Beli:** Home → Katalog → PDP → Add to cart → Checkout → Payment (mock FPX) → Success
2. **Akaun:** Register/Login → Sejarah order → Review produk selesai
3. **Admin:** Login admin → Dashboard → Kelola produk/order/stok/review

## 6. Design System — Maisara

| Elemen | Arah |
|---|---|
| Warna | Latar ivory/cream, taupe, gold accent, charcoal (teks) |
| Tipografi | Serif (display/heading) — rasa premium & heritage; Sans-serif (body) |
| Mood | Premium, lembut, heritage — soft luxury elegant |
| Bahasa | Bahasa Melayu; mata wang RM |
| Komponen | shadcn/ui (Radix) — disesuaikan dengan design system |
| Responsif | Mobile-first, penuh pada desktop |

*Palet dan token terperinci akan dikunci dalam `DESIGN.md` semasa fasa implementation.*

## 7. Architecture

### 7.1 Stack

| Lapisan | Teknologi |
|---|---|
| Frontend | Next.js 16 (App Router) + React 19 + TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Auth | Better Auth (email/password, session, role) |
| ORM | Prisma |
| Database | PostgreSQL (Neon/Supabase free tier) |
| Validation | Zod |
| Testing | Vitest (unit) + Playwright (e2e) |
| Deploy | Vercel |

### 7.2 Struktur Folder (Cadangan)

```
maisara/
  prisma/
    schema.prisma
    seed.ts
  src/
    app/
      (shop)/            # halaman awam: home, katalog, PDP, cart, checkout
      (auth)/            # login, register
      admin/             # admin panel (protected)
      api/               # route handlers
    components/
      ui/                # shadcn components
      shop/              # komponen storefront
      admin/             # komponen admin
    lib/
      db.ts              # prisma client
      auth.ts            # better auth config
      payments/          # payment providers
        types.ts
        mock.ts
        index.ts         # provider factory
      validations/       # zod schemas
      utils.ts
    server/
      services/          # business logic (product, order, cart, review)
    types/
```

### 7.3 Prinsip

- Server Components untuk halaman; Route Handlers untuk mutation.
- Business logic dalam `services/` — diuji secara unit, bebas daripada transport (API/UI).
- Payment diakses hanya melalui `PaymentProvider` interface.
- Zod di sempadan API untuk semua input.
- Tiada logic perniagaan dalam komponen UI.

## 8. Data Model (Prisma)

```
User            — Better Auth (id, name, email, passwordHash, role)
Session/Account — Better Auth
Category        — id, name, slug, description, image, order
Product         — id, name, slug, description, price, categoryId,
                  images[], isActive, featured, createdAt
ProductVariant  — id, productId, color, size, sku, stock
CartItem        — id, sessionToken | userId, variantId, quantity
                  (guest guna anonymous sessionToken cookie; digabung
                  ke userId selepas login)
Order           — id, userId, status, subtotal, shippingFee, total,
                  shippingAddress (JSON), shippingMethod, paymentStatus
OrderItem       — id, orderId, variantId, quantity, unitPrice
Payment         — id, orderId, provider, reference, status (pending/paid/failed), url
Review          — id, productId, userId, rating (1-5), comment, status (pending/approved/hidden)
WishlistItem    — id, userId, productId
```

*Relationship: Category 1—N Product; Product 1—N ProductVariant; Product 1—N Review; Order 1—N OrderItem; Order 1—1 Payment; User 1—N Order/Review/WishlistItem.*

## 9. API Design (Route Handlers)

| Endpoint | Method | Auth | Fungsi |
|---|---|---|---|
| `/api/products` | GET | — | Senarai produk (filter/pagination) |
| `/api/products` | POST | admin | Cipta produk |
| `/api/products/[id]` | GET/PATCH/DELETE | admin (PATCH/DELETE) | Detail/ubah/hapus produk |
| `/api/categories` | GET | — | Senarai kategori |
| `/api/cart` | GET/POST/PATCH/DELETE | session | Kelola cart |
| `/api/orders` | POST | customer | Checkout → cipta order + payment |
| `/api/orders` | GET | customer | Sejarah order sendiri |
| `/api/orders/[id]` | GET | customer/admin | Detail order |
| `/api/orders/[id]/status` | PATCH | admin | Update status order |
| `/api/payments/[orderId]` | POST | customer | Initiate payment (mock) |
| `/api/payments/callback` | POST | — | Callback dari provider (mock) |
| `/api/reviews` | GET/POST | customer (POST) | Senarai/cipta review |
| `/api/reviews/[id]` | PATCH | admin | Moderasi review |
| `/api/admin/dashboard` | GET | admin | Data dashboard |
| `/api/admin/stock` | GET | admin | Senarai stok + amaran rendah |

## 10. Payment Abstraction

```ts
// src/lib/payments/types.ts
interface PaymentProvider {
  createPayment(order: Order): Promise<{
    redirectUrl: string; reference: string;
  }>;
  handleCallback(payload: unknown): Promise<{ status: 'paid' | 'failed'; reference: string }>;
  verify(reference: string): Promise<'paid' | 'failed' | 'pending'>;
}
```

- **MockPaymentProvider** — halaman redirect simulasi FPX; butang "Bayaran Berjaya"/"Bayaran Gagal" untuk demo; callback dikendalikan secara dalaman.
- **Factory** `getPaymentProvider()` — memilih provider melalui env/config. Bila SSM tersedia, tambah `BillPlzProvider` / `ToyyibPayProvider` tanpa mengubah code perniagaan.

## 11. Auth & Authorization

- Better Auth: email + password, session cookie HTTP-only.
- Role: `CUSTOMER`, `ADMIN`.
- Halaman admin: guard di middleware + semakan role server-side (double enforcement).
- Semua Route Handlers mutation: semak session + role.
- Rate limiting pada endpoint auth (disediakan Better Auth) dan checkout.

## 12. Security

- Zod validation pada semua input API.
- Prisma parameterized queries (elak SQL injection).
- Tiada secrets di client bundle.
- Admin routes protected dua lapis.
- Error responses tanpa info leakage (log detail ke server, generic ke client).
- Review content disimpan sebagai text; dipaparkan escaped oleh React.
- Payload checkout disahkan server-side (harga dari DB, bukan dari client).
- Ambang stok rendah & zero-stock dikuatkuasakan pada checkout.
- Ambang stok rendah: ≤ 5 unit (boleh dikonfigurasi dalam admin).

## 13. Testing Strategy

**Unit (Vitest)**
- Payment provider (mock create/callback/verify)
- Cart logic (add, update, total)
- Order service (checkout, stok decrement, validation harga)
- Zod schemas

**E2E (Playwright)**
- Flow utama: browse → PDP → cart → checkout → payment success → order kelihatan di akaun
- Payment fail path
- Admin: login, cipta produk, update order status
- Security smoke: akses admin tanpa login ditolak

## 14. Deployment

- Vercel (production) + Neon/Supabase Postgres.
- Seed data: 5 kategori, 20–30 produk dengan variants, 1 admin demo + 1 customer demo, beberapa order contoh.
- Environment: `DATABASE_URL`, `AUTH_SECRET`, `PAYMENT_PROVIDER=mock`, dan lain-lain.
- README: cara setup local, struktur project, akaun demo.

## 15. Acceptance Criteria

- [ ] Demo live berfungsi end-to-end: browse → cart → checkout → payment → order di akaun.
- [ ] Admin boleh kelola produk, variants/stok, order dan review.
- [ ] Design soft luxury elegant, konsisten, responsive (mobile-first).
- [ ] Mock payment realistik; provider swap boleh dilakukan tanpa ubah business logic.
- [ ] Unit + E2E tests pass.
- [ ] Security review bersih (auth, authorization, validation, data exposure).
- [ ] README lengkap dan project dimasukkan ke portfolio (`~/newportfolio`).

---

## 16. Out of Scope (fasa pertama)

- Integrasi gateway payment sebenar (selepas SSM / permintaan client) — abstraction dah sedia.
- i18n (BM/EN) — tambahan kemudian jika perlu.
- Promosi / voucher / diskaun kompleks.
- Marketplace multi-vendor.
- Mobile app.
