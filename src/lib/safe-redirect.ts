/**
 * Pengesahan callback URL (`?next=`) — SATU-SATUNYA tempat nilai ini
 * dibenarkan masuk ke `router.push`.
 *
 * Nilai `?next=` datang daripada query string, jadi ia input tidak
 * dipercayai. Pemeriksaan `startsWith("/")` sahaja TIDAK cukup: `new URL()`
 * (yang digunakan oleh router Next) menyelesaikan URL relatif-skema
 * terhadap protokol halaman, jadi kesemuanya menunjuk ke origin LAIN:
 *
 *   //evil.com      -> https://evil.com/
 *   /\evil.com      -> https://evil.com/   (backslash = slash untuk skema khas)
 *   "/\t/evil.com"  -> https://evil.com/   (tab diabaikan oleh parser URL)
 *
 * Kesemuanya ialah open redirect. Fungsi ini hanya meluluskan laluan relatif
 * origin-sama; apa-apa yang lain jatuh balik kepada `fallback`.
 */
export function safeRelativePath(value: unknown, fallback = "/"): string {
  if (typeof value !== "string") return fallback;
  // Aksara kawalan (termasuk tab/CR/LF) diabaikan oleh parser URL, jadi ia
  // mesti dibuang sebelum pemeriksaan — bukan selepas.
  const cleaned = value.replace(/[\u0000-\u001F\u007F]/g, "").trim();
  if (!cleaned.startsWith("/")) return fallback;
  // Relatif-skema (`//host`) dan `/\host` menukar origin.
  if (cleaned.startsWith("//") || cleaned.startsWith("/\\")) return fallback;
  return cleaned;
}
