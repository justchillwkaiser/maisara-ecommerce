import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { isEmailConfigured } from "@/lib/email-transport";

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
    <div className="shell py-16 md:py-24">
      <div className="mx-auto flex w-full max-w-[26rem] flex-col">
        <header className="text-center">
          <p className="meta-label text-cocoa">Akaun Maisara</p>
          <h1 className="mt-4 font-display text-h2 text-ink">Lupa Kata Laluan</h1>
          <p className="mt-4 text-body-sm text-cocoa">
            Masukkan email anda; kami akan hantar pautan untuk set semula kata
            laluan.
          </p>
        </header>

        <ForgotPasswordForm emailConfigured={isEmailConfigured()} />
      </div>
    </div>
  );
}
