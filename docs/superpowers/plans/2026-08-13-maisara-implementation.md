# Maisara Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bina butik modest fashion e-commerce penuh (storefront, checkout dengan mock FPX, admin panel) sebagai showcase portfolio, deploy ke Vercel + Postgres.

**Architecture:** Next.js 16 App Router, Server-first. Business logic dalam `src/server/services/` (bebas transport, unit-testable). Payment melalui `PaymentProvider` interface dengan `MockPaymentProvider`. Auth Better Auth dengan role CUSTOMER/ADMIN, enforcement dua lapis (middleware + guards). Design ikut DESIGN.md (soft luxury heritage, motif batik, Cormorant Garamond + Plus Jakarta Sans, gold accent tunggal).

**Tech Stack:** Next.js 16 · React 19 · TypeScript strict · Tailwind v4 · shadcn/ui · Better Auth · Prisma · PostgreSQL (Neon/Supabase) · Zod · motion/react · Vitest · Playwright · Vercel

**Spec:**
- `docs/superpowers/specs/2026-08-13-maisara-design.md` (design spec)
- `PRD.md` (user stories, AC)
- `UX.md` (flows, IA)
- `DESIGN.md` (design system — WAJIB untuk semua UI)
- `ARCHITECTURE.md` (layer, struktur)
- `DATABASE.md` (schema)
- `API.md` (kontrak endpoint)
- `AGENTS.md` (rules AI)

## Global Constraints

- Zero em-dash (—) dalam semua copy/UI. Guna hyphen atau pecahkan ayat.
- Semua string user-visible dalam Bahasa Melayu. Harga format `RM 49.00` (`lib/format.ts`).
- Gold (`#A8824A`) satu-satunya accent. Tokens warna dari DESIGN.md, jangan cipta warna ad-hoc.
- Icons: satu family (Phosphor atau Tabler), jangan mix, jangan hand-roll SVG icons.
- Fonts: `next/font` sahaja (Cormorant Garamond + Plus Jakarta Sans). Tiada Google Fonts `<link>`.
- Motion: `motion/react` hanya untuk reveal/AnimatePresence; CSS untuk hover. Reduced motion wajib.
- Harga & stok dikira server-side dari DB, bukan dari payload client.
- Semua mutation API: guard auth dahulu (`requireUser`/`requireAdmin`), Zod validation.
- Kad produk: imej 4:5, nama serif, badge stok di bawah nama (bukan atas imej).
- Motif batik/songket: opacity rendah; JANGAN atas imej produk atau dalam cart/checkout/form.
- Commit conventional (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`), commit kerap selepas setiap task.
- Node 20+, npm. TS strict (tiada `any` tanpa justifikasi).

---

### Task 1: Scaffold Project

**Files:**
- Create: seluruh project base (via create-next-app)
- Create: `.env.example`, `.gitignore` update, `README.md` (skeleton)

**Interfaces:** (asas untuk semua task seterusnya)

- [ ] **Step 1: Scaffold Next.js**

```bash
cd ~/maisara
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
```

Nota: jika folder tak kosong (docs sedia ada), `create-next-app` mungkin refuse. Guna `--force` jika perlu. Pastikan `docs/`, `PRD.md`, `DESIGN.md` dll kekal.

- [ ] **Step 2: Install dependencies**

```bash
npm install prisma @prisma/client better-auth zod motion react-hook-form @hookform/resolvers
npm install -D @types/node vitest @vitejs/plugin-react playwright @playwright/test tsx
npm install @phosphor-icons/react
npx shadcn@latest init -y
npx shadcn@latest add button input badge card dialog sheet select sonner separator skeleton -y
```

- [ ] **Step 3: Setup env template**

Buat `.env.example`:
```
DATABASE_URL="postgresql://user:pass@host:5432/maisara"
AUTH_SECRET="ganti-dengan-random-string"
PAYMENT_PROVIDER="mock"
```
Salin ke `.env` untuk development local (DATABASE_URL boleh guna Postgres local atau Neon; untuk fasa awal SQLite TIDAK — kekal Postgres. Jika tiada Postgres local, guna Neon free tier).

- [ ] **Step 4: Setup Vitest**

Buat `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    globals: true,
  },
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
```

Tambah script dalam `package.json`: `"test": "vitest run"`, `"test:watch": "vitest"`, `"typecheck": "tsc --noEmit"`.

- [ ] **Step 5: Verify scaffold**

Run: `npm run build`
Expected: build lulus.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: scaffold Next.js 16 dengan Tailwind, shadcn, Vitest"
```

---

### Task 2: Prisma Schema, Migrate & Seed

**Files:**
- Create: `prisma/schema.prisma` (guna DATABASE.md section 1, verbatim)
- Create: `prisma/seed.ts`
- Create: `src/lib/db.ts`

**Interfaces:**
- Produces: `src/lib/db.ts` export `db` (PrismaClient singleton)

- [ ] **Step 1: Tulis schema**

Salin schema penuh dari `DATABASE.md` section 1 ke `prisma/schema.prisma`. Pastikan semua model (User, Account, Session, Category, Product, ProductVariant, CartItem, Order, OrderItem, Payment, Review, WishlistItem) + enums (Role, OrderStatus, PaymentStatus, ReviewStatus).

- [ ] **Step 2: db.ts singleton**

`src/lib/db.ts`:
```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

- [ ] **Step 3: Generate client**

Run: `npx prisma generate && npx prisma migrate dev --name init`
Expected: migration berjaya, client dijana.

- [ ] **Step 4: Tulis seed**

`prisma/seed.ts` (jalankan dengan tsx):
- 5 kategori (Tudung, Baju Kurung, Dress, Abaya, Aksesori) dengan slug.
- 24 produk (campuran kategori, 2-4 variants setiap satu, SKU unik, stok realistik termasuk ≤ 5 dan 0).
- 1 admin: `admin@maisara.my` (password: `AdminDemo123!`) — hash guna Better Auth (rujuk Task 3 helper; untuk seed, guna `createAuth` dari better-auth/node atau terus hash password dengan scrypt Better Auth — praktikal: seed selepas Task 3, atau guna placeholder dan update di Task 3).
  - Cadangan: jalankan penuh seed pada penghujung Task 3 (selepas auth config sedia), supaya password hashed betul.
- 2 customer: `nurul@maisara.my`, `aina@maisara.my` (password: `Demo123!`).
- 4 order contoh (status pelbagai) + payment + order items snapshot.
- 5 review (3 approved, 2 pending).

- [ ] **Step 5: Configure seed script**

`package.json`: `"prisma": { "seed": "tsx prisma/seed.ts" }`

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: prisma schema, migration init, seed data"
```

