import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  trustedOrigins: [
    "http://localhost:3000",
    "https://maisara.vercel.app",
    "https://maisara-beta.vercel.app",
    "https://maisarabutik.vercel.app",
  ].filter(Boolean),
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  session: { expiresIn: 60 * 60 * 24 * 7 },
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "CUSTOMER" },
    },
  },
});
