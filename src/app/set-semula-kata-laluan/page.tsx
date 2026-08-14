import type { Metadata } from "next";
import Link from "next/link";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Set Semula Kata Laluan",
  robots: { index: false, follow: false },
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

/**
 * Set semula kata laluan (P3). Token dari query string (pautan reset).
 * Tanpa token sah, papar mesej pautan tidak sah + link balik ke login.
 */
export default async function SetSemulaKataLaluanPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-16 md:py-24">
      <div className="text-center">
        <p className="text-xs tracking-wide text-ink-soft uppercase">Akaun Maisara</p>
        <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight text-ink md:text-4xl">
          Set Semula Kata Laluan
        </h1>
        <p className="mt-3 text-sm text-ink-soft">
          Pilih kata laluan baru untuk akaun anda.
        </p>
      </div>

      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div role="alert" className="mt-8 rounded-2xl border border-line bg-card p-6 text-center">
          <p className="text-sm text-ink">Pautan reset tidak sah atau telah tamat tempoh.</p>
          <Link
            href="/lupa-kata-laluan"
            className="mt-4 inline-block text-sm font-medium text-gold-deep underline underline-offset-2 transition-colors hover:text-gold"
          >
            Minta pautan baharu
          </Link>
        </div>
      )}
    </div>
  );
}