---

### Task 3: Better Auth + Guards + Middleware

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...all]/route.ts`
- Create: `src/server/guards.ts`
- Create: `src/middleware.ts`

**Interfaces:**
- Produces: `auth` (BetterAuth instance) dari `src/lib/auth.ts`; `requireUser()` dan `requireAdmin()` dari `src/server/guards.ts`
- Consumes: Prisma `db` (Task 2)

- [ ] **Step 1: Tulis failing test untuk guards**

`tests/unit/guards.test.ts` — mock session: requireUser kembalikan user jika session wujud, throw `UNAUTHORIZED` jika tidak; requireAdmin throw `FORBIDDEN` jika role bukan ADMIN.

- [ ] **Step 2: Run test, verify fail**

Run: `npm test`
Expected: FAIL (guards belum wujud).

- [ ] **Step 3: Auth config**

`src/lib/auth.ts`:
```ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./db";

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  session: { expiresIn: 60 * 60 * 24 * 7 }, // 7 hari
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "CUSTOMER" },
    },
  },
});
```

`src/app/api/auth/[...all]/route.ts`:
```ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

- [ ] **Step 4: Guards**

`src/server/guards.ts`:
```ts
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { ApiError } from "@/lib/errors"; // Task 10 (atau define di sini — lihat nota)

export async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new ApiError("UNAUTHORIZED", "Sila log masuk dahulu.", 401);
  return session.user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new ApiError("FORBIDDEN", "Akses ditolak.", 403);
  return user;
}
```

Nota: buat `src/lib/errors.ts` dahulu (kelas `ApiError` dengan code, message, status) — rujuk API.md section 8.

- [ ] **Step 5: Middleware**

`src/middleware.ts`:
```ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  if (pathname.startsWith("/admin") && !session) {
    return NextResponse.redirect(new URL("/log-masuk", req.url));
  }
  if (pathname.startsWith("/admin") && session?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (pathname.startsWith("/akaun") && !session) {
    return NextResponse.redirect(new URL("/log-masuk", req.url));
  }
});

export const config = { matcher: ["/admin/:path*", "/akaun/:path*"] };
```

- [ ] **Step 6: Run tests, verify pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 7: Jalankan seed penuh (dengan hash password betul)**

Run: `npx prisma db seed`
Expected: data seed masuk (admin + customer boleh login).

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: better auth, guards, middleware, seed penuh"
```

---

### Task 4: Design Tokens & Base UI

**Files:**
- Modify: `src/app/globals.css` (tokens CSS dari DESIGN.md)
- Modify: `src/app/layout.tsx` (fonts via next/font, metadata)
- Create: `src/lib/format.ts` (formatRM, formatDate)
- Modify: shadcn components (button, input, badge, card) ikut DESIGN.md
- Create: `src/components/shared/motif.tsx` (batik pattern + songket texture utilities)

**Interfaces:**
- Produces: CSS tokens (`--bg`, `--surface`, `--card`, `--ink`, `--ink-soft`, `--gold`, `--gold-deep`, `--gold-tint`, `--success`, `--warning`, `--danger`, `--line`); `formatRM(n: Decimal|number): string`; `formatDate(d: Date): string`
- Consumes: DESIGN.md (warna, typography, radius)

- [ ] **Step 1: Tokens dalam globals.css**

`src/app/globals.css` — tambah `:root` dengan tokens (nilai penuh dari DESIGN.md section 3), dan base styles:
```css
@import "tailwindcss";

:root {
  --bg: #FAF6EF;
  --surface: #F1E9DC;
  --surface-alt: #EAE0CE;
  --card: #FFFDF8;
  --ink: #2C2622;
  --ink-soft: #6E6459;
  --gold: #A8824A;
  --gold-deep: #8A6836;
  --gold-tint: #F5EDDD;
  --success: #5F6B4F;
  --warning: #A8824A;
  --danger: #9A4A38;
  --line: #E3D9C8;
}

