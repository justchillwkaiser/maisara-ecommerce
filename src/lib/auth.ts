import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  session: { expiresIn: 60 * 60 * 24 * 7 },
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "CUSTOMER" },
    },
  },
});
