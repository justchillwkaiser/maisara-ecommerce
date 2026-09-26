import { NextRequest } from "next/server";

import { isEmailConfigured, sendContactMessage } from "@/lib/email-transport";
import { isRateLimited, rateLimitKey } from "@/lib/rate-limit";
import { PRIMARY_CONTACT_EMAIL } from "@/lib/site";
import { contactMessageSchema } from "@/lib/validations/contact";

/**
 * POST /api/contact - mesej daripada borang Hubungi Kami.
 *
 * Kontrak jawapan (dikongsi dengan POST /api/newsletter):
 * - 200 `{ ok: true }`   : mesej benar-benar dihantar melalui transport.
 * - 400 `{ ok: false, message }` : payload tidak sah.
 * - 429 `{ ok: false, message }` : had kadar.
 * - 503 `{ ok: false, message }` : tiada provider dikonfigurasi; mesej
 *   mengandungi alamat sebenar supaya pelanggan masih ada jalan.
 * - 500 `{ ok: false, message }` : provider menolak mesej.
 *
 * Tiada jawapan kejayaan dijana tanpa penghantaran sebenar. Perlindungan
 * penyalahgunaan: honeypot `company` dan had kadar per-IP dalam ingatan.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { ok: false, message: "Permintaan tidak sah." },
      { status: 400 },
    );
  }

  const payload =
    typeof body === "object" && body !== null
      ? (body as Record<string, unknown>)
      : {};

  // Honeypot: medan yang hanya diisi oleh bot. Jawab seperti biasa supaya bot
  // tidak belajar bahawa ia dikesan, tetapi jangan hantar apa-apa.
  const honeypot = payload.company;
  if (typeof honeypot === "string" && honeypot.trim().length > 0) {
    return Response.json({ ok: true }, { status: 200 });
  }

  const parsed = contactMessageSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      {
        ok: false,
        message: parsed.error.issues[0]?.message ?? "Data tidak sah.",
      },
      { status: 400 },
    );
  }

  if (isRateLimited(`contact:${rateLimitKey(request)}`)) {
    return Response.json(
      { ok: false, message: "Terlalu banyak cubaan. Sila cuba sebentar lagi." },
      { status: 429 },
    );
  }

  if (!isEmailConfigured()) {
    return Response.json(
      {
        ok: false,
        message: `Borang ini belum diaktifkan pada pelayan ini. Sila e-mel kami di ${PRIMARY_CONTACT_EMAIL}.`,
      },
      { status: 503 },
    );
  }

  try {
    await sendContactMessage(parsed.data);
  } catch (error) {
    console.error("[api/contact] penghantaran mesej gagal:", error);
    return Response.json(
      {
        ok: false,
        message:
          "Kami tidak dapat menghantar mesej anda sekarang. Sila cuba sebentar lagi.",
      },
      { status: 500 },
    );
  }

  return Response.json({ ok: true }, { status: 200 });
}