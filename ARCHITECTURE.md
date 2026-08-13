# ARCHITECTURE — Maisara

**Tarikh:** 13 Ogos 2026
**Source:** design spec + PRD

---

## 1. Stack

| Lapisan | Teknologi | Nota |
|---|---|---|
| Framework | Next.js 16 (App Router) | Server-first |
| UI | React 19 + TypeScript (strict) | |
| Styling | Tailwind CSS v4 + shadcn/ui (Radix) | Disesuaikan penuh dengan DESIGN.md, bukan default |
| Fonts | next/font (Cormorant Garamond + Plus Jakarta Sans) | Self-hosted, tiada <link> Google Fonts di production |
| Icons | Phosphor / Tabler (satu family sahaja) | Pilih satu, konsisten |
| Animation | motion/react (Framer Motion) | Terpilih, ikut DESIGN.md section 9 |
| Auth | Better Auth | Email/password, session cookie, role |
| ORM | Prisma | |
| Database | PostgreSQL (Neon/Supabase free tier) | |
| Validation | Zod | Di sempadan API |
| Testing | Vitest (unit) + Playwright (e2e) | |
| Deploy | Vercel | |

**Dependency verification rule:** sebelum import mana-mana package baru, semak `package.json`. Jangan install tanpa sebab munasabah.

## 2. Folder Structure

```
maisara/
  prisma/
    schema.prisma
    seed.ts
  src/
    app/
      (shop)/                 # storefront (Server Components)
        page.tsx              # homepage
        koleksi/page.tsx      # katalog + filter (searchParams)
        koleksi/[category]/page.tsx
        produk/[slug]/page.tsx# PDP
        cart/page.tsx
        checkout/page.tsx     # flow checkout
        pembayaran/[orderId]/page.tsx   # mock FPX page
        order/success/page.tsx
        kisah-kami/page.tsx
      (auth)/
        log-masuk/page.tsx
        daftar/page.tsx
      akaun/                  # protected (customer)
        page.tsx              # dashboard akaun
        order/page.tsx
        wishlist/page.tsx
        profil/page.tsx
      admin/                  # protected (admin role)
        page.tsx              # dashboard
        produk/page.tsx
        produk/baru/page.tsx
        produk/[id]/page.tsx
        order/page.tsx
        stok/page.tsx
        review/page.tsx
      api/
        auth/[...all]/route.ts    # Better Auth handler
        products/route.ts
        products/[id]/route.ts
        categories/route.ts
        cart/route.ts
        orders/route.ts
        orders/[id]/route.ts
        orders/[id]/status/route.ts
        payments/[orderId]/route.ts
        payments/callback/route.ts
        reviews/route.ts
        reviews/[id]/route.ts
        admin/dashboard/route.ts
        admin/stock/route.ts
      layout.tsx
    components/
      ui/                   # shadcn (customized)
      shop/                 # storefront components
      admin/                # admin components
      shared/               # shared (header, footer, cart drawer)
    lib/
      db.ts                 # PrismaClient singleton
      auth.ts               # Better Auth config
      auth-client.ts        # (jika perlu client)
      payments/
        types.ts            # PaymentProvider interface
        mock.ts             # MockPaymentProvider
        index.ts            # getPaymentProvider() factory
      validations/          # Zod schemas (product, order, review...)
      format.ts             # formatRM (mata wang), format tarikh
      constants.ts          # z-index scale, stok threshold
      utils.ts              # cn() dll
    server/
      services/
        product.service.ts
        category.service.ts
        cart.service.ts
        order.service.ts
        payment.service.ts
        review.service.ts
        dashboard.service.ts
      guards.ts             # requireUser, requireAdmin
    types/
      index.ts              # shared types
    middleware.ts           # route protection (admin/akaun)
  docs/
  tests/
    unit/                   # Vitest
    e2e/                    # Playwright
```

## 3. Layer & Responsibilities

```
┌─────────────────────────────────────────────┐
│  app/ (Routes + Server Components)          │  <- transport: render, searchParams, redirect
│  - komposisi komponen, tiada business logic  │
├─────────────────────────────────────────────┤
│  server/services/ (Business logic)          │  <- pure functions, guna Prisma
│  - product, cart, order, payment, review     │  <- unit-testable tanpa HTTP
├─────────────────────────────────────────────┤
│  lib/ (Infrastructure)                      │  <- Prisma client, auth, payments, validation
│  - db.ts, auth.ts, payments/, validations/   │
└─────────────────────────────────────────────┘
```

**Prinsip:**
- **Service layer bebas transport.** `order.service.ts` tidak tahu tentang HTTP/API/UI. Ia menerima data tervalidasi dan mengembalikan hasil; route handler cuma memanggil dan serialize.
- **Harga & stok dari DB sahaja.** Service kira semula harga dari database semasa checkout, tidak percaya payload client.
- **Zod di sempadan.** Semua input API divalidasi sebelum masuk service.
- **Tiada logic perniagaan dalam komponen UI.** Komponen render sahaja.

## 4. Server Components vs Client Components

