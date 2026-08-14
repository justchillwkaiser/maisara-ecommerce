import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Lupa Kata Laluan",
  robots: { index: false, follow: false },
};

/**
 * Lupa kata laluan (P3). Form email -> Better Auth requestPasswordReset.
 * Selepas submit, papar mesej generik (security: jangan dedah email wujud).
 */
export default function LupaKataLaluanPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-16 md:py-24">
      <div className="text-center">
        <p className="text-xs tracking-wide text-ink-soft uppercase">Akaun Maisara</p>
        <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight text-ink md:text-4xl">
          Lupa Kata Laluan
        </h1>
        <p className="mt-3 text-sm text-ink-soft">
          Masukkan email anda; kami akan hantar pautan untuk set semula kata laluan.
        </p>
      </div>

      <ForgotPasswordForm />
    </div>
  );
}
