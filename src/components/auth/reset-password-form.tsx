"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

/**
 * Borang set semula kata laluan (P3). Token diambil dari query string
 * (dihantar melalui pautan reset). Selepas berjaya, redirect ke /log-masuk?reset=1
 * supaya halaman login papar mesej success.
 */
export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    if (newPassword.length < 8) {
      setError("Kata laluan mesti sekurang-kurangnya 8 aksara.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Kata laluan tidak sepadan.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const result = await authClient.resetPassword({ newPassword, token });
      if (result.error) {
        setError(
          result.error.message ?? "Pautan reset tidak sah atau telah tamat tempoh.",
        );
        return;
      }
      toast.success("Kata laluan berjaya diset semula.");
      router.push("/log-masuk?reset=1");
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
        <label htmlFor="reset-new-password" className="mb-1.5 block text-sm text-ink">
          Kata Laluan Baru
        </label>
        <input
          id="reset-new-password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="h-10 w-full rounded-xl border border-line bg-card px-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/70 focus-visible:border-gold focus-visible:ring-3 focus-visible:ring-gold/25"
          placeholder="Sekurang-kurangnya 8 aksara"
        />
      </div>
      <div>
        <label htmlFor="reset-confirm-password" className="mb-1.5 block text-sm text-ink">
          Sahkan Kata Laluan
        </label>
        <input
          id="reset-confirm-password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="h-10 w-full rounded-xl border border-line bg-card px-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/70 focus-visible:border-gold focus-visible:ring-3 focus-visible:ring-gold/25"
          placeholder="Ulang kata laluan baru"
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
        {pending ? "Memproses..." : "Set Semula Kata Laluan"}
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
