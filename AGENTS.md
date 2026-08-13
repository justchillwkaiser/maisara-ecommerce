# AGENTS — Maisara (Rules untuk AI)

**Tarikh:** 13 Ogos 2026
**Tujuan:** Dokumen ini adalah peraturan untuk AI agents (cth. Sarae, Claude Code, Codex) yang bekerja dalam project ini. Baca dahulu sebelum mengubah code.

---

## 1. Source of Truth

| Dokumen | Fungsi |
|---|---|
| `PRD.md` | Apa produk perlu buat (user stories, AC) |
| `UX.md` | User flows, information architecture |
| `DESIGN.md` | Visual design & design system — WAJIB dipatuhi untuk semua UI |
| `ARCHITECTURE.md` | Struktur code, layer, prinsip |
| `DATABASE.md` | Schema & relationships |
| `API.md` | Kontrak endpoint |
| `docs/superpowers/specs/2026-08-13-maisara-design.md` | Design spec asal |

Jika dokumen bercanggah, yang lebih spesifik menang (cth. DESIGN.md mengatasi statement umum dalam spec).

## 2. Prinsip Kerja

1. **Targeted changes.** Jangan rewrite keseluruhan feature jika perubahan kecil mencukupi.
2. **Ikut pattern sedia ada.** Sebelum menulis baru, semak `server/services/`, `components/` untuk pattern yang wujud.
3. **Service layer bebas transport.** Logic perniagaan dalam `server/services/`, bukan dalam route handler atau komponen.
4. **Harga & stok dari DB sahaja.** Jangan percaya payload client.
5. **Zod di sempadan API.** Semua input divalidasi.
6. **Verification wajib.** Selepas perubahan: run test, lint, type check, build. Jangan dakwa lulus tanpa run.

## 3. Code Conventions

- TypeScript strict. Elak `any` (justifikasi perlu).
- Nama fail: `kebab-case.ts`. Nama fungsi/kelas: `camelCase` / `PascalCase`.
- Error: guna kod error beruniform (lihat API.md section 8), bukan throw Error raw tanpa konteks.
- Format wang: guna `Decimal` dari Prisma; format paparan melalui `lib/format.ts` (formatRM).
- Jangan hardcode string user-visible dalam komponen secara berselerak — simpan copy dalam komponen itu sendiri (BM sahaja; tiada i18n buat masa ini).
- Icons: satu family (Phosphor atau Tabler). Jangan mix. Jangan hand-roll SVG icons.
- Fonts: `next/font` sahaja. Jangan link Google Fonts dalam production.

## 4. UI Rules (dari DESIGN.md — ringkasan)

- Semua UI mesti mengikut tokens dalam DESIGN.md (warna, tipografi, radius, spacing). Jangan cipta warna baru ad-hoc.
- Gold adalah satu-satunya accent. Jangan tambah aksen lain.
- Zero em-dash (—) dalam sebarang copy/UI. Guna hyphen atau pecahkan ayat.
- CTA: max 3 patah perkataan, satu baris. Satu label per intent.
- Kad produk: imej 4:5, nama serif, harga tabular-nums, badge stok di bawah (bukan atas imej).
- Motif batik/songket: guna dengan restraint (opacity rendah), JANGAN atas imej produk atau dalam checkout/cart/form.
- Motion: ikut DESIGN.md section 9. `motion/react` untuk reveal/AnimatePresence; CSS untuk hover. Reduced motion wajib.
- Empty/loading/error states wajib untuk setiap senarai/form.
- Mobile: semua asimetri collapse single-column < 768px.

## 5. Testing Rules

- Unit test (Vitest) untuk services & payment providers — wajib untuk logic baru.
- E2E (Playwright) untuk flow utama — update bila flow berubah.
- Sebelum claim siap: `npm run test`, `npm run lint`, `npm run typecheck`, `npm run build` semuanya lulus.
- Test data guna seed; jangan hardcode ID yang mungkin berubah.

## 6. Git & Commit

- Branch: `main` untuk stable; feature branch untuk kerja besar (`feat/checkout`, `fix/stock-validation`).
- Commit message: conventional (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`).
- Jangan commit secrets (`.env` dalam `.gitignore`; contoh env dalam `.env.example`).
- Jangan commit perubahan yang tidak berkaitan dengan task.

## 7. Security Do's & Don'ts

**Do:**
- Guard semua mutation: `requireUser()` / `requireAdmin()` dalam setiap handler.
- Validasi semua input dengan Zod.
- Kira harga/stok server-side.
- Log detail server-side, response generic.
- Semak dependency vulnerabilities sebelum deploy.

**Don't:**
- Jangan simpan secrets dalam code, memory, skill atau dokumen.
- Jangan expose `DATABASE_URL`, `AUTH_SECRET` di client.
- Jangan log password/token.
- Jangan hard delete produk yang ada rujukan order (guna soft deactivate).
- Jangan skip rate limiting pada auth/checkout.

## 8. Deployment Checklist (sebelum deploy ke Vercel)

- [ ] `npm run build` lulus di production mode
- [ ] Test suite lulus
- [ ] `DATABASE_URL` (Neon/Supabase) + `AUTH_SECRET` + `PAYMENT_PROVIDER=mock` di-set di Vercel
- [ ] `prisma migrate deploy` + seed dijalankan
- [ ] Tiada secrets dalam repo
- [ ] Lighthouse ≥ 90 (Performance, Accessibility, Best Practices, SEO)
- [ ] Demo account berfungsi (admin + customer)
- [ ] README dikemas kini (setup, demo account)

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