| Guna Server Component | Guna Client Component ('use client') |
|---|---|
| Halaman (page.tsx) | Cart drawer, mobile menu |
| Senarai produk, kategori (read) | PDP variant picker, quantity stepper |
| PDP (data produk dari DB) | Add to cart, wishlist buttons |
| Order history (read) | Checkout form (react-hook-form) |
| Admin tables (read) | Admin CRUD forms |
| | Toast / notifications |
| | Motion reveals (isolated leaves) |

- Semua komponen yang guna Motion/state/interaksi MESTI client leaf.
- Provider (auth, cart context) dibalut dalam `'use client'` di layout.

## 5. Data Flow

**Browse:** Page (RSC) → service → Prisma → Postgres → render.

**Checkout (mutation):**
```
Client (form) → POST /api/orders (Zod) → requireUser
  → order.service.createOrder (validate stok, kira harga dari DB, kurangkan stok)
  → cipta Order + OrderItem + Payment (status pending)
  → payment.service.initiate (MockProvider) → { redirectUrl }
  → client redirect ke /pembayaran/[orderId]
```

**Payment callback (mock):**
```
Halaman mock FPX → user klik Berjaya/Gagal → POST /api/payments/callback
  → payment.service.handleCallback (verify provider) → update Payment + Order
  → redirect ke /order/success (atau gagal)
```

## 6. Payment Abstraction

```ts
// src/lib/payments/types.ts
export interface PaymentProvider {
  createPayment(input: {
    orderId: string; amount: number;
  }): Promise<{ redirectUrl: string; reference: string }>;
  handleCallback(payload: unknown): Promise<{
    status: 'paid' | 'failed'; reference: string;
  }>;
  verify(reference: string): Promise<'paid' | 'failed' | 'pending'>;
}
```

```ts
// src/lib/payments/index.ts
export function getPaymentProvider(): PaymentProvider {
  switch (process.env.PAYMENT_PROVIDER ?? 'mock') {
    case 'billplz': return new BillPlzProvider(); // future, selepas SSM
    case 'toyyibpay': return new ToyyibPayProvider(); // future
    default: return new MockPaymentProvider();
  }
}
```

- Business logic (order.service) bergantung pada interface, bukan implementasi.
- Tambah provider sebenar = buat class baru + tukar env. Tiada perubahan pada service.

## 7. Auth & Authorization

- Better Auth: email/password, session cookie HTTP-only, CSRF protection bawaan.
- Role: `CUSTOMER` | `ADMIN` (field pada User).
- **Enforcement dua lapis:**
  1. `middleware.ts` — blok `/akaun/*` (perlu session) dan `/admin/*` (perlu role ADMIN) pada peringkat route.
  2. `server/guards.ts` — `requireUser()` / `requireAdmin()` dipanggil dalam setiap route handler mutation (semakan kedua server-side).
- API: setiap mutation mula dengan guard. Jangan percaya middleware sahaja.
- Rate limiting: Better Auth built-in untuk auth endpoints; checkout endpoint tambah throttle ringkas (cth. max N percubaan/minit per user).

## 8. Error Handling

- API: `{ error: { code, message } }` — mesej generic untuk client, detail dilog server-side. Tiada info leakage (stack trace, DB error).
- Zod error → `{ code: 'VALIDATION_ERROR', issues: [...] }` (400).
- Not found → 404. Unauthorized → 401. Forbidden → 403.
- Business errors (stok tak cukup, payment gagal) → kod jelas (cth. `INSUFFICIENT_STOCK`) dengan mesej mesra pengguna dalam BM.
- UI: inline untuk form, toast untuk transient, empty states untuk senarai.

## 9. Performance Strategy

- RSC untuk semua halaman read; hydration minima.
- Imej: `next/image` (priority untuk hero/LCP), aspect ratio ditetapkan (elak CLS).
- Font: next/font self-hosted, `display: swap`.
- Bundle: lazy-load Motion dan komponen client berat (cart drawer) hanya bila perlu.
- Tiada scroll listener JS (guna CSS/IntersectionObserver/Motion).
- Target: LCP < 2.5s, INP < 200ms, CLS < 0.1.

## 10. Security Architecture

- Zod validation semua input; Prisma parameterized queries.
- Harga, stok, jumlah dikira server-side dari DB. Payload client hanya ID + kuantiti + alamat.
- Authorization dua lapis (middleware + guards).
- Tiada secrets di client. Env var hanya diakses server.
- Admin routes: guard role di middleware DAN di setiap handler.
- Review content: text sahaja, React escapes semasa render.
- Error response generic; log detail server-side.
- Payment callback: verify reference dengan provider (mock: dalam DB) sebelum update order.

## 11. Testing Architecture

- **Unit (Vitest):** services (order, cart, payment, review), payment providers, Zod schemas, format helpers.
- **E2E (Playwright):**
  - Flow A: browse → PDP → cart → checkout → payment success → order di akaun
  - Flow B: payment fail → mesej jelas
  - Flow C: admin CRUD produk + update order status
  - Security smoke: akses /admin dan /akaun tanpa login → redirect; API mutation tanpa session → 401
- Test data: seed/teardown per test suite.
