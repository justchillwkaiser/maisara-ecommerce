import { NextRequest } from "next/server";

import { isEmailConfigured, sendNewsletterSignup } from "@/lib/email-transport";
import { isRateLimited, rateLimitKey } from "@/lib/rate-limit";
import { PRIMARY_CONTACT_EMAIL } from "@/lib/site";
import { newsletterSignupSchema } from "@/lib/validations/contact";

/**
 * POST /api/newsletter - permintaan langganan surat berita.
 *
 * Kontrak jawapan sama seperti POST /api/contact:
 * - 200 `{ ok: true }`   : permintaan diterima dan dihantar kepada inbox.
 * - 400 `{ ok: false, message }` : e-mel tidak sah.
 * - 429 `{ ok: false, message }` : had kadar.
 * - 503 `{ ok: false, message }` : tiada provider dikonfigurasi.
 * - 500 `{ ok: false, message }` : penghantaran gagal.
 *
 * Tiada senarai pelanggan disimpan dalam aplikasi ini, jadi kejayaan bermakna
 * permintaan itu benar-benar sampai ke inbox Maisara, bukan pendaftaran ke
 * pangkalan data yang tidak wujud.
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

  // Honeypot yang sama seperti borang hubungi: bot menerima jawapan biasa
  // tanpa sebarang penghantaran berlaku.
  const honeypot = payload.company;
  if (typeof honeypot === "string" && honeypot.trim().length > 0) {
    return Response.json({ ok: true }, { status: 200 });
  }

  const parsed = newsletterSignupSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      {
        ok: false,
        message: parsed.error.issues[0]?.message ?? "Sila masukkan alamat e-mel yang sah.",
      },
      { status: 400 },
    );
  }

  if (isRateLimited(`newsletter:${rateLimitKey(request)}`)) {
    return Response.json(
      { ok: false, message: "Terlalu banyak cubaan. Sila cuba sebentar lagi." },
      { status: 429 },
    );
  }

  if (!isEmailConfigured()) {
    return Response.json(
      {
        ok: false,
        message: `Borang langganan belum diaktifkan pada pelayan ini. Sila e-mel kami di ${PRIMARY_CONTACT_EMAIL} untuk menyertai senarai kami.`,
      },
      { status: 503 },
    );
  }

  try {
    await sendNewsletterSignup(parsed.data);
  } catch (error) {
    console.error("[api/newsletter] penghantaran langganan gagal:", error);
    return Response.json(
      {
        ok: false,
        message:
          "Kami tidak dapat menyimpan langganan anda sekarang. Sila cuba sebentar lagi.",
      },
      { status: 500 },
    );
  }

  return Response.json({ ok: true }, { status: 200 });
}