# DESIGN — Maisara (Design System & Visual Direction)

**Tarikh:** 13 Ogos 2026
**Status:** Source of truth untuk visual design project.
**Skill asas:** design-taste-frontend (anti-slop) · high-end-visual-design (agency execution)

---

## 1. Design Read

> E-commerce butik modest fashion untuk wanita Malaysia, dengan bahasa soft luxury heritage. Editorial-luxury aesthetic, warm palette yang disengajakan, motif warisan Melayu sebagai signature.

**Dials:** DESIGN_VARIANCE 7 · MOTION_INTENSITY 5 · VISUAL_DENSITY 3

| Dial | Nilai | Maksud |
|---|---|---|
| VARIANCE | 7 | Asimetri sedar, layout editorial; bukan grid simetri templat |
| MOTION | 5 | Reveal lembut, hover fizikal; tiada animasi berlebihan |
| DENSITY | 3 | Ruang luas; produk dan tipografi bernafas |

**Anti-generic strategy (3 lapisan):**
1. Motif warisan Melayu (batik/songket/tenun) sebagai tekstur & pattern subtle di seluruh laman.
2. Eksekusi disiplin: serif display dipilih teliti, macro-whitespace, layout editorial.
3. Gold tunggal yang disengajakan, bukan brass default.

---

## 2. Brand Identity

**Maisara** — butik modest fashion, klasik Melayu, rasa heritage.

- Nama: Maisara (makna: kemudahan, keberkatan).
- Wordmark: "Maisara" dalam serif display, huruf kecil, tracking sederhana.
- Mark: monogram ringkas "M" berbentuk geometri kelopak bunga (8 petal, garisan halus). Simple geometric mark sahaja, bukan ilustrasi kompleks.
- Optional flourish: "مياثرا" (Jawi) sebagai elemen kecil pada footer/header untuk lapisan heritage.
- Tagline: "Warisan untuk fesyen harian."

**Voice & copy tone:**
- Bahasa Melayu, hangat, sopan, moden.
- Elak: kata kerja filler (Elevate, Seamless, Unleash), em-dash (—), angka palsu tepat, bahasa puitis yang dipaksa.
- Contoh betul: "Koleksi Tudung Maisara", "Sentuhan warisan untuk fesyen harian", "Dihantar dalam 2-4 hari bekerja".
- Nama pelanggan demo: guna nama Melayu realistik (cth. Nurul Aisyah, Aina Sofea), bukan Jane Doe.

---

## 3. Color System

Satu palet, satu accent (gold). Warm neutral yang disengajakan.

### Tokens

| Token | Hex | Guna |
|---|---|---|
| `--bg` | `#FAF6EF` | Latar utama (off-white warm, lapang) |
| `--surface` | `#F1E9DC` | Surface sekunder, band section |
| `--surface-alt` | `#EAE0CE` | Kawasan motif/pattern, footer |
| `--card` | `#FFFDF8` | Kad elevated |
| `--ink` | `#2C2622` | Teks utama (warm charcoal) |
| `--ink-soft` | `#6E6459` | Teks sekunder, meta |
| `--gold` | `#A8824A` | Accent utama (heritage gold) |
| `--gold-deep` | `#8A6836` | Gold untuk teks, hover |
| `--gold-tint` | `#F5EDDD` | Wash gold, badge background |
| `--success` | `#5F6B4F` | Status berjaya (olive, heritage) |
| `--warning` | `#A8824A` | Stok rendah |
| `--danger` | `#9A4A38` | Error, batal (muted terracotta) |
| `--line` | `#E3D9C8` | Hairline borders |

### Peraturan warna

- Gold adalah SATU-SATUNYA accent. Jangan tambah warna aksen lain.
- Warna hangat konsisten di seluruh laman; jangan fluctuate ke cool grey.
- Teks utama `--ink` pada `--bg`: kontras ~12:1 (AAA).
- Teks `--ink-soft` pada `--bg`: kontras ≥ 4.5:1 (AA).
- Gold button (`--gold` bg + `--card` text): kontras ≥ 4.5:1. Jangan white-on-gold.
- Status colors hanya untuk state (stok, payment, order), bukan hiasan.

---

## 4. Typography

| Peranan | Font | Weight | Saiz |
|---|---|---|---|
| Display / Heading | Cormorant Garamond (serif) | 500-600, italic dibenarkan | `text-5xl md:text-7xl` (hero), `text-3xl md:text-5xl` (section) |
| Body / UI | Plus Jakarta Sans (sans) | 400/500/600 | `text-base`, leading-relaxed |
| Eyebrow / Label | Plus Jakarta Sans uppercase | 500 | `text-[11px] tracking-[0.18em]` |

