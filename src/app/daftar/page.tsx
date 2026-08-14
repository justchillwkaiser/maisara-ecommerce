import type { Metadata } from "next";
import Link from "next/link";

import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Daftar Akaun",
  description:
    "Daftar akaun Maisara untuk menyimpan wishlist, mengurus pesanan dan checkout lebih pantas.",
};

/**
 * Daftar akaun (UX.md Flow C, DESIGN.md 7.5 - Form).
 * Layout tengah max-w-md, tajuk serif. Selepas daftar, terus ke halaman
 * utama (session auto dicipta oleh Better Auth).
 */
export default function RegisterPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-16 md:py-24">
      <div className="text-center">
        <p className="text-xs tracking-wide text-ink-soft uppercase">Akaun Maisara</p>
        <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight text-ink md:text-4xl">
          Sertai Maisara
        </h1>
        <p className="mt-3 text-sm text-ink-soft">
          Cipta akaun untuk menjejaki pesanan dan menyimpan wishlist anda.
        </p>
      </div>

      <RegisterForm />

      <p className="mt-8 text-center text-sm text-ink-soft">
        Sudah ada akaun?{" "}
        <Link
          href="/log-masuk"
          className="font-medium text-gold-deep transition-colors hover:text-gold"
        >
          Log masuk
        </Link>
      </p>
    </div>
  );
}
