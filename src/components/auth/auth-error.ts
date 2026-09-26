/**
 * Mesej ralat borang auth.
 *
 * Better Auth memulangkan mesej DALAMAN (contohnya
 * `[body.email] Invalid input: expected string, received undefined` atau
 * mesej bahasa Inggeris mentah) yang tidak sesuai dipaparkan kepada pelanggan.
 * Fungsi ini memetakan kod ralat yang dikenali kepada mesej Bahasa Melayu dan
 * mengekalkan mesej generik untuk semua yang lain, sambil mencatat ralat asal
 * ke konsol untuk diagnosis. Tiada ralat disembunyikan — hanya dipaparkan
 * dengan cara yang boleh difahami pelanggan.
 */
export interface AuthFormError {
  code?: string | null;
  status?: number | null;
  message?: string | null;
}

const RATE_LIMITED = "Terlalu banyak cubaan. Sila cuba sebentar lagi.";

export function authErrorMessage(
  error: AuthFormError | null | undefined,
  fallback: string,
  byCode: Record<string, string> = {},
): string {
  if (!error) return fallback;
  if (error.status === 429) return RATE_LIMITED;
  const code = error.code ?? "";
  if (code && Object.hasOwn(byCode, code)) return byCode[code];
  console.error("[auth] ralat tidak dipetakan:", code, error.message);
  return fallback;
}

/** Mesej kod ralat yang dikongsi lebih daripada satu borang. */
export const PASSWORD_ERROR_MESSAGES: Record<string, string> = {
  PASSWORD_TOO_SHORT: "Kata laluan mesti sekurang-kurangnya 8 aksara.",
  PASSWORD_TOO_LONG: "Kata laluan maksimum 128 aksara.",
};
