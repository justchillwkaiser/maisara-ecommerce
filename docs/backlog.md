# Backlog Polishing Maisara

Senarai kerja polishing yang disusun pada 14 Ogos 2026 (selepas deploy v1). Setiap item ada konteks dan sebab. Implementasi akan dibuat dalam sesi akan datang.

## P1 — Bug Pecah (wajib baiki dahulu)

1. **Halaman /kisah-kami (404)** — ✓ SELESAI (14 Aug 2026, commit 88cf877): page editorial dibina (Jawi, motif, imej, CTA ke koleksi).
2. **Halaman /cart (404)** — ✓ SELESAI (14 Aug 2026, commit 88cf877): page senarai cart penuh + ringkasan + CTA checkout.
3. **Footer links Bantuan/Syarikat** — ✓ SELESAI (14 Aug 2026, commit 7125655): /penghantaran, /pertukaran, /hubungi-kami dibina; Blog/Kerjaya dibuang (tiada kandungan).

## P2 — Showcase / Portfolio

3. **Integrate ke newportfolio** — ✓ SELESAI (14 Aug 2026, commit 2d65457 di harisuedev): Maisara = EXHIBIT 04 (synthetic: false, status DEPLOYED), live link maisara-beta.vercel.app, butang "VISIT LIVE SITE" + badge LIVE.
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
