# Maisara — Butik Modest Fashion (E-commerce)

E-commerce butik modest fashion (brand fiksyen) untuk portfolio freelance. Full-stack production-quality: storefront, cart, checkout dengan mock FPX, akaun pengguna, wishlist, review dan admin panel.

**Design:** soft luxury heritage dengan motif batik/songket sebagai signature. Bahasa Melayu, mata wang RM.

---

## Features

**Pelanggan**
- Homepage editorial (hero, kategori, featured, testimoni, kisah jenama)
- Katalog dengan filter (kategori, harga, warna, saiz), carian dan susun
- PDP dengan galeri, variant picker (warna/saiz), status stok
- Cart (guest + user, merge selepas login) dengan drawer
- Checkout 3 langkah: alamat → penghantaran (J&T Express / Pos Laju) → semakan & bayar
- Payment mock FPX (redirect page, success/fail) dengan abstraction layer untuk swap ke gateway sebenar
- Akaun: profil, sejarah order + status, wishlist
- Review produk (selepas order selesai, dimoderasi admin)

**Admin**
- Dashboard: jualan, order terkini, amaran stok rendah
- Produk CRUD + variants + stok
- Order management dengan transition validation (stok dipulangkan bila batal)
- Stok tracking (low stock alerts)
- Moderasi review

## Tech Stack

| Lapisan | Teknologi |
|---|---|
| Frontend | Next.js 16 (App Router) · React 19 · TypeScript strict |
| Styling | Tailwind CSS v4 · shadcn/ui · Cormorant Garamond + Plus Jakarta Sans |
| Animation | motion/react (Framer Motion) |
| Auth | Better Auth (email/password, role customer/admin) |
| Database | PostgreSQL (Supabase/Neon) · Prisma 7 (driver adapter) |
| Validation | Zod 4 |
| Testing | Vitest (unit) · Playwright (e2e) |
| Deploy | Vercel |

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@maisara.my` | `AdminDemo123!` |
| Customer | `nurul@maisara.my` | `Demo123!` |
| Customer | `aina@maisara.my` | `Demo123!` |

## Setup Local

```bash
# 1. Install dependencies
npm install

# 2. Setup environment (salin dan isi)
cp .env.example .env
# DATABASE_URL="postgresql://..."
# AUTH_SECRET="<random 32+ chars>"
# PAYMENT_PROVIDER="mock"

# 3. Migrate + seed
npx prisma migrate deploy
npx prisma db seed

# 4. Jalankan
npm run dev
# Buka http://localhost:3000
```

## Test & Quality

```bash
npm run test        # Unit tests (Vitest)
npm run typecheck   # TypeScript strict
npm run lint        # ESLint
npx playwright test # E2E (browser)
npm run build       # Production build
```

## Struktur

```
src/
  app/          # Routes (storefront, akaun, admin, api)
  components/   # ui (shadcn), shop, admin, shared, auth, akaun
  lib/          # db, auth, payments (abstraction), validations, format
  server/
    services/   # Business logic (bebas transport, unit-tested)
    guards.ts   # requireUser / requireAdmin
  proxy.ts      # Route protection (Next 16)
prisma/         # Schema + seed
docs/           # Spec, design, plan, mockup
```

## Payment Abstraction

`src/lib/payments/` — `PaymentProvider` interface dengan `MockPaymentProvider`. Flow FPX disimulasikan sepenuhnya (redirect, callback, status). Untuk integrasi sebenar, tambah `BillPlzProvider`/`ToyyibPayProvider` dan set `PAYMENT_PROVIDER` — tiada perubahan pada business logic.

## Deploy (Vercel)

1. Import repo GitHub ke vercel.com → New Project (framework auto-detect Next.js).
2. Set env: `DATABASE_URL`, `AUTH_SECRET` (jana: `openssl rand -base64 32`), `PAYMENT_PROVIDER=mock`, `BETTER_AUTH_URL=<production URL>`.
3. Jalankan migration + seed pada production DB: `npx prisma migrate deploy && npx prisma db seed`.
4. Deploy.

## Dokumentasi

- `PRD.md` — product requirements & acceptance criteria
- `UX.md` — user flows & information architecture
- `DESIGN.md` — design system (source of truth visual)
- `ARCHITECTURE.md` — layer & struktur
- `DATABASE.md` — schema & relationships
- `API.md` — kontrak endpoint
- `AGENTS.md` — rules untuk AI dalam project
