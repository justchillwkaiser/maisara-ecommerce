import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Log Masuk",
  description:
    "Log masuk ke akaun Maisara untuk meneruskan membeli-belah dan mengurus pesanan.",
};

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

/**
 * Log masuk (UX.md Flow C, DESIGN.md 7.5 - Form).
 * Layout tengah max-w-md, tajuk serif "Selamat Kembali". Selepas sign in,
 * redirect ke callbackUrl (biasanya halaman yang diminta tadi).
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;
  const callbackUrl = next && next.startsWith("/") ? next : "/";

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-16 md:py-24">
      <div className="text-center">
        <p className="text-xs tracking-wide text-ink-soft uppercase">Akaun Maisara</p>
        <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight text-ink md:text-4xl">
          Selamat Kembali
        </h1>
        <p className="mt-3 text-sm text-ink-soft">
          Log masuk untuk meneruskan membeli-belah di Maisara.
        </p>
      </div>

      <LoginForm callbackUrl={callbackUrl} />

      <p className="mt-8 text-center text-sm text-ink-soft">
        Belum ada akaun?{" "}
        <Link
          href="/daftar"
          className="font-medium text-gold-deep transition-colors hover:text-gold"
        >
          Daftar
        </Link>
      </p>
    </div>
  );
}
