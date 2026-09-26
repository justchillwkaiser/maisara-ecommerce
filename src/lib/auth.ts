import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";
import { sendResetPasswordEmail } from "@/lib/email-transport";

/**
 * Origin laman untuk satu tetapan deployment.
 *
 * Sebelum ini nilai lalai `http://localhost:3000` ditulis terus dalam kod,
 * jadi deployment tanpa BETTER_AUTH_URL menghantar pautan reset kata laluan
 * yang menunjuk ke localhost dan menolak origin sebenar daripada
 * `trustedOrigins`. Susunan keutamaan: URL yang dikonfigurasi secara
 * eksplisit dahulu, kemudian nilai yang disediakan Vercel sendiri.
 */
function resolveSiteOrigin(): string {
  const candidates = [
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ];
  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (!value) continue;
    try {
      // VERCEL_* mengandungi host sahaja (tanpa skema).
      return new URL(value.includes("://") ? value : `https://${value}`).origin;
    } catch {
      console.error(`[auth] URL laman tidak sah dalam persekitaran: ${value}`);
    }
  }
  return "http://localhost:3000";
}

const siteOrigin = resolveSiteOrigin();
/** Deployment sebenar yang diketahui. Origin semasa ditambah di hadapan. */
const KNOWN_ORIGINS = [
  "http://localhost:3000",
  "https://maisara.vercel.app",
  "https://maisara-beta.vercel.app",
  "https://maisarabutik.vercel.app",
];

export const auth = betterAuth({
  baseURL: siteOrigin,
  secret: process.env.BETTER_AUTH_SECRET ?? process.env.AUTH_SECRET,
  trustedOrigins: [
    siteOrigin,
    ...KNOWN_ORIGINS.filter((origin) => origin !== siteOrigin),
  ],
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      // Token berada dalam PATH URL Better Auth
      // ({base}/api/auth/reset-password/{token}?callbackURL=), bukan query.
      // Halaman kita sendiri menerimanya sebagai ?token=.
      let token = "";
      try {
        token = new URL(url).pathname.split("/").filter(Boolean).at(-1) ?? "";
      } catch {
        token = "";
      }
      if (!token) {
        // Jangan hantar pautan yang rosak secara senyap.
        throw new Error(`[auth] token reset tidak dapat dibaca daripada URL: ${url}`);
      }
      const resetUrl = new URL("/set-semula-kata-laluan", siteOrigin);
      resetUrl.searchParams.set("token", token);
      await sendResetPasswordEmail({ email: user.email, url: resetUrl.toString() });
    },
  },
  session: { expiresIn: 60 * 60 * 24 * 7 },
  user: {
    additionalFields: {
      // `input: false` WAJIB: tanpanya Better Auth menerima `role` daripada
      // badan permintaan sign-up, jadi sesiapa sahaja boleh mendaftar sebagai
      // ADMIN. Peranan hanya diberikan di sisi pelayan (seed/panel admin).
      role: { type: "string", defaultValue: "CUSTOMER", input: false },
    },
  },
});
