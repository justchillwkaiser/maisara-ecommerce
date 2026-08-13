# PRD — Maisara (Butik Modest Fashion)

**Tarikh:** 13 Ogos 2026
**Status:** Approved (asas dari design spec)
**Source of truth:** `docs/superpowers/specs/2026-08-13-maisara-design.md`

---

## 1. Ringkasan Produk

Maisara ialah butik modest fashion dalam talian (brand fiksyen) untuk wanita Malaysia. Pelanggan boleh melayari katalog (tudung, baju kurung, dress, abaya, aksesori), memilih variants (warna/saiz), checkout dengan penghantaran tempatan, dan membayar melalui flow FPX simulasi. Pemilik butik (admin) mengurus produk, stok, order dan review melalui admin panel.

**Tujuan produk:** showcase full-stack untuk portfolio freelance. Bukan produk komersial sebenar.

## 2. Personas

**Pelanggan (Nurul, 28, KL)**
- Beli tudung dan baju kurung secara online untuk kerja dan majlis.
- Mahu laman yang senang dilayari, gambar produk jelas, variants tepat.
- Sensitif kepada kos penghantaran dan tempoh penghantaran.

**Admin (Aminah, 42, butik di Johor)**
- Mahu tambah/ubah produk tanpa bantuan developer.
- Perlu nampak stok dan order dengan jelas.
- Mahu moderasi review pelanggan.

**Client freelance (penilai portfolio)**
- Mahu nampak kualiti code, architecture dan design.
- Mahu demo berfungsi end-to-end tanpa halangan.

## 3. User Stories & Acceptance Criteria

### Pelanggan

**US-1: Melayari katalog**
Sebagai pelanggan, saya mahu melihat senarai produk mengikut kategori, supaya saya boleh cari produk yang saya mahu dengan cepat.
- AC: Produk disenaraikan mengikut kategori (Tudung, Baju Kurung, Dress, Abaya, Aksesori).
- AC: Filter (kategori, harga, warna, saiz), carian nama dan susun (popular/harga/terbaru) berfungsi.
- AC: Harga dipaparkan dalam RM dengan format betul.

**US-2: Lihat detail produk**
Sebagai pelanggan, saya mahu melihat galeri gambar dan pilihan variants produk.
- AC: Galeri gambar (2+ imej setiap produk) boleh dilihat.
- AC: Variants (warna/saiz) boleh dipilih; harga dan stok dikemas kini mengikut variant.
- AC: Status stok dipaparkan (Tersedia / Stok rendah / Habis).
- AC: Produk habis stok tidak boleh ditambah ke cart.

**US-3: Tambah ke cart**
Sebagai pelanggan, saya mahu menambah produk ke cart (tanpa log masuk) dan melihat jumlah keseluruhan.
- AC: Cart boleh diisi tanpa akaun (guest session).
- AC: Kuantiti boleh dikemas kini atau item dibuang.
- AC: Stok disahkan semasa checkout (bukan semasa add-to-cart sahaja).

**US-4: Checkout & bayar**
Sebagai pelanggan, saya mahu checkout dengan alamat penghantaran dan membayar melalui FPX.
- AC: Borang alamat (nama, telefon, alamat, negeri, poskod) dengan validasi penuh.
- AC: Pilihan penghantaran (J&T Express / Pos Laju) dengan kos berbeza mengikut negeri.
- AC: Ringkasan order (subtotal, penghantaran, jumlah) tepat.
- AC: Payment redirect ke halaman simulasi FPX; status success dan fail dikendalikan.
- AC: Harga disahkan server-side (bukan dari client).

**US-5: Sejarah order**
Sebagai pelanggan berdaftar, saya mahu melihat sejarah dan status order saya.
- AC: Order saya disenaraikan dengan status (pending, diproses, dihantar, selesai, dibatalkan).
- AC: Detail order termasuk item, jumlah dan alamat.

**US-6: Review produk**
Sebagai pelanggan, saya mahu menulis review selepas order selesai.
- AC: Review (rating 1-5 + komen) boleh ditulis hanya untuk produk yang telah dibeli dan order selesai.
- AC: Review dipaparkan selepas diluluskan admin.

**US-7: Wishlist**
Sebagai pelanggan berdaftar, saya mahu menyimpan produk dalam wishlist.
- AC: Produk boleh ditambah/buang dari wishlist.
- AC: Wishlist boleh diakses dari halaman akaun.

### Admin

**US-8: Kelola produk**
Sebagai admin, saya mahu menambah, mengubah dan membuang produk serta variants.
- AC: CRUD produk (nama, slug, deskripsi, harga, kategori, gambar, status aktif).
- AC: CRUD variants (warna, saiz, SKU, stok).
- AC: Harga dan stok variants boleh dikemas kini secara individu.

**US-9: Kelola order**
Sebagai admin, saya mahu melihat dan mengemas kini status order.
- AC: Senarai order dengan semua status.
- AC: Status order boleh diubah (diproses → dihantar → selesai, atau batal).
- AC: Stok dikurangkan semasa order dibuat; dibatalkan memulangkan stok.

**US-10: Pantau stok**
Sebagai admin, saya mahu melihat amaran stok rendah.
- AC: Produk/variants dengan stok ≤ 5 ditandakan.
- AC: Dashboard menunjukkan ringkasan stok rendah.

**US-11: Moderasi review**
Sebagai admin, saya mahu meluluskan atau menyembunyikan review.
- AC: Review pending dipaparkan kepada admin.
- AC: Admin boleh approve atau hide review.

## 4. Functional Requirements

| ID | Keperluan |
|---|---|
| FR-1 | Homepage: hero, kategori, produk featured, testimoni, kisah jenama |
| FR-2 | Katalog dengan filter, carian, susun dan pagination |
| FR-3 | PDP dengan galeri, variants, stok, review |
| FR-4 | Cart (guest & user), kuantiti, pengiraan jumlah |
| FR-5 | Checkout: alamat, penghantaran, ringkasan, payment |
| FR-6 | Payment mock FPX: redirect, callback, status |
| FR-7 | Auth: register, login, logout, session |
| FR-8 | Akaun: profil, order history, wishlist |
| FR-9 | Admin: dashboard, produk CRUD, order management, stok, review |
| FR-10 | Role-based access (customer/admin) pada semua route & API |

## 5. Non-Functional Requirements

| Kategori | Keperluan |
|---|---|
| Performance | LCP < 2.5s; INP < 200ms; CLS < 0.1 (Lighthouse) |
| Security | Zod validation; authorization dua lapis (middleware + server); tiada secrets di client; harga & stok disahkan server-side |
| Accessibility | WCAG AA; focus states; keyboard navigation; label bentuk yang jelas |
| Responsive | Mobile-first; pecah ke single-column < 768px |
| Testing | Unit (Vitest) untuk services & payment; E2E (Playwright) untuk flow utama |
| Data | Seed: 5 kategori, 20-30 produk, admin + customer demo |
| Deployment | Vercel + Neon/Supabase Postgres |

## 6. Success Metrics

- Demo berfungsi end-to-end tanpa ralat (browse → checkout → payment → order).
- 100% acceptance criteria lulus.
- Lighthouse ≥ 90 (Performance, Accessibility, Best Practices, SEO).
- Test suite lulus (unit + e2e).

## 7. Out of Scope (fasa pertama)

- Payment gateway sebenar (abstraction sedia; swap bila SSM).
- i18n (BM/EN).
- Voucher/diskaun/promo.
- Multi-vendor/marketplace.
- Mobile app.
