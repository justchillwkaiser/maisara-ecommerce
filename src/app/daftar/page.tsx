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
 * Lajur sempit di tengah, tajuk serif. Selepas daftar, terus ke halaman
 * utama (session auto dicipta oleh Better Auth).
 */
export default function RegisterPage() {
  return (
    <div className="shell py-16 md:py-24">
      <div className="mx-auto flex w-full max-w-[26rem] flex-col">
        <header className="text-center">
          <p className="meta-label text-cocoa">Akaun Maisara</p>
          <h1 className="mt-4 font-display text-h2 text-ink">Sertai Maisara</h1>
          <p className="mt-4 text-body-sm text-cocoa">
            Cipta akaun untuk menjejaki pesanan dan menyimpan wishlist anda.
          </p>
        </header>

        <RegisterForm />

        <p className="mt-10 text-center text-body-sm text-cocoa">
          Sudah ada akaun?{" "}
          <Link
            href="/log-masuk"
            className="text-ink underline underline-offset-4 transition-colors duration-(--dur-fast) hover:text-cocoa"
          >
            Log masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
