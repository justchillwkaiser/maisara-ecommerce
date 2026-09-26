import { z } from "zod";

import { CONTACT_TOPICS } from "@/lib/site";

/**
 * Validasi borang awam (API.md section 2 - endpoint mesej).
 * Semua input disahkan di sempadan API sebelum sampai ke transport e-mel.
 *
 * Medan honeypot (`company`) sengaja TIDAK disahkan di sini: ia diperiksa
 * dalam route sebelum validasi supaya bot yang mengisinya menerima jawapan
 * biasa, bukan ralat yang mendedahkan perangkap.
 */

/** Topik yang sah datang daripada satu sumber: config sebenar di `@/lib/site`. */
export const contactMessageSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama sekurang-kurangnya 2 aksara.")
    .max(80, "Nama maksimum 80 aksara."),
  email: z
    .email("Sila masukkan alamat e-mel yang sah.")
    .max(160, "E-mel maksimum 160 aksara."),
  topic: z.string().refine(
    (value) => CONTACT_TOPICS.some((topic) => topic.id === value),
    { message: "Sila pilih topik pertanyaan." },
  ),
  message: z
    .string()
    .trim()
    .min(10, "Mesej sekurang-kurangnya 10 aksara.")
    .max(2000, "Mesej maksimum 2000 aksara."),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;

/** POST /api/newsletter - langganan surat berita (hanya e-mel). */
export const newsletterSignupSchema = z.object({
  email: z
    .email("Sila masukkan alamat e-mel yang sah.")
    .max(160, "E-mel maksimum 160 aksara."),
});

export type NewsletterSignupInput = z.infer<typeof newsletterSignupSchema>;