**Justifikasi serif:** brief eksplisit (soft luxury heritage) + brand heritage Melayu. Cormorant Garamond dipilih kerana elegan, feminin, dan bukan font AI default yang dilarang (Fraunces, Instrument Serif).

**Peraturan tipografi:**
- Heading: `tracking-tight leading-[1.05]`; italic display yang ada descender (y g j p q) guna `leading-[1.1]` + `pb-1` (elak clipping).
- Body: max `65ch` untuk bacaan.
- Emphasis dalam heading: guna italic ATAU bold font SAMA. Jangan campur serif+sans dalam satu headline.
- Eyebrow: max 1 per 3 section. Kebanyakan section tak perlu eyebrow langsung.
- Nombor harga: `tabular-nums`.
- Jangan guna Inter. Jangan guna font mono di storefront (kecuali data admin).

---

## 5. Heritage Motif System (Signature)

Motif adalah signature Maisara. Guna dengan RESTRAINT (subtle, opacity rendah) — motif yang menjerit akan nampak murahan.

### 5.1 Pattern batik geometri (bunga 8-kelopak)

SVG pattern halus, line stroke, bukan fill penuh:

```html
<svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="#A8824A" stroke-width="0.8" opacity="0.5">
    <path d="M60 30 a10 10 0 0 1 20 0 a10 10 0 0 1 -20 0Z"/>
    <path d="M60 90 a10 10 0 0 1 20 0 a10 10 0 0 1 -20 0Z"/>
    <path d="M30 60 a10 10 0 0 1 0 20 a10 10 0 0 1 0 -20Z"/>
    <path d="M90 60 a10 10 0 0 1 0 20 a10 10 0 0 1 0 -20Z"/>
    <path d="M60 60 m-14 0 a14 14 0 1 1 28 0 a14 14 0 1 1 -28 0"/>
  </g>
</svg>
```

Guna sebagai `background-image` (data-URI) dengan `opacity` 3-6% pada: hero, footer, kad kategori, divider section. Pattern mesti halus dan tidak bersaing dengan produk.

### 5.2 Tekstur tenun/songket

CSS halus untuk surface:

```css
.songket-texture {
  background-image: repeating-linear-gradient(
    45deg, rgba(42,38,34,0.025) 0 1px, transparent 1px 6px
  );
}
```

Guna pada `--surface-alt` (footer, band) dan card featured.

### 5.3 Elemen Jawi

"مياثرا" kecil pada footer dan halaman kisah-kami. Font: Amiri (Google Fonts) atau fallback serif. Jangan letak pada setiap halaman; cukup 1-2 tempat.

### 5.4 Di mana motif DIGUNAKAN

| Lokasi | Motif | Opacity |
|---|---|---|
| Hero background | Batik pattern | 4% |
| Kad kategori | Batik pattern di belakang imej | 6% |
| Footer | Batik pattern + songket | 5% |
| Divider section | Garis motif kecil (satu baris pattern) | 40% |
| Kad featured | Songket texture | penuh halus |

### 5.5 Di mana motif TIDAK DIGUNAKAN

- Atas imej produk (ganggu fokus).
- Dalam cart/checkout (kawasan transaksi mesti bersih).
- Dalam form input.
- Admin panel (biar bersih, guna tokens sahaja).

---

## 6. Shape, Radius, Shadow

**Satu sistem shape (didokumenkan):**

| Elemen | Radius |
|---|---|
| Butang, input, search, badge | Pill (`rounded-full`) |
| Kad, modal, drawer | 16px (`rounded-2xl`) |
| Imej dalam kad | 12px (`rounded-xl`) |
| Imej hero editorial | 0 (flush, editorial) ATAU 16px konsisten |

Pilih satu untuk hero (cadangan: flush 0 untuk editorial, dengan kad berlapis untuk kontras).

**Shadow (tinted, bukan hitam):**
- Kad: `shadow-[0_1px_2px_rgba(42,38,34,0.04),0_8px_24px_rgba(42,38,34,0.06)]`
- Elevated (modal, dropdown): `shadow-[0_2px_4px_rgba(42,38,34,0.06),0_16px_48px_rgba(42,38,34,0.10)]`
- Hover kad produk: naikkan ambient shadow + `-translate-y-1` (300ms).
- Jangan guna pure black shadow.

---

## 7. Components

### 7.1 Navigation

- Desktop: bar satu baris, height 64-72px, `border-b border-[--line]`. Logo kiri, nav tengah (Koleksi, Kisah Kami), kanan (Carian, Wishlist, Cart, Login). Jangan edge-to-edge navbar terlekat tanpa sempadan.
- Sticky dengan blur ringan hanya jika melekat (`backdrop-blur` dibenarkan untuk sticky sahaja).
- Mobile: hamburger morph (2 garis → X, rotasi fluid). Full-screen overlay (`bg-[--bg]/90 backdrop-blur`), links reveal staggered (translate-y + opacity, delay 80ms per item).
- Item aktif: gold underline halus, bukan pill berwarna.

### 7.2 Butang

| Variant | Style |
|---|---|
| Primary | `bg-[--gold] text-[--card] rounded-full px-6 py-3 font-medium`; hover `bg-[--gold-deep]`; active `scale-[0.98]` |
| Secondary | `border border-[--ink]/20 text-[--ink] rounded-full px-6 py-3`; hover border-gold text-gold |
| Ghost | Teks sahaja, hover gold; guna untuk link dalaman |
| Icon-in-button | Untuk CTA utama sahaja: arrow dalam circle `w-8 h-8 rounded-full bg-white/20` di kanan dalam butang |

- Label CTA maksimum 3 patah perkataan, satu baris (cth. "Tambah ke Cart", "Lihat Koleksi", "Bayar Sekarang").
- Satu label per intent (jangan "Tambah ke Cart" + "Beli Sekarang" untuk tindakan sama).
- Semua butang: contrast AA, focus ring visible (`focus-visible:ring-2 ring-[--gold]`).

### 7.3 Kad Produk

- Struktur: imej portrait 4:5 (aspect-[4/5]), nama serif, harga, badge stok.
- Hover: imej zoom halus (scale-105, 700ms), reveal "Tambah Cepat" button di atas imej (bawah, pill, gold tint blur). Bukan card yang berubah warna.
- Badge stok: `Stok rendah` (gold tint, pill kecil), `Habis` (ink/20 tint). Tiada badge atas imej produk (skill ban pills on images) — badge di bawah nama, sebagai baris info.
- Harga: `RM 89.00` format tabular-nums.
- Rating: bintang kecil + jumlah review, ink-soft.

### 7.4 Kad Kategori

- Double-bezel (nested): outer shell `bg-[--gold-tint] p-1.5 rounded-2xl` + inner core `bg-[--card] rounded-[calc(1rem-0.375rem)]` — untuk kategori besar.
- Nama kategori dalam serif + bilangan produk (ink-soft).
- Motif batik halus di belakang imej.

### 7.5 Form

- Label di atas input, helper optional, error di bawah input (`text-[--danger] text-sm`).
- Input: `rounded-full` ATAU `rounded-xl` konsisten dengan rule shape (cadangan: pill untuk search, 12px untuk input alamat panjang).
  - Rule: search = pill; form fields = `rounded-xl` (12px). Didokumenkan.
- Focus ring gold. Placeholder kontras ≥ 4.5:1.
- Jangan guna placeholder sebagai label.
- Input select (negeri, kaedah bayar): native select yang distyled ringan.

### 7.6 Badge & Status

- Stok: `Tersedia` (ink-soft teks sahaja), `Stok rendah` (gold tint pill), `Habis` (surface pill).
- Payment: `Berjaya` (success), `Gagal` (danger), `Menunggu` (warning).
- Order: Pending (warning), Diproses (gold), Dihantar (success), Selesai (ink), Dibatalkan (danger).
- Badge = state sebenar sahaja, bukan hiasan. Tiada dot hiasan.

---

## 8. Layout & Spacing

