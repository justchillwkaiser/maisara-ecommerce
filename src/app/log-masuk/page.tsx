import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";
import { safeRelativePath } from "@/lib/safe-redirect";

export const metadata: Metadata = {
  title: "Log Masuk",
  description:
    "Log masuk ke akaun Maisara untuk meneruskan membeli-belah dan mengurus pesanan.",
};

interface LoginPageProps {
  // Parameter query boleh berulang (?next=a&next=b), jadi jenisnya mesti
  // meliputi tatasusunan: nilai bukan-string disahkan sebelum digunakan.
  searchParams: Promise<{ next?: string | string[]; reset?: string | string[] }>;
}

/**
 * Log masuk (UX.md Flow C, DESIGN.md 7.5 - Form).
 * Lajur sempit di tengah: eyebrow mono, tajuk serif, medan dipisah garis halus.
 * Selepas sign in, redirect ke callbackUrl (biasanya halaman yang diminta tadi).
 * ?reset=1 (selepas set semula kata laluan) memaparkan mesej kejayaan.
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next, reset } = await searchParams;
  // `next` datang daripada query string, jadi ia input tidak dipercayai:
  // disahkan sebagai laluan relatif origin-sama sebelum digunakan.
  const callbackUrl = safeRelativePath(next, "/");

  return (
    <div className="shell py-16 md:py-24">
      <div className="mx-auto flex w-full max-w-[26rem] flex-col">
        <header className="text-center">
          <p className="meta-label text-cocoa">Akaun Maisara</p>
          <h1 className="mt-4 font-display text-h2 text-ink">Selamat Kembali</h1>
          <p className="mt-4 text-body-sm text-cocoa">
            Log masuk untuk meneruskan membeli-belah di Maisara.
          </p>
        </header>

        {reset === "1" && (
          <p
            role="alert"
            className="mt-8 border border-line-strong bg-bone px-4 py-3 text-center text-body-sm text-ink"
          >
            Kata laluan berjaya diset semula. Sila log masuk.
          </p>
        )}

        <LoginForm callbackUrl={callbackUrl} />

        <p className="mt-10 text-center text-body-sm text-cocoa">
          Belum ada akaun?{" "}
          <Link
            href="/daftar"
            className="text-ink underline underline-offset-4 transition-colors duration-(--dur-fast) hover:text-cocoa"
          >
            Daftar
          </Link>
        </p>
      </div>
    </div>
  );
}
