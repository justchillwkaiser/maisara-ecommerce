import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";
import { sendResetPasswordEmail } from "@/lib/email-transport";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  trustedOrigins: [
    "http://localhost:3000",
    "https://maisara.vercel.app",
    "https://maisara-beta.vercel.app",
    "https://maisarabutik.vercel.app",
  ].filter(Boolean),
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      // URL Better Auth = {base}/api/auth/reset-password/{token}?callbackURL=
      // (token dalam PATH, bukan query). Bina URL halaman kita sendiri
      // supaya token dihantar sebagai query ?token= kepada /set-semula-kata-laluan.
      const token = url.split("/").pop()?.split("?")[0] ?? "";
      const resetUrl = `${process.env.BETTER_AUTH_URL ?? "http://localhost:3000"}/set-semula-kata-laluan?token=${token}`;
      await sendResetPasswordEmail({ email: user.email, url: resetUrl });
    },
  },
  session: { expiresIn: 60 * 60 * 24 * 7 },
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "CUSTOMER" },
    },
  },
});
