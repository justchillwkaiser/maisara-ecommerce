"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { safeRelativePath } from "@/lib/safe-redirect";
import { authErrorMessage } from "@/components/auth/auth-error";

/**
 * Medan borang auth: 44px tinggi, radius 2px, fokus 2px — supaya semua
 * borang akaun berkongsi bentuk yang sama tanpa menimpa asas <Input> admin.
 */
const fieldClass = "mt-3 h-11 rounded-xs focus-visible:ring-2";

/**
 * Borang log masuk (DESIGN.md 7.5 - Form). Selepas sign in:
 * - Toast feedback "Selamat kembali, <nama>!".
 * - Redirect ke callbackUrl; jika tiada (default "/"), admin -> /admin, lain -> /.
 * - Refresh supaya session/cart dikemas kini (CartSync dalam providers mengurus merge cart).
 */
export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
      });
      if (result.error) {
        setError(
          authErrorMessage(result.error, "Email atau kata laluan tidak sah.", {
            INVALID_EMAIL_OR_PASSWORD: "Email atau kata laluan tidak sah.",
          }),
        );
        return;
      }
      const user = result.data?.user;
      const name = user?.name?.trim() ? user.name : user?.email;
      toast.success(`Selamat kembali, ${name}!`);
      // Admin tanpa callbackUrl khusus -> terus ke panel admin.
      // callbackUrl disahkan sekali lagi di sini: komponen ini tidak boleh
      // bergantung pada pemanggil untuk menghalang open redirect.
      const requested = safeRelativePath(callbackUrl, "/");
      const target =
        requested !== "/"
          ? requested
          : (user as { role?: string } | undefined)?.role === "ADMIN"
            ? "/admin"
            : "/";
      router.push(target);
      router.refresh();
    } catch (caught) {
      console.error("[auth] log masuk gagal:", caught);
      setError("Ralat dalaman. Sila cuba sebentar lagi.");
    } finally {
      setPending(false);
    }
  }

  // Email dan kata laluan ialah satu pasangan kelayakan: ralat log masuk tidak
  // boleh dipetakan kepada satu medan sahaja, jadi kedua-duanya ditanda.
  const credentialsInvalid = Boolean(error);

  return (
    <form onSubmit={handleSubmit} className="mt-10" aria-busy={pending}>
      <div className="divide-y divide-line border-y border-line">
        <div className="py-5">
          <label htmlFor="login-email" className="meta-label block text-cocoa">
            Email
          </label>
          <Input
            id="login-email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@contoh.com"
            aria-invalid={credentialsInvalid}
            aria-describedby={credentialsInvalid ? "login-error" : undefined}
            className={fieldClass}
          />
        </div>
        <div className="py-5">
          <label htmlFor="login-password" className="meta-label block text-cocoa">
            Kata Laluan
          </label>
          <Input
            id="login-password"
            type="password"
            required
            maxLength={128}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            aria-invalid={credentialsInvalid}
            aria-describedby={credentialsInvalid ? "login-error" : undefined}
            className={fieldClass}
          />
        </div>
      </div>

      {/* Ruang hidup yang sentiasa ada supaya mesej diumumkan tanpa mengalih susun atur. */}
      <div aria-live="polite" className="min-h-6 pt-4">
        {error ? (
          <p id="login-error" className="text-body-sm text-oxblood">
            {error}
          </p>
        ) : null}
      </div>

      <div className="flex justify-end">
        <Link
          href="/lupa-kata-laluan"
          className="meta-label text-cocoa underline underline-offset-4 transition-colors duration-(--dur-fast) hover:text-ink"
        >
          Lupa kata laluan?
        </Link>
      </div>

      <Button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="mt-5 w-full"
      >
        {pending ? "Memproses..." : "Log Masuk"}
      </Button>

      <p className="mt-6 text-center font-mono text-body-sm text-cocoa">
        Demo: nurul@maisara.my / Demo123!
      </p>
    </form>
  );
}
