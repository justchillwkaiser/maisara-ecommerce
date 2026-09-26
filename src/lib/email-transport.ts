import { writeFileSync } from "node:fs";
import path from "node:path";

import { CONTACT_TOPICS, PRIMARY_CONTACT_EMAIL } from "@/lib/site";

/**
 * Penghantaran e-mel Maisara — satu-satunya tempat yang tahu tentang provider.
 *
 * Dua mod:
 * - Dikonfigurasi (`RESEND_API_KEY` hadir): mesej dihantar melalui HTTP API
 *   provider menggunakan `fetch`, jadi tiada kebergantungan npm ditambah.
 *   `EMAIL_FROM` mesti ditetapkan kepada pengirim yang disahkan pada domain
 *   sendiri; jika tidak, kita guna pengirim ujian rasmi Resend yang hanya
 *   boleh menghantar ke alamat pemilik akaun.
 * - Tidak dikonfigurasi: mod mock yang sama seperti sebelum ini. Mesej dilog
 *   dengan jelas dan TIDAK dihantar. Endpoint awam mesti menyemak
 *   `isEmailConfigured()` dahulu supaya UI tidak pernah melaporkan kejayaan
 *   yang tidak berlaku.
 *
 * Fungsi MELEMPAR ralat apabila provider menolak mesej, supaya pemanggil boleh
 * membezakan "dihantar" daripada "gagal" dengan jujur.
 */

export interface ResetPasswordEmail {
  email: string;
  url: string;
}

export interface ContactMessage {
  name: string;
  email: string;
  /** Id topik daripada `CONTACT_TOPICS` (`@/lib/site`). */
  topic: string;
  message: string;
}

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/** Mod penghantaran sebenar aktif apabila kunci provider wujud. */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  /** Alamat balasan; hanya diisi apabila kita tahu alamat sebenar penghantar. */
  replyTo?: string;
}

/**
 * Hantar satu mesej melalui provider, atau log sahaja dalam mod mock.
 * Teks biasa sahaja (tiada HTML) supaya kandungan yang ditaip pelanggan tidak
 * perlu di-escape dan tidak boleh menyuntik markup ke dalam e-mel.
 */
async function deliver(message: EmailMessage): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(
      `[email:mock] tidak dihantar (RESEND_API_KEY tiada): ${message.subject} -> ${message.to}`,
    );
    return;
  }

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "MAISARA <onboarding@resend.dev>",
      to: [message.to],
      subject: message.subject,
      text: message.text,
      ...(message.replyTo ? { reply_to: message.replyTo } : {}),
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `[email] provider menolak mesej (${response.status}): ${detail.slice(0, 400)}`,
    );
  }
}

/**
 * Reset kata laluan. Mod mock dikekalkan kerana aliran demo/e2e bergantung
 * padanya: URL ditulis ke `.reset-url.tmp` dalam pembangunan.
 */
export async function sendResetPasswordEmail({ email, url }: ResetPasswordEmail): Promise<void> {
  if (isEmailConfigured()) {
    await deliver({
      to: email,
      subject: "Set semula kata laluan MAISARA",
      text: [
        "Kami menerima permintaan untuk set semula kata laluan akaun MAISARA anda.",
        "",
        `Buka pautan ini untuk menetapkan kata laluan baharu: ${url}`,
        "",
        "Jika anda tidak membuat permintaan ini, abaikan e-mel ini. Kata laluan anda tidak berubah.",
      ].join("\n"),
    });
    return;
  }

  console.log(`[email:mock] reset-password untuk ${email}: ${url}`);
  if (process.env.NODE_ENV !== "production") {
    // Simpan URL untuk e2e/demo (token sebenar yang dihantar ke user).
    writeFileSync(path.join(process.cwd(), ".reset-url.tmp"), url, "utf8");
  }
}

/**
 * Mesej daripada borang Hubungi Kami. Penerima ialah alamat sebenar bagi topik
 * yang dipilih, jadi pertanyaan borong tidak masuk ke inbox penjagaan
 * pelanggan. `reply` ditetapkan kepada penghantar supaya staf boleh membalas
 * terus daripada e-mel.
 */
export async function sendContactMessage({ name, email, topic, message }: ContactMessage): Promise<void> {
  const topicConfig = CONTACT_TOPICS.find((entry) => entry.id === topic);

  await deliver({
    to: topicConfig?.email ?? PRIMARY_CONTACT_EMAIL,
    subject: `[Hubungi Kami] ${topicConfig?.label ?? topic} / ${name}`,
    replyTo: email,
    text: [
      `Topik: ${topicConfig?.label ?? topic}`,
      `Nama: ${name}`,
      `E-mel: ${email}`,
      "",
      message,
    ].join("\n"),
  });
}

/**
 * Permintaan langganan surat berita. Tiada senarai pelanggan disimpan dalam
 * aplikasi ini, jadi satu-satunya tindakan sebenar ialah memberitahu inbox
 * Maisara supaya alamat itu boleh dimasukkan ke senarai sebenar. Fungsi ini
 * tidak berpura-pura mendaftarkan pelanggan ke tempat yang tidak wujud.
 */
export async function sendNewsletterSignup({ email }: { email: string }): Promise<void> {
  await deliver({
    to: PRIMARY_CONTACT_EMAIL,
    subject: `[Langganan] ${email}`,
    text: [
      "Satu permintaan langganan surat berita diterima dari laman web.",
      "",
      `E-mel: ${email}`,
      "",
      "Masukkan alamat ini ke senarai mel Maisara jika langganan disahkan.",
    ].join("\n"),
  });
}