- Container: `max-w-[1400px] mx-auto px-4 md:px-8`.
- Section padding: `py-24 md:py-32` (macro-whitespace; section flagship `py-40`).
- Grid: CSS Grid selalu (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`). Jangan flex math.
- Breakpoints standard: sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536.
- Mobile: semua asimetri collapse ke single column (`w-full px-4 py-8`).
- Jangan guna `h-screen`; guna `min-h-[100dvh]`.

### Homepage (section order & layout diversity — tiada 2 section sama)

1. **Hero — Editorial Split.** Kiri: eyebrow kecil (nama koleksi), headline serif besar max 2 baris, subtext ≤ 20 patah perkataan, 1 CTA. Kanan: imej editorial portrait (model berhijab, warm light). Background: batik pattern 4%. Tiada scroll cue, tiada decoration strip.
2. **Kategori — Asymmetric Grid.** 5 kategori: 2 besar (2fr) + 3 kecil (1fr), bento style. Double-bezel. Motif halus.
3. **Produk Featured — Grid 4 (2x2).** Kad produk standard. Header section: serif + "Lihat Semua" link kanan (bukan split-header; link sahaja).
4. **Testimoni — Editorial Quote.** Satu quote besar serif italic (max 3 baris) + attribution (nama + bandar, contoh "Nurul Aisyah, Kuala Lumpur") + 2 quote kecil samping. Bukan 3 kad sama.
5. **Kisah Kami — Full-width editorial.** Imej lifestyle + teks kisah Maisara + motif songket. CTA "Kenali Maisara".
6. **Footer.** Motif batik 5%, wordmark, Jawi kecil, nav footer, social, copyright.

### Katalog

- Header: tajuk serif + kiraan produk.
- Sidebar filter kiri (desktop) / drawer (mobile): Kategori (radio), Harga (range input), Warna (swatch bulat), Saiz (pill chips).
- Susun: dropdown kanan atas (Popular, Harga: Rendah ke Tinggi, Harga: Tinggi ke Rendah, Terbaru).
- Grid: `lg:grid-cols-3 xl:grid-cols-4`.
- Pagination: "Muat Lagi" button (better untuk e-commerce) atau pagination nombor. Cadangan: load more.

### PDP

- Grid: galeri kiri (7 kolum) + info kanan (5 kolum).
- Galeri: thumbnail vertical (kiri) + imej utama. Mobile: horizontal scroll.
- Info: kategori (link), nama serif besar, harga, rating, deskripsi, variant pickers (Warna: swatch; Saiz: pill), kuantiti (stepper), stok status, CTA "Tambah ke Cart" + wishlist icon, info penghantaran (ringkas, ink-soft).
- Review section di bawah: purata rating + senarai review (nama, tarikh, rating, komen). Form review (untuk user berdaftar, order selesai).
- Produk berkaitan: "Anda Mungkin Suka" — grid 4, layout ringkas.

### Cart & Checkout

- Cart: senarai item (imej kecil 64px, nama, variant, harga, stepper kuantiti, remove), ringkasan kanan (subtotal, penghantaran, jumlah, CTA).
- Checkout: layout 2 kolum (form kiri, ringkasan kanan). Steps: Alamat → Penghantaran → Semakan & Bayar (progress indicator halus, bukan step labels "Step 1/2/3" — guna nama sebenar).
- Kawasan checkout: bersih, TIADA motif (fokus transaksi).
- Payment page (mock FPX): halaman bank simulasi — bersih, logo bank (Maybank/CIMB/Public — text atau simple mark), jumlah besar, butang "Bayaran Berjaya" / "Bayaran Gagal" (untuk demo). Status callback auto.

### Akaun

- Sidebar (Profil, Order, Wishlist) + content. Mobile: tabs.
- Order list: kad setiap order (ID, tarikh, status badge, jumlah, link detail).
- Wishlist: grid produk standard.

### Admin Panel

- Boleh guna tema tersendiri (dark-capable) — dashboard conventions.
- Layout: sidebar kiri (Dashboard, Produk, Order, Stok, Review) + header (user, logout). Mobile: top nav/tabs.
- Data: jadual ringkas (bukan jadual 20-baris tebal; group ikut perlu), kanan atas search/filter.
- Produk form: field grouping jelas (Info asas, Variants, Stok, Imej).
- Semua form admin: validation inline, error jelas.
- Admin ikut design system tokens juga (warna status sama dengan storefront).

---

## 9. Motion & Interaction (MOTION 5)

### Strategi: Motion (library) secara terpilih, CSS untuk selebihnya

E-commerce adalah laman transaksi: motion mesti menambah nilai tanpa jejas prestasi (INP < 200ms) atau mengganggu checkout. Guna `motion/react` (nama baru Framer Motion) HANYA untuk:

| Guna Motion | Komponen |
|---|---|
| Entry reveal (whileInView + stagger) | Hero, section headers, grid produk, kad kategori |
| AnimatePresence | Cart drawer, mobile menu, toast, modal |
| Layout animation | Badge cart count, item cart (reorder) |
| Button micro-physics | Hanya jika perlu (default: CSS) |

| JANGAN guna Motion | Sebab |
|---|---|
| Hover zoom imej produk | CSS cukup, lebih murah |
| Loading skeleton | CSS shimmer |
| Page transitions penuh | Jejas LCP, overkill untuk e-commerce |
| Scroll hijack / pinning di storefront | Gangguan, bukan gaya fashion editorial |
| Marquee berlebihan | Max 1 per halaman, kebanyakan halaman tak perlu |

### Peraturan teknikal

- Motion hanya dalam Client Components leaf (`'use client'`), diasingkan dari Server Components.
- Animate `transform` + `opacity` sahaja. Custom bezier: `cubic-bezier(0.16, 1, 0.3, 1)`.
- Reveal: `initial={{ opacity: 0, y: 16 }}` → `whileInView={{ opacity: 1, y: 0 }}`, `viewport={{ once: true, amount: 0.2 }}`, duration 0.6s, stagger 60-80ms.
- JANGAN `window.addEventListener('scroll')`. Guna `useScroll`/`whileInView`/IntersectionObserver.
- `prefers-reduced-motion`: semua motion collapse ke static (wajib, non-negotiable).
- Jangan animate `top/left/width/height`; `will-change` sparingly.
- Z-index disiplin: sticky nav, modal, overlay, tooltip — dokumen dalam constants.
- Motion entry jangan halang interaksi: pastikan `initial=false` untuk elemen di atas fold yang perlu segera interaktif (cth. CTA hero boleh reveal cepat 300ms).

---

## 10. Imagery & Photography

Fotografi adalah bintang. Design tidak bersaing dengan imej.

**Direction:**
- Model berhijab, wanita Melayu, pelbagai ton kulit. Natural warm light. Background neutral (cream/ivory/outdoor lembut).
- Konsisten: tone, exposure, background. Semua produk dalam mood sama.
- Product shots: 4:5 portrait, model atau flat lay di atas surface warm.
- Editorial hero: 3:4 atau 4:5 portrait, ruang negatif untuk teks.

**Sumber untuk demo (seed data):**
- Generated images (jika tool tersedia) — paling sesuai untuk konsistensi.
- Atau Unsplash/Pexels (search "hijab fashion", "modest fashion", "tudung") dengan seed deskriptif.
- Jangan guna placeholder div atau SVG ilustrasi sebagai imej produk.

**Penyediaan:** 2-4 imej setiap produk; 1 imej utama (card) + galeri (detail).

---

## 11. Dark Mode

**Storefront:** light editorial adalah identity (justifikasi: fashion editorial warm heritage; kategori ini secara konsisten light di Malaysia dan global). Tokens disimpan sebagai CSS variables supaya dark theme boleh ditambah kemudian tanpa refactor.

**Admin panel:** dark mode disokong (dashboard convention) — guna tokens semantic yang sama, swap values.

**Peraturan:** Jangan flip section storefront ke dark di tengah-tengah halaman (theme lock). Pure black/white dilarang; guna off-white/off-black.

---

## 12. Accessibility

- WCAG AA minimum (body ≥ 4.5:1, teks besar ≥ 3:1).
- Focus visible gold ring pada semua interaktif.
- Label bentuk sentiasa ada; error inline.
- Keyboard: semua flow boleh diselesaikan tanpa tetikus (nav, cart, checkout, admin).
- Alt text deskriptif untuk semua imej.
- Reduced motion dihormati.
- Target sentuhan ≥ 44px untuk mobile.

---

## 13. Pre-Flight Checklist (dari skill)

- [ ] ZERO em-dash dalam semua copy.
- [ ] Satu accent (gold) sahaja, konsisten seluruh laman.
- [ ] Satu sistem radius (pill buttons, 16px cards, 12px images).
- [ ] Contrast butang & form AA.
- [ ] CTA satu baris, ≤ 3 patah perkataan, satu label per intent.
- [ ] Serif: Cormorant Garamond (bukan Fraunces/Instrument).
- [ ] Eyebrow ≤ 1 per 3 sections.
- [ ] Tiada 3 kad sama berturut; setiap section layout berbeza.
- [ ] Hero muat viewport (headline ≤ 2 baris, subtext ≤ 20 patah).
- [ ] Real images (bukan placeholder div).
- [ ] Motion semua `transform`/`opacity`, reduced-motion dihormati.
- [ ] Mobile collapse eksplisit setiap section.
- [ ] Tiada scroll cues, tiada decoration strips, tiada version footers.
- [ ] Tiada hand-rolled SVG icons (guna Phosphor/Tabler/Radix).
- [ ] Copy audit: tiada AI-isms, tiada fake numbers, tiada filler verbs.
