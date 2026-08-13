"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

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
      const result = await authClient.signIn.email({ email, password });
      if (result.error) {
        if (result.error.code === "INVALID_EMAIL_OR_PASSWORD") {
          setError("Email atau kata laluan tidak sah.");
        } else {
          setError(result.error.message ?? "Email atau kata laluan tidak sah.");
        }
        return;
      }
      const user = result.data?.user;
      const name = user?.name?.trim() ? user.name : user?.email;
      toast.success(`Selamat kembali, ${name}!`);
      // Admin tanpa callbackUrl khusus -> terus ke panel admin.
      const target =
        callbackUrl !== "/"
          ? callbackUrl
          : (user as { role?: string } | undefined)?.role === "ADMIN"
            ? "/admin"
            : "/";
      router.push(target);
      router.refresh();
    } catch {
      setError("Ralat dalaman. Sila cuba sebentar lagi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <div>
        <label htmlFor="login-email" className="mb-1.5 block text-sm text-ink">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 w-full rounded-xl border border-line bg-card px-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/70 focus-visible:border-gold focus-visible:ring-3 focus-visible:ring-gold/25"
          placeholder="nama@contoh.com"
        />
      </div>
      <div>
        <label htmlFor="login-password" className="mb-1.5 block text-sm text-ink">
          Kata Laluan
        </label>
        <input
          id="login-password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-10 w-full rounded-xl border border-line bg-card px-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/70 focus-visible:border-gold focus-visible:ring-3 focus-visible:ring-gold/25"
          placeholder="••••••••"
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="flex h-11 w-full items-center justify-center rounded-full bg-gold px-7 text-sm font-medium text-card transition-all hover:bg-gold-deep focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Memproses..." : "Log Masuk"}
      </button>
      <p className="text-center text-xs text-ink-soft">
        Demo: nurul@maisara.my / Demo123!
      </p>
    </form>
  );
}
