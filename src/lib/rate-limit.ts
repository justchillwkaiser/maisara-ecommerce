import type { NextRequest } from "next/server";

/**
 * Had kadar ringkas untuk endpoint awam (hubungi kami, langganan).
 *
 * Ini bukan jaminan keselamatan yang kuat dan tidak cuba menjadi satu:
 * peta disimpan dalam ingatan proses, jadi setiap instance serverless
 * mempunyai kiraan sendiri dan kiraan hilang apabila instance dikitar. Ia
 * tidak menambah kebergantungan, pangkalan data atau perkhidmatan luar, dan
 * ia cukup untuk menahan satu sumber yang menghantar berulang kali.
 *
 * Fail-closed untuk kes tanpa IP: permintaan tanpa `x-forwarded-for`
 * berkongsi satu baldi, jadi ia dihadkan, bukan dibiarkan bebas.
 */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const MAX_KEYS = 5000;

const attempts = new Map<string, number[]>();

/** Rekod satu cubaan dan pulangkan true bila had dicapai. */
export function isRateLimited(key: string, now: number = Date.now()): boolean {
  const recent = (attempts.get(key) ?? []).filter((at) => now - at < WINDOW_MS);

  if (recent.length >= MAX_ATTEMPTS) {
    attempts.set(key, recent);
    return true;
  }

  recent.push(now);
  attempts.set(key, recent);

  if (attempts.size > MAX_KEYS) {
    for (const [entryKey, hits] of attempts) {
      if (hits.every((at) => now - at >= WINDOW_MS)) {
        attempts.delete(entryKey);
      }
    }
  }

  return false;
}

/** Kunci had kadar: IP pelanggan seperti yang dilaporkan proksi. */
export function rateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim();

  return ip && ip.length > 0 ? ip : "tanpa-ip";
}