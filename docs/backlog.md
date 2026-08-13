# Backlog Polishing Maisara

Senarai kerja polishing yang disusun pada 14 Ogos 2026 (selepas deploy v1). Setiap item ada konteks dan sebab. Implementasi akan dibuat dalam sesi akan datang.

## P1 — Bug Pecah (wajib baiki dahulu)

1. **Halaman /kisah-kami (404)** — nav ("Kisah Kami"), footer (Syarikat) dan CTA "Kenali Maisara" di BrandStory semua menunjuk ke page yang tidak wujud. Buat page editorial ringkas: kisah jenama (boleh guna semula copy dari brand-story.tsx + mockup), imej, Jawi "مياثرا", CTA ke koleksi. Gaya ikut DESIGN.md (soft luxury, motif).
2. **Halaman /cart (404)** — CartButton fallback link ke /cart (nampak dalam DOM bila drawer tak dibuka). Buat page senarai cart ringkas (reuse cart service/context) + CTA ke checkout. ATAU tukar CartButton link ke "#" supaya hanya drawer berfungsi (pilih yang lebih baik: page lebih robust).

## P2 — Showcase / Portfolio

3. **Integrate ke newportfolio** — masukkan Maisara sebagai showcase: link live (https://maisara-beta.vercel.app), description, stack, role dalam project. Tujuan asal project ini untuk tarik client.
4. **Imej produk sebenar** — seed guna picsum placeholder. Ganti dengan imej konsisten (AI-generate atau stock) supaya nampak premium. Perlu update seed + migration data.
5. **Domain kemas** — maisara-beta.vercel.app (Vercel auto-assign, domain pelik). Tukar ke maisara.vercel.app (jika available) atau custom domain. Update BETTER_AUTH_URL + trustedOrigins selepas tukar.
6. **Publish repo public** — bila project settle sepenuhnya; repo kini private (github.com/justchillwkaiser/maisara-ecommerce). README dah lengkap.
7. **OG tags + metadata + sitemap/robots** — preview kemas bila link dishare; SEO asas.

## P3 — Flow Lengkap

8. **Password reset** — Better Auth Verification model dah ada; tambah flow lupa password (UI + mock email atau log token).
9. **Profil edit** — /akaun sekarang paparan sahaja; tambah edit nama/email (Better Auth updateUser).
10. **Lighthouse/performance audit + Vercel Analytics** — Core Web Vitals, fix yang ditemui.

## P4 — Masa Depan (bila ada SSM / skala)

11. **Swap mock FPX → BillPlz/ToyyibPay sebenar** — abstraction layer PaymentProvider dah siap; tinggal implement provider + set PAYMENT_PROVIDER env.
12. **Email notification** — order baru, stok rendah (cth. Resend).
13. **Rotate password Supabase** — connection string telah melalui chat history; rotate di Dashboard Supabase dan update DATABASE_URL di Vercel env.

## Nota teknikal untuk sesi akan datang

- Semua fix perlu: npm test (98 unit), npx playwright test (8 e2e), typecheck, build, curl E2E production dengan Origin header.
- Dev server: kill dahulu sebelum start baru (netstat + taskkill).
- Zero em-dash dalam copy, satu family icon (Phosphor), copy Bahasa Melayu.
