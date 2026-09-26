"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/components/auth/auth-error";
import { PRIMARY_CONTACT_EMAIL } from "@/lib/site";

/** Medan auth: 44px tinggi, radius 2px, fokus 2px (lihat login-form). */
const fieldClass = "mt-3 h-11 rounded-xs focus-visible:ring-2";

/**
 * Borang lupa kata laluan (P3). Hantar email via Better Auth
 * requestPasswordReset. Mesej sentiasa generik (jangan dedah sama ada
 * email wujud). Keadaan penyedia e-mel pelayan diberitahu oleh halaman
 * (`emailConfigured`) supaya borang tidak mendakwa pautan telah dihantar
 * sedangkan tiada penghantaran berlaku.
 */
export function ForgotPasswordForm({
  emailConfigured,
}: {
  /**
   * Keadaan sebenar pelayan (dari `isEmailConfigured()`), bukan tekaan.
   * Tanpa penyedia e-mel, permintaan tetap diterima oleh Better Auth tetapi
   * TIADA pautan dihantar — jadi borang tidak boleh mendakwa sebaliknya.
   */
  emailConfigured: boolean;
}) {
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
      const result = await authClient.requestPasswordReset({
        email: email.trim(),
      });
      if (result.error) {
        setError(
          authErrorMessage(
            result.error,
            "Tidak dapat menghantar pautan reset. Sila cuba sebentar lagi.",
          ),
        );
        return;
      }
      setSent(true);
    } catch (caught) {
      console.error("[auth] permintaan reset gagal:", caught);
      setError("Ralat dalaman. Sila cuba sebentar lagi.");
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <div
        role="alert"
        className="mt-10 border border-line-strong bg-bone p-6"
      >
        <p className="text-body-sm text-ink">
          {emailConfigured
            ? "Jika akaun wujud untuk alamat itu, pautan set semula telah dihantar ke inbox anda."
            : "Permintaan anda diterima, tetapi penghantaran e-mel belum diaktifkan pada pelayan ini — jadi tiada pautan dihantar."}
        </p>
        <p className="mt-3 font-mono text-body-sm text-cocoa">
          {emailConfigured
            ? "Tidak nampak e-mel? Semak folder spam sebelum mencuba lagi."
            : `E-mel kami terus di ${PRIMARY_CONTACT_EMAIL} dan kami akan bantu.`}
        </p>
        <Link
          href="/log-masuk"
          className="mt-5 inline-block text-body-sm text-ink underline underline-offset-4 transition-colors duration-(--dur-fast) hover:text-cocoa"
        >
          Kembali ke Log Masuk
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10" aria-busy={pending}>
      <div className="border-y border-line py-5">
        <label htmlFor="reset-email" className="meta-label block text-cocoa">
          Email
        </label>
        <Input
          id="reset-email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nama@contoh.com"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "forgot-error" : undefined}
          className={fieldClass}
        />
      </div>

      <div aria-live="polite" className="min-h-6 pt-4">
        {error ? (
          <p id="forgot-error" className="text-body-sm text-oxblood">
            {error}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="mt-5 w-full"
      >
        {pending ? "Memproses..." : "Hantar Pautan Reset"}
      </Button>

      <p className="mt-6 text-center">
        <Link
          href="/log-masuk"
          className="text-body-sm text-ink underline underline-offset-4 transition-colors duration-(--dur-fast) hover:text-cocoa"
        >
          Kembali ke Log Masuk
        </Link>
      </p>
    </form>
  );
}
