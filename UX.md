# UX — Maisara (User Experience & Information Architecture)

**Tarikh:** 13 Ogos 2026

---

## 1. Information Architecture (Sitemap)

```
/                        # Homepage
├── /koleksi             # Katalog (semua produk)
│   ├── /koleksi/tudung
│   ├── /koleksi/baju-kurung
│   ├── /koleksi/dress
│   ├── /koleksi/abaya
│   └── /koleksi/aksesori
├── /produk/[slug]       # PDP
├── /cart                # Cart penuh
├── /checkout            # Checkout (protected flow)
├── /pembayaran/[orderId]# Payment redirect (mock FPX)
├── /order/success       # Order confirmation
├── /log-masuk           # Login
├── /daftar              # Register
├── /akaun               # Dashboard akaun (protected)
│   ├── /akaun/order
│   ├── /akaun/wishlist
│   └── /akaun/profil
├── /admin               # Admin panel (protected, role admin)
│   ├── /admin/dashboard
│   ├── /admin/produk
│   ├── /admin/order
│   ├── /admin/stok
│   └── /admin/review
└── /kisah-kami          # Brand story
```

## 2. User Flows

### Flow A: Browse & Beli (happy path)
```
Home → Koleksi → PDP → Pilih variant → Add to cart
  → Cart → Checkout → Isi alamat → Pilih penghantaran
  → Payment (redirect mock FPX) → Success → Order dalam akaun
```

### Flow B: Payment gagal
```
Checkout → Payment → status GAGAL
  → Mesej jelas + pilihan cuba semula / kembali ke cart
```

### Flow C: Guest → User
```
Browse + add to cart (guest) → Checkout minta log masuk (optional, tidak memaksa)
  → Login/daftar → Cart digabung (merge) → Teruskan checkout
```

### Flow D: Review selepas beli
```
Order selesai → Akaun/order → Tulis review → Pending → Admin approve → Papar di PDP
```

### Flow E: Admin kelola produk
```
Login admin → Dashboard → Produk → Tambah/ubah/buang
  → Variants & stok → Simpan → Nampak di storefront
```

## 3. Design Principles (UX)

1. **Kejelasan dahulu** — harga, stok dan variants sentiasa jelas; tiada kejutan di checkout.
2. **Fokus pada produk** — fotografi produk adalah bintang; UI tidak bersaing dengannya.
3. **Aliran tanpa geseran** — checkout sesingkat mungkin; tiada pendaftaran wajib untuk membeli.
4. **Kepercayaan** — status order, stok dan payment dipaparkan dengan jujur.
5. **Elegan & lembut** — visual soft luxury, konsisten di semua halaman (mood Maisara).

## 4. Key Screen Specifications

### Homepage
- Hero: headline ringkas + imej editorial, CTA ke koleksi.
- Kategori (5): kad imej dengan nama kategori.
- Produk featured: grid 4 (2 baris x 2) atau carousel.
- Testimoni: 3 petikan pendek (max 3 baris).
- Kisah jenama: blok editorial ringkas + CTA.

### Katalog
- Sidebar filter (desktop) / drawer (mobile): kategori, harga, warna, saiz.
- Bar carian + susun (dropdown).
- Grid produk: 3-4 kolum desktop, 2 kolum tablet, 1-2 kolum mobile.
- Produk card: imej, nama, harga, status stok; hover → tukar imej atau tunjuk "Tambah ke cart".

### PDP
- Galeri kiri (thumbnail + imej utama), info kanan.
- Info: nama, harga, rating, deskripsi, pilih warna, pilih saiz, kuantiti, status stok.
- CTA: Tambah ke cart + wishlist.
- Review section di bawah.

### Cart & Checkout
- Cart: senarai item, kuantiti (+/-), jumlah; CTA "Teruskan ke checkout".
- Checkout: 3 langkah jelas (Alamat → Penghantaran → Semakan & Bayar).
- Alamat: validasi setiap field; simpan alamat terakhir untuk user berdaftar.
- Penghantaran: pilih kaedah, tunjuk kos + anggaran masa.
- Semakan: ringkasan penuh + butang "Bayar Sekarang" → redirect ke halaman pembayaran.

### Payment (Mock FPX)
- Halaman simulasi bank: logo bank pilihan, jumlah, butang "Bayaran Berjaya" dan "Bayaran Gagal" (untuk demo).
- Auto-redirect selepas status; callback dikendalikan server.

### Admin
- Layout: sidebar nav (Dashboard, Produk, Order, Stok, Review), header dengan info user.
- Produk: jadual + form; variants sebagai sub-rows/accordion.
- Order: senarai + detail drawer; dropdown status.
- Stok: jadual variants dengan amaran rendah (badge).

## 5. States

Setiap komponen utama perlu handle:
- **Loading:** skeleton mengikut bentuk akhir (bukan spinner).
- **Empty:** mesej + arahan (cth. "Cart kosong — mula membeli-belah").
- **Error:** inline untuk form; contextual untuk operasi.
- **Transisi:** feedback fizikal pada butang (active state).

## 6. Responsive Behaviour

| Section | Desktop (≥1024) | Mobile (<768) |
|---|---|---|
| Nav | Full bar, satu baris | Hamburger + overlay menu |
| Filter | Sidebar kiri | Drawer |
| Grid produk | 3-4 kolum | 2 kolum (1 untuk card besar) |
| Galeri PDP | Thumbnail kiri + imej kanan | Swipe/horizontal scroll |
| Admin | Sidebar kekal | Sidebar collapse / top tabs |
