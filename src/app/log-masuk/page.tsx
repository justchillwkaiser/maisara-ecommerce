import { LoginForm } from "@/components/auth/login-form";

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

/**
 * Log masuk (UX.md Flow C). Placeholder ringkas - Task 11 (akaun) akan
 * polish penuh (register, forgot password, dll). Selepas sign in, redirect
 * ke callbackUrl (biasanya halaman checkout yang diminta tadi).
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;
  const callbackUrl = next && next.startsWith("/") ? next : "/";

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-16">
      <div className="text-center">
        <h1 className="font-serif text-3xl text-ink">Selamat Kembali</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Log masuk untuk meneruskan membeli-belah di Maisara.
        </p>
      </div>
      <LoginForm callbackUrl={callbackUrl} />
    </div>
  );
}
