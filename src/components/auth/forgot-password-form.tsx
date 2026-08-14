"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

/**
 * Borang lupa kata laluan (P3). Hantar email via Better Auth
 * requestPasswordReset. Mesej sentiasa generik (jangan dedah sama ada
 * email wujud). Dalam demo, pautan reset di-log ke console server.
 */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const result = await authClient.requestPasswordReset({ email });
      if (result.error) {
        setError(result.error.message ?? "Tidak dapat menghantar pautan reset.");
        return;
      }
      setSent(true);
    } catch {
      setError("Ralat dalaman. Sila cuba sebentar lagi.");
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <div role="alert" className="mt-8 rounded-2xl border border-line bg-card p-6">
        <p className="text-sm text-ink">
          Jika akaun wujud, pautan reset telah dihantar ke email anda.
        </p>
        <p className="mt-2 text-xs text-ink-soft">
          Demo: pautan reset dipaparkan dalam log server (console).
        </p>
        <Link
          href="/log-masuk"
          className="mt-4 inline-block text-sm font-medium text-gold-deep underline underline-offset-2 transition-colors hover:text-gold"
        >
          Kembali ke Log Masuk
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <div>
        <label htmlFor="reset-email" className="mb-1.5 block text-sm text-ink">
          Email
        </label>
        <input
          id="reset-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 w-full rounded-xl border border-line bg-card px-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/70 focus-visible:border-gold focus-visible:ring-3 focus-visible:ring-gold/25"
          placeholder="nama@contoh.com"
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
        {pending ? "Memproses..." : "Hantar Pautan Reset"}
      </button>
      <p className="text-center text-xs text-ink-soft">
        <Link
          href="/log-masuk"
          className="font-medium text-gold-deep underline underline-offset-2 transition-colors hover:text-gold"
        >
          Kembali ke Log Masuk
        </Link>
      </p>
    </form>
  );
}