body { background: var(--bg); color: var(--ink); }
```

Nota Tailwind v4: guna `@theme` untuk map tokens ke utilities (rujuk docs Tailwind v4: `@theme { --color-gold: #A8824A; }` → guna `bg-gold`). Pastikan shadcn tema dijana menggunakan tokens ini (gantikan values default shadcn).

- [ ] **Step 2: Fonts + metadata**

`src/app/layout.tsx`:
```tsx
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-serif" });
const sans = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-sans" });
```
Set `className={`${serif.variable} ${sans.variable}`}` + metadata (title "Maisara", description, lang="ms"). Font families: `font-serif` → Cormorant, `font-sans` → Plus Jakarta.

- [ ] **Step 3: format.ts + unit test**

`tests/unit/format.test.ts`:
```ts
import { formatRM, formatDate } from "@/lib/format";

describe("formatRM", () => {
  it("format 4900 cents kepada RM 49.00", () => {
    expect(formatRM(4900)).toBe("RM 49.00");
  });
  it("format Decimal prisma", () => {
    expect(formatRM("189.5")).toBe("RM 189.50");
  });
});
```
Implementasi: terima number | string | { toString() }, output `RM X.XX` dengan `toFixed(2)` + `Intl.NumberFormat("ms-MY")`. `formatDate`: `Intl.DateTimeFormat("ms-MY", { dateStyle: "medium" })`.

- [ ] **Step 4: Customize shadcn components**

- `button.tsx`: varian `default` = gold bg + card text, `secondary` = outline ink, radius full (pill), active scale, focus ring gold.
- `input.tsx`: radius 12px, focus ring gold, label di atas (guna component wrapper `FormField` ringkas di `components/shared/form-field.tsx` — label + helper + error).
- `badge.tsx`: variant success/warning/danger ikut tokens.
- `card.tsx`: 16px radius, warm shadow (bukan black).

- [ ] **Step 5: Motif utilities**

`src/components/shared/motif.tsx`: export `BatikPattern` (div dengan background-image data-URI batik, props `opacity`) dan class `songket-texture` (CSS). Guna nilai SVG dari DESIGN.md section 5.1.

- [ ] **Step 6: Run tests + build**

Run: `npm test && npm run build`
Expected: PASS, build lulus.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: design tokens, fonts, base UI, format helpers"
```

---

### Task 5: Layout, Header & Footer

**Files:**
- Create: `src/components/shared/header.tsx` (+ `header-client.tsx` untuk mobile menu dengan motion)
- Create: `src/components/shared/footer.tsx`
- Create: `src/components/shared/cart-button.tsx` (placeholder untuk Task 9)
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Produces: `Header` (Server Component yang render nav; menerima cartCount via prop dari layout nanti), `Footer`
- Consumes: tokens (Task 4), Phosphor icons

- [ ] **Step 1: Header desktop**

`header.tsx`: sticky, `backdrop-blur`, border-b `--line`, height 72px. Logo "Maisara" (font-serif 1.6rem). Nav links: Koleksi, Kisah Kami (+ dropdown kategori dari DB — `db.category.findMany`). Kanan: Cari (icon), Simpan (link /akaun/wishlist), Cart (badge count), Log Masuk (pill outline). Satu baris, elak overflow.

- [ ] **Step 2: Mobile menu (client + motion)**

`header-client.tsx`: hamburger morph (2 garis → X), overlay full-screen `bg-[--bg]/95 backdrop-blur`, links stagger reveal (motion, delay 80ms), AnimatePresence. Reduced motion via `useReducedMotion`.

- [ ] **Step 3: Footer**

`footer.tsx`: bg `--surface-alt` + batik pattern (opacity 5%), wordmark serif, 3 kolum (Koleksi, Bantuan, Syarikat), Jawi "مياثرا" (font Amiri via next/font atau fallback serif), copyright "© 2026 Maisara. Semua hak terpelihara." Bottom bar dengan hairline.

- [ ] **Step 4: Integrasi layout**

`layout.tsx`: render Header + Footer mengelilingi children. Cart button placeholder (count 0) — akan disambung Task 9.

- [ ] **Step 5: Visual check**

Run: `npm run dev`, buka localhost:3000. Semak: nav satu baris, mobile menu berfungsi, footer motif halus. Tutup dev.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: layout, header dengan mobile menu, footer"
```

---

### Task 6: Homepage

**Files:**
- Create: `src/components/shop/hero.tsx` (+ motion)
- Create: `src/components/shop/category-grid.tsx`
- Create: `src/components/shop/product-card.tsx`
- Create: `src/components/shop/featured-products.tsx`
- Create: `src/components/shop/testimonials.tsx`
- Create: `src/components/shop/brand-story.tsx`
- Modify: `src/app/(shop)/page.tsx`

**Interfaces:**
- Produces: `ProductCard` (props: product summary — name, slug, price, image, colors, minStock, avgRating, reviewCount) — DIGUNAKAN SEMULA di katalog, PDP berkaitan, wishlist
- Consumes: `db` (Task 2), motion (Task 4)

- [ ] **Step 1: ProductCard (reusable)**

`product-card.tsx`: imej 4:5 (next/image, aspect-[4/5]), hover zoom CSS (scale-105 700ms), hover reveal "Tambah ke Cart" (pill, bg `--card`/94) — action sambung Task 9 (placeholder button). Nama serif 1.2rem, harga tabular-nums, badge stok (Stok rendah gold-tint / Habis surface). Badge di bawah nama. Star rating kecil.

- [ ] **Step 2: Hero**

`hero.tsx`: grid 2 kolum (teks kiri, imej kanan), batik pattern opacity 4% bg. Eyebrow "Koleksi Baharu" (gold-deep, uppercase tracking). H1 serif "Warisan untuk *fesyen harian*" (italic emphasis, leading-[1.1] + pb-1). Subtext ≤ 20 patah. CTA "Lihat Koleksi" (btn-primary, arrow dalam circle). Imej: next/image priority, 4:5, radius 16px, shadow warm, frame offset (border gold 35% translate 16px). Motion: fade-up 600ms, CTA reveal 300ms (initial=false tidak diperlukan untuk hero CTA — ia di atas fold; guna reveal pantas).

- [ ] **Step 3: Category grid (asymmetric)**

`category-grid.tsx`: query `db.category.findMany({ orderBy: { order: "asc" }, include: { _count: { select: { products: { where: { isActive: true } } } } } })`. Grid 4 kolum: Tudung span 2x2 (besar), 4 lain 1x1. Double-bezel (outer `bg-[--gold-tint] p-1.5 rounded-2xl`, inner). Label serif + count "28 produk". Batik opacity 8% belakang imej. Stagger reveal.

- [ ] **Step 4: Featured products**

`featured-products.tsx`: query 4 produk `featured: true, isActive: true` (+ variants min stock, reviews avg). Header: "Pilihan Maisara" serif + link "Lihat Semua" (gold-deep). Grid 4 kolum ProductCard.

- [ ] **Step 5: Testimonials**

`testimonials.tsx`: bg `--surface`, grid 2fr/1fr. Kiri: quote besar serif italic (max 3 baris) + attribution "Nurul Aisyah, Kuala Lumpur". Kanan: 2 quote kecil + cite. Data statik (seed tidak perlu model testimonial — hardcode dalam komponen, nama Melayu realistik).

- [ ] **Step 6: Brand story**

`brand-story.tsx`: grid 1fr/1fr. Kiri imej 4:3 (radius 16), kanan Jawi "مياثرا" + H2 "Kisah Maisara" + 1 perenggan + CTA "Kenali Maisara". Songket texture halus pada section.

- [ ] **Step 7: Integrasi page**

`page.tsx`: Server Component — fetch kategori + featured + render semua section dalam order (Hero → Kategori → Featured → Testimoni → Kisah). Metadata: title "Maisara — Butik Modest Fashion".

- [ ] **Step 8: Visual check + Lighthouse**

Run: `npm run dev`, semak semua section + motion + mobile. Lighthouse performance ≥ 90 (hero image priority, no CLS).

- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "feat: homepage penuh (hero, kategori, featured, testimoni, kisah)"
```

---

### Task 7: Katalog, Filter, Carian, Susun

**Files:**
- Create: `src/server/services/product.service.ts` (listProducts)
- Create: `src/components/shop/filter-sidebar.tsx` (+ client drawer mobile)
- Create: `src/components/shop/sort-select.tsx`
- Create: `src/app/(shop)/koleksi/page.tsx`
- Create: `src/app/(shop)/koleksi/[category]/page.tsx`
- Create: `src/app/api/products/route.ts`

**Interfaces:**
- Produces: `listProducts(params: ProductQuery): Promise<ProductListResult>` — `ProductQuery = { category?, search?, minPrice?, maxPrice?, color?, size?, sort?, page?, pageSize? }`, `ProductListResult = { items: ProductSummary[], total, page, pageSize }` (guna API.md GET /api/products response shape)
- Consumes: `ProductCard` (Task 6)

- [ ] **Step 1: Tulis failing test untuk listProducts**

`tests/unit/product.service.test.ts` — guna mock db (vitest `vi.mock("@/lib/db")`): test filter kategori, search, sort harga, pagination. Mulakan dengan 2 test asas (filter + pagination).

- [ ] **Step 2: Run, verify fail**

Run: `npm test` — Expected: FAIL.

- [ ] **Step 3: Implementasi listProducts**

`product.service.ts`: terima ProductQuery tervalidasi (Zod schema `productQuerySchema` dalam `lib/validations/product.ts`). Query Prisma dengan `where` dinamik (category slug → categoryId lookup, search contains mode insensitive, color/size via variants some, harga gte/lte). Include: category, variants (untuk colors/sizes/minStock), reviews `_avg.rating` + `_count` (approved sahaja). Pagination skip/take. Sort: `popular` (default — order by review count desc atau created desc), `price-asc/desc`, `newest` (createdAt desc).

- [ ] **Step 4: Run, verify pass**

Run: `npm test` — Expected: PASS.

- [ ] **Step 5: API route**

`src/app/api/products/route.ts`: parse searchParams → Zod validate → call listProducts → Response 200 JSON. Invalid → 400 `VALIDATION_ERROR`.

- [ ] **Step 6: Filter sidebar**

`filter-sidebar.tsx` (Server): kategori (radio dari DB), harga (min/max input), warna (swatch bulat — dari distinct variant colors dalam kategori), saiz (pill chips). Mobile: drawer (client, AnimatePresence). Query params via `<Link href>` (searchParams-based, bukan state — supaya shareable & server-rendered).

- [ ] **Step 7: Sort select**

`sort-select.tsx` (client): dropdown pilihan susun → navigate dengan searchParams baru. Label: "Popular", "Harga: Rendah ke Tinggi", "Harga: Tinggi ke Rendah", "Terbaru". (Elak label "Step/Stage" style.)

- [ ] **Step 8: Halaman koleksi**

`koleksi/page.tsx` + `koleksi/[category]/page.tsx`: terima searchParams, call listProducts, render header (tajuk serif + kiraan "28 produk"), filter sidebar + grid (3-4 kolum), "Muat Lagi" button (client, append page). Empty state: "Tiada produk ditemui. Cuba tukar filter." Loading: skeleton grid.

- [ ] **Step 9: Test + build + commit**

Run: `npm test && npm run build` — PASS. Commit: `feat: katalog dengan filter, carian, susun`

---

### Task 8: PDP (Detail Produk)

**Files:**
- Create: `src/server/services/product.service.ts` (tambah getProductBySlug)
- Create: `src/components/shop/product-gallery.tsx`
- Create: `src/components/shop/variant-picker.tsx` (client)
- Create: `src/components/shop/quantity-stepper.tsx` (client)
- Create: `src/components/shop/add-to-cart.tsx` (client — sambung Task 9)
- Create: `src/components/shop/review-list.tsx` + `review-form.tsx`
- Create: `src/app/(shop)/produk/[slug]/page.tsx`
- Create: `src/app/api/products/[id]/route.ts`
- Create: `src/app/api/reviews/route.ts` (GET)

**Interfaces:**
- Produces: `getProductBySlug(slug): Promise<ProductDetail | null>` — termasuk variants (id, color, size, sku, stock), reviews approved, category, images. `ProductDetail` shape ikut API.md GET /api/products/[id]
- Consumes: `ProductCard`, format helpers, guards (POST review)

- [ ] **Step 1: Test getProductBySlug**

`tests/unit/product.service.test.ts` (tambah): mock db — return produk dengan variants; not found → null. FAIL dulu.

- [ ] **Step 2: Implementasi**

`getProductBySlug`: `db.product.findUnique({ where: { slug }, include: { category, variants, reviews: { where: { status: "APPROVED" }, include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" } } } })`. Jika `!product || !product.isActive` → null. Kira avgRating + reviewCount.

- [ ] **Step 3: API routes**

`GET /api/products/[id]`: lookup by id (untuk admin/cart) → ProductDetail; 404 jika tiada. `GET /api/reviews?productId=` → reviews approved (public).

- [ ] **Step 4: Product gallery**

`product-gallery.tsx`: thumbnail vertical kiri (buttons) + imej utama (next/image). State imej aktif (client). Mobile: horizontal scroll thumbnails. Transform/opacity sahaja untuk peralihan imej (motion crossfade ringan).

- [ ] **Step 5: Variant picker + stepper**

`variant-picker.tsx` (client): pilih warna (swatch bulat, gold ring untuk aktif), pilih saiz (pill chips, disabled jika habis stok). Kombinasi warna+saiz → variantId + stock. Jika variant stok 0 → disabled + label "Habis". Harga/ketersediaan update mengikut pilihan.
`quantity-stepper.tsx`: stepper 1-99 (cap stok variant terpilih).

- [ ] **Step 6: Add to cart (placeholder connect)**

`add-to-cart.tsx`: butang "Tambah ke Cart" (btn-primary penuh, pill), disabled jika tiada variant dipilih atau stok 0. Action → POST /api/cart (Task 9; buat fail dahulu dengan fungsi yang panggil API, wire penuh di Task 9).

- [ ] **Step 7: Review display**

`review-list.tsx`: purata rating (nombor + bintang) + kiraan. Senarai review: nama, tarikh (formatDate), bintang, komen. Empty: "Belum ada review. Jadilah yang pertama." `review-form.tsx`: rating picker (5 bintang) + textarea, submit POST /api/reviews (Task 11 wire auth; sedia UI).

- [ ] **Step 8: Halaman PDP**

`produk/[slug]/page.tsx`: generateMetadata (nama produk, deskripsi). Layout: grid 7/5 (galeri kiri, info kanan). Info: kategori link, nama serif besar, harga, rating, deskripsi, variant pickers, stepper, stok status, AddToCart + wishlist icon (Task 11), info penghantaran ringkas (ink-soft: "Dihantar dalam 2-4 hari bekerja"). Bawah: review section + "Anda Mungkin Suka" (4 produk kategori sama, ProductCard). 404 jika tiada.

- [ ] **Step 9: Test + build + commit**

Run: `npm test && npm run build`. Commit: `feat: PDP dengan galeri, variants, review`

---

### Task 9: Cart (Service, API, Drawer)

**Files:**
- Create: `src/server/services/cart.service.ts`
- Create: `src/app/api/cart/route.ts`, `src/app/api/cart/[itemId]/route.ts`
- Create: `src/components/shared/cart-context.tsx` (client provider)
- Create: `src/components/shared/cart-drawer.tsx` (client, AnimatePresence)
- Modify: `src/components/shared/cart-button.tsx` (wire)

**Interfaces:**
- Produces: `getCart(ctx: { userId?: string, sessionId?: string }): Promise<CartResult>`; `addToCart(ctx, { variantId, quantity }): Promise<CartResult>`; `updateCartItem(ctx, itemId, quantity)`; `removeCartItem(ctx, itemId)`; `mergeCart(userId, sessionId)` (panggil masa login). `CartResult` shape ikut API.md GET /api/cart
- Consumes: `db`, guards (POST /api/cart), Zod schema `cartItemSchema`

- [ ] **Step 1: Test cart.service (mock db)**

`tests/unit/cart.service.test.ts`: addToCart item baru (create), item wujud (increment), stok habis (throw `OUT_OF_STOCK`), update quantity cap stok, merge cart (session → user, gabung quantity). Mulakan 3 test.

- [ ] **Step 2: Run, verify fail**

Run: `npm test`.

- [ ] **Step 3: Implementasi cart.service**

Guest context: cookie `cart-session` (nilai random string, set di helper `lib/cart-session.ts` — set cookie httpOnly? Tidak: client perlu tahu sessionId untuk POST; guna cookie biasa (bukan httpOnly) atau baca cookie di server untuk semua mutasi. Keputusan: semua mutasi cart melalui server; sessionId dibaca dari cookie di server (httpOnly OK). Set cookie pertama kali di GET /api/cart jika tiada.) Semua operasi cart guna Prisma transaction bila perlu. Unique constraints (`@@unique([sessionId, variantId])` / `[userId, variantId]`) — guna `upsert` dengan increment.

- [ ] **Step 4: API routes**

`GET /api/cart` (baca cookie, return CartResult + subtotal), `POST /api/cart` (Zod validate, add, 409 OUT_OF_STOCK), `PATCH /api/cart/[itemId]`, `DELETE /api/cart/[itemId]`. Guna pattern helper `getCartContext()` (dari cookies + session) dalam `lib/cart-context.ts`.

- [ ] **Step 5: Cart context (client)**

`cart-context.tsx`: React context — state `{ items, subtotal, itemCount, isOpen }`, fungsi `refresh()`, `open()`, `close()`. Provider panggil GET /api/cart pada mount + selepas mutasi. Semua komponen "Tambah ke Cart" panggil `add()` dari context (POST /api/cart → refresh → open drawer).

- [ ] **Step 6: Cart drawer**

`cart-drawer.tsx`: Sheet (shadcn) dari kanan, AnimatePresence. Senarai item (imej 64px, nama, variant color/size, harga, stepper, remove icon), subtotal, CTA "Teruskan ke Checkout" (→ /checkout, memerlukan login — redirect ke log-masuk dengan callback). Empty state: "Cart kosong. Mula membeli-belah." + CTA ke koleksi. Layout animation untuk reorder.

- [ ] **Step 7: Merge pada login**

Dalam Better Auth `databaseHooks` (signIn) atau hook session create — panggil `mergeCart(userId, sessionId)` apabila user login dengan cart session wujud. (Rujuk Better Auth docs untuk hook yang sesuai.)

- [ ] **Step 8: Wire add-to-cart + cart button**

`add-to-cart.tsx`: guna context. `cart-button.tsx`: badge count (layout animation motion) + open drawer.

- [ ] **Step 9: Test + build + commit**

Run: `npm test && npm run build`. Commit: `feat: cart penuh (service, API, drawer, merge)`

---

### Task 10: Checkout, Order Service & Payment Mock

**Files:**
- Create: `src/server/services/order.service.ts`
- Create: `src/server/services/payment.service.ts`
- Create: `src/lib/payments/types.ts`, `src/lib/payments/mock.ts`, `src/lib/payments/index.ts`
- Create: `src/lib/validations/order.ts` (Zod schemas: alamat, checkout)
- Create: `src/app/api/orders/route.ts`, `src/app/api/orders/[id]/route.ts`
- Create: `src/app/api/payments/[orderId]/route.ts`, `src/app/api/payments/callback/route.ts`
- Create: `src/app/(shop)/checkout/page.tsx` + `src/components/shop/checkout-form.tsx` (client, react-hook-form)
- Create: `src/app/(shop)/pembayaran/[orderId]/page.tsx` (mock FPX page)
- Create: `src/app/(shop)/order/success/page.tsx`
- Create: `src/lib/shipping.ts` (kadar penghantaran)

**Interfaces:**
- Produces:
  - `shippingRates(method, state): number` — J&T Express: RM 8 (Semenanjung) / RM 12 (Sabah Sarawak); Pos Laju: RM 7 / RM 11. Negeri dikumpul: Semenanjung (11 negeri) vs Sabah/Sarawak/Labuan.
  - `createOrder(userId, input: { shippingAddress, shippingMethod }): Promise<{ orderId, paymentReference, redirectUrl }>` — transaction: semak stok, kira dari DB, kurangkan stok, cipta Order/OrderItem/Payment, initiate payment.
  - `initiatePayment(orderId, userId): Promise<{ redirectUrl }>`
  - `handlePaymentCallback(payload): Promise<{ status }>` — verify + update.
- Consumes: guards, Zod schemas, db, `getCart` (Task 9)

- [ ] **Step 1: Test shipping**

`tests/unit/shipping.test.ts`: J&T Semenanjung = 8, Sabah = 12; Pos Laju Semenanjung = 7. FAIL → implement `src/lib/shipping.ts` → PASS.

- [ ] **Step 2: Test MockPaymentProvider**

`tests/unit/payments/mock.test.ts`: createPayment → redirectUrl `/pembayaran/[orderId]` + reference `MOCK-...`; handleCallback `{reference, status:"paid"}` → verify ok; unknown reference → throw `PAYMENT_INVALID`. FAIL → implement `types.ts` + `mock.ts` + `index.ts` (getPaymentProvider) → PASS.

- [ ] **Step 3: Test createOrder**

`tests/unit/order.service.test.ts` (mock db, mock payments): 
- checkout berjaya: kira subtotal dari DB, shipping, total, kurangkan stok, order + items + payment PENDING, initiate payment.
- stok tak cukup → throw `INSUFFICIENT_STOCK` (tiada order dicipta).
- cart kosong → throw `EMPTY_CART`.
FAIL → implement `order.service.ts` + `payment.service.ts` → PASS.

- [ ] **Step 4: Zod schemas**

`lib/validations/order.ts`: `shippingAddressSchema` (name 3-100, phone regex `^01[0-9]{7,9}$`, address 5-200, state enum 14 negeri, postcode `^[0-9]{5}$`), `checkoutSchema`, `callbackSchema` (`{ reference: string, status: "paid" | "failed" }`).

- [ ] **Step 5: API routes**

- `POST /api/orders` (requireUser): validate → createOrder → 201 `{ orderId, paymentReference, redirectUrl }`.
- `GET /api/orders` (requireUser): sejarah user (items count, status, total).
- `GET /api/orders/[id]` (requireUser/requireAdmin): detail + items snapshot + payment. Customer hanya order sendiri.
- `POST /api/payments/[orderId]` (requireUser): initiate semula (payment PENDING/FAILED sahaja).
- `POST /api/payments/callback`: handlePaymentCallback → 200; invalid → 422 `PAYMENT_INVALID`. Idempotent.

- [ ] **Step 6: Checkout page + form**

`checkout/page.tsx` (requireUser — redirect /log-masuk jika tiada session; baca cart, jika kosong redirect /cart). `checkout-form.tsx` (react-hook-form + zodResolver): 3 langkah dalam satu halaman dengan progress (nama sebenar: "Alamat" → "Penghantaran" → "Semakan & Bayar"): 
- Alamat: name, phone, address, state (select), postcode.
- Penghantaran: 2 pilihan (radio kad: J&T Express RM 8/12, Pos Laju RM 7/11 + "2-4 hari bekerja"), kos dikira ikut negeri.
- Semakan: ringkasan item + alamat + jumlah (subtotal, shipping, total). Butang "Bayar Sekarang" → POST /api/orders → redirect ke redirectUrl.
Ringkasan order di kanan (sticky). Error inline per field; error global (toast) untuk OUT_OF_STOCK.

- [ ] **Step 7: Mock FPX page**

`pembayaran/[orderId]/page.tsx`: semak order + payment (requireUser). Layout bersih (tiada motif): "Bayaran melalui FPX" — bank pilihan (Maybank, CIMB, Public Bank, Bank Islam — teks sahaja, bukan logo), jumlah besar, reference. Dua butang demo: "Bayaran Berjaya" dan "Bayaran Gagal" → POST /api/payments/callback → redirect /order/success (atau /order/success?status=gagal atau halaman gagal — ikut UX.md Flow B: mesej jelas + cuba semula).

- [ ] **Step 8: Success page**

`order/success/page.tsx`: confirmation — "Terima kasih! Order anda diterima.", no. order, ringkasan, status "Menunggu pemprosesan", CTA ke akaun/order. (Jika gagal: halaman/state dengan mesej "Pembayaran tidak berjaya" + butang "Cuba Semula" → /pembayaran/[orderId].)

- [ ] **Step 9: Test + build + e2e asas**

Run: `npm test && npm run build`. (E2E penuh di Task 13.)

- [ ] **Step 10: Commit**

```bash
git add -A && git commit -m "feat: checkout, order service, payment mock FPX"
```

---

### Task 11: Halaman Auth, Akaun, Wishlist & Review

**Files:**
- Create: `src/app/(auth)/log-masuk/page.tsx`, `src/app/(auth)/daftar/page.tsx` + client forms (`login-form.tsx`, `register-form.tsx`)
- Create: `src/server/services/wishlist.service.ts` + API `src/app/api/wishlist/route.ts`
- Create: `src/app/akaun/page.tsx`, `src/app/akaun/order/page.tsx`, `src/app/akaun/order/[id]/page.tsx`, `src/app/akaun/wishlist/page.tsx`, `src/app/akaun/profil/page.tsx`
- Create: `src/app/api/reviews/route.ts` (POST) + `src/app/api/reviews/[id]/route.ts` (PATCH admin, Task 12 wire)
- Modify: `review-form.tsx` (wire auth + submit)

**Interfaces:**
- Produces: `addToWishlist(userId, productId)`, `removeFromWishlist(userId, productId)`, `getWishlist(userId): Promise<WishlistItem[]>`; `createReview(userId, input): Promise<Review>` (semak order COMPLETED + unique)
- Consumes: Better Auth (client `signIn.email`), guards, db

- [ ] **Step 1: Login/Register forms**

Client forms guna Better Auth client (`better-auth/react` — `signIn.email({ email, password })`, `signUp.email({ name, email, password })`). Style ikut DESIGN.md (input pill? — rule: form fields 12px radius, label atas, error bawah). Selepas sign in: `router.push(callbackUrl ?? "/")` + `refresh()` cart (merge Task 9). Password min 8 chars. Mesej error BM.

- [ ] **Step 2: Test wishlist.service**

`tests/unit/wishlist.service.test.ts` (mock db): add, remove, duplicate (upsert), get list. FAIL → implement → PASS.

- [ ] **Step 3: Wishlist API + UI**

`/api/wishlist` (requireUser): GET (list produk + variant info ringkas), POST `{ productId }`, DELETE `[productId]`. UI: icon hati pada PDP (toggle, motion scale), halaman akaun/wishlist (grid ProductCard + remove).

- [ ] **Step 4: Akaun dashboard**

`akaun/page.tsx` (requireUser): sidebar (Profil, Order, Wishlist — mobile tabs). Ringkasan: nama, email, jumlah order, wishlist count.

- [ ] **Step 5: Order history + detail**

`akaun/order/page.tsx`: senarai order (ID, tarikh formatDate, status badge, jumlah, link). `akaun/order/[id]`: items (imej, snapshot nama/variant, qty, harga), alamat, kaedah penghantaran, payment status, jumlah penuh.

- [ ] **Step 6: Review submit (wire)**

`review-form.tsx`: guna session (semak login; jika tidak → CTA log masuk). Submit POST /api/reviews (requireUser): Zod (rating 1-5, comment 10-1000), semak order COMPLETED (409 `ORDER_NOT_COMPLETED`), unique (409 `ALREADY_REVIEWED`). Success → toast "Review dihantar. Menunggu kelulusan."

- [ ] **Step 7: Test + build + commit**

Run: `npm test && npm run build`. Commit: `feat: auth pages, akaun, wishlist, review submit`

---

### Task 12: Admin Panel

**Files:**
- Create: `src/app/admin/layout.tsx` (sidebar nav, guard requireAdmin di server)
- Create: `src/app/admin/page.tsx` (dashboard) + `src/app/api/admin/dashboard/route.ts`
- Create: `src/app/admin/produk/page.tsx`, `produk/baru/page.tsx`, `produk/[id]/page.tsx` + `src/components/admin/product-form.tsx`
- Create: `src/app/api/products/route.ts` (POST admin), `src/app/api/products/[id]/route.ts` (PATCH/DELETE admin)
- Create: `src/app/admin/order/page.tsx` + `src/app/api/orders/[id]/status/route.ts`
- Create: `src/app/admin/stok/page.tsx` + `src/app/api/admin/stock/route.ts`
- Create: `src/app/admin/review/page.tsx` + wire `PATCH /api/reviews/[id]`
- Create: `src/server/services/dashboard.service.ts`

**Interfaces:**
- Produces: `getDashboardStats(): Promise<{ stats, recentOrders, lowStockItems }>` (API.md shape); `updateOrderStatus(orderId, status)` (transition rules + refund stock on CANCELLED); `createProduct(input)` / `updateProduct(id, input)` (Zod: productSchema + variantSchema, SKU unique); `moderateReview(id, status)`
- Consumes: guards (requireAdmin), db, validations

- [ ] **Step 1: Test dashboard.service**

`tests/unit/dashboard.service.test.ts` (mock db): stats (totalOrders, totalRevenue PAID sahaja, pendingOrders, lowStockCount ≤ 5), recentOrders 5, lowStockItems. FAIL → implement → PASS.

- [ ] **Step 2: Test updateOrderStatus**

`tests/unit/order.service.test.ts` (tambah): transition sah (PENDING→PROCESSING→SHIPPED→COMPLETED), invalid transition throw `INVALID_TRANSITION`, CANCELLED pulangkan stok. FAIL → implement → PASS.

- [ ] **Step 3: Admin layout + guard**

`admin/layout.tsx`: Server Component panggil `requireAdmin()` (redirect /log-masuk jika tiada session — middleware handle; guard kedua server-side). Sidebar: Dashboard, Produk, Order, Stok, Review + user info + logout. Mobile: top tabs.

- [ ] **Step 4: Dashboard page**

`admin/page.tsx`: 4 kad stats (Jumlah Order, Revenue, Order Pending, Stok Rendah), jadual order terkini (5), senarai stok rendah (badge). Data dari `getDashboardStats()`.

- [ ] **Step 5: Produk CRUD**

`product-form.tsx` (client, react-hook-form): Info asas (nama, slug auto, deskripsi, harga, kategori select, featured toggle, images URL list), Variants (dynamic list: color, size, sku, stock; tambah/buang row). Submit → POST/PATCH. Error inline + toast (SKU_EXISTS). `produk/page.tsx`: jadual (imej kecil, nama, harga, kategori, stok min, status aktif, edit link) + "Tambah Produk" CTA. Soft delete: butang "Nyahaktif" → PATCH `{ isActive: false }` (JANGAN hard delete jika ada order). API: POST /api/products (requireAdmin, Zod), PATCH/DELETE /api/products/[id].

- [ ] **Step 6: Order management**

`admin/order/page.tsx`: jadual order (ID, customer, tarikh, jumlah, status badge, aksi). Detail expandable (items, alamat). Status change: dropdown (transition valid sahaja — invalid disabled) → PATCH /api/orders/[id]/status (requireAdmin). Toast success/error.

- [ ] **Step 7: Stok page**

`admin/stok/page.tsx`: jadual variants (produk, warna/saiz, SKU, stok, badge "Stok Rendah" jika ≤ 5, "Habis" jika 0). Filter lowOnly. Inline edit stok (number input + save) → PATCH /api/products/[id] variants.

- [ ] **Step 8: Review moderasi**

`admin/review/page.tsx`: senarai review (pending dulu, tab approved/hidden), papar rating + komen + produk + user. Aksi: Approve / Sembunyikan → PATCH /api/reviews/[id] (requireAdmin).

- [ ] **Step 9: Test + build + commit**

Run: `npm test && npm run build`. Commit: `feat: admin panel (dashboard, produk, order, stok, review)`

---

### Task 13: E2E Tests, Polish & Audit

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/buy-flow.spec.ts`, `tests/e2e/admin.spec.ts`, `tests/e2e/security.spec.ts`
- Modify: fix mana-mana isu yang ditemui

**Interfaces:** (tiada yang baru — verification task)

- [ ] **Step 1: Playwright config**

`playwright.config.ts`: baseURL `http://localhost:3000`, webServer `npm run dev` (atau build+start), project chromium. Test data: guna seed; reset DB sebelum suite (script teardown).

- [ ] **Step 2: Buy flow E2E**

`buy-flow.spec.ts`: 
- Login sebagai nurul → browse koleksi → buka PDP → pilih variant → tambah ke cart → drawer terbuka → checkout → isi alamat → pilih J&T → Bayar Sekarang → halaman FPX → Bayaran Berjaya → order/success → akaun/order nampak order baru dengan status PENDING.
- Flow gagal: Bayaran Gagal → mesej jelas → cuba semula berfungsi.

- [ ] **Step 3: Admin E2E**

`admin.spec.ts`: login admin → dashboard stats nampak → cipta produk baru (dengan variant) → nampak di storefront → update order status → approve review.

- [ ] **Step 4: Security smoke E2E**

`security.spec.ts`: tanpa login: /admin redirect ke /log-masuk; /akaun redirect; POST /api/orders → 401; POST /api/products → 401. Login customer: /admin → redirect (403/redirect); POST /api/products → 403.

- [ ] **Step 5: Copy & design audit**

Semak semua copy: zero em-dash, tiada AI-isms, CTA ≤ 3 patah, satu label per intent. Semak contrast (butang gold vs card text), reduced motion (toggle OS setting — semua animasi static), mobile (iPhone viewport: nav, grid, checkout).

- [ ] **Step 6: Lighthouse**

Run Lighthouse (production build): Performance ≥ 90, Accessibility ≥ 90, Best Practices ≥ 90, SEO ≥ 90. Fix isu.

- [ ] **Step 7: Run semua test**

Run: `npm test && npx playwright test`
Expected: semua PASS.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "test: e2e penuh (buy flow, admin, security) + audit polish"
```

---

### Task 14: Deployment & README

**Files:**
- Create: `README.md` (penuh)
- Modify: `.env.example` (final)
- Deploy: Vercel + Neon/Supabase

**Interfaces:** (deployment)

- [ ] **Step 1: README**

`README.md`: ringkasan project, stack, features (storefront, admin, payment mock), screenshot (dari mockup/homepage live), setup local (env, prisma migrate, seed, run), demo accounts (admin/customer), struktur folder, test commands, deploy notes.

- [ ] **Step 2: Setup Neon/Supabase**

Buat project Postgres (Neon free tier atau Supabase). Ambil `DATABASE_URL` (connection string). Jangan commit — set di Vercel env.

- [ ] **Step 3: Deploy ke Vercel**

```bash
cd ~/maisara && npx vercel --prod
```
Atau import repo GitHub (justchillwkaiser/maisara-ecommerce) di vercel.com → New Project → pilih repo → framework Next.js. Set env: `DATABASE_URL`, `AUTH_SECRET` (generate: `openssl rand -base64 32`), `PAYMENT_PROVIDER=mock`.

- [ ] **Step 4: Migrate + seed di production**

```bash
npx prisma migrate deploy
npx prisma db seed
```
(Jalankan dari machine local dengan env production, atau guna `vercel env` + script; cara selamat: run migrate deploy dengan DATABASE_URL production dari local.)

- [ ] **Step 5: Verify production**

Buka URL Vercel: browse → checkout → payment mock → order. Login admin, kelola produk. Lighthouse production. Pastikan tiada error di Vercel logs.

- [ ] **Step 6: Update tracker & portfolio**

- Update `~/projects/PROJECTS.md`: maisara → siap, next: masukkan ke newportfolio.
- Tambah link project ke `~/newportfolio` (paparan showcase).

- [ ] **Step 7: Commit final**

```bash
git add -A && git commit -m "docs: README penuh + deployment setup"
```

---

## Self-Review Notes

- **Spec coverage:** Semua section spec/PRD diliputi: katalog (T7), PDP (T8), cart (T9), checkout+payment (T10), auth+akaun+wishlist+review (T3, T11), admin (T12), design system (T4), testing (T13), deploy (T14). Homepage (T6), layout (T5).
- **Out of scope dijaga:** tiada voucher, i18n, multi-vendor, gateway sebenar (abstraction sedia via `getPaymentProvider()`).
- **Type consistency:** `CartResult`, `ProductSummary`, `ProductDetail`, `PaymentProvider` didefinisikan di task masing-masing dan dirujuk konsisten. `ApiError` diperkenalkan di Task 3 (lib/errors.ts) dan digunakan guards + services.
- **Placeholder check:** Setiap task ada files, interfaces, steps dengan command/test konkrit. UI steps merujuk DESIGN.md untuk nilai visual (bukan "buat cantik").
