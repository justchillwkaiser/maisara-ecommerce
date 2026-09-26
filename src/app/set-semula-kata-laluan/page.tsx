import type { Metadata } from "next";
import Link from "next/link";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Set Semula Kata Laluan",
  robots: { index: false, follow: false },
};

interface ResetPasswordPageProps {
  // Parameter query boleh berulang (?token=a&token=b) — nilai bukan-string
  // mesti ditolak sebelum dihantar ke Better Auth.
  searchParams: Promise<{ token?: string | string[] }>;
}
/** Panjang maksimum token reset yang munasabah (Better Auth: id 24 aksara). */
const MAX_TOKEN_LENGTH = 256;

/**
 * Set semula kata laluan (P3). Token dari query string (pautan reset).
 * Tanpa token sah, papar mesej pautan tidak sah + link balik ke login.
 */
export default async function SetSemulaKataLaluanPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;
  const resetToken = typeof token === "string" ? token.trim() : "";
  const tokenIsUsable =
    resetToken.length > 0 && resetToken.length <= MAX_TOKEN_LENGTH;

  return (
    <div className="shell py-16 md:py-24">
      <div className="mx-auto flex w-full max-w-[26rem] flex-col">
        <header className="text-center">
          <p className="meta-label text-cocoa">Akaun Maisara</p>
          <h1 className="mt-4 font-display text-h2 text-ink">
            Set Semula Kata Laluan
          </h1>
          <p className="mt-4 text-body-sm text-cocoa">
            Pilih kata laluan baru untuk akaun anda.
          </p>
        </header>

        {tokenIsUsable ? (
          <ResetPasswordForm token={resetToken} />
        ) : (
          <div
            role="alert"
            className="mt-8 border border-line bg-paper-lift p-6 text-center"
          >
            <p className="text-body-sm text-ink">
              Pautan reset tidak sah atau telah tamat tempoh.
            </p>
            <Link
              href="/lupa-kata-laluan"
              className="mt-4 inline-block text-body-sm text-ink underline underline-offset-4 transition-colors duration-(--dur-fast) hover:text-cocoa"
            >
              Minta pautan baharu
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
