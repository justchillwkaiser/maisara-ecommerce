"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import {
  PASSWORD_ERROR_MESSAGES,
  authErrorMessage,
} from "@/components/auth/auth-error";

/** Medan auth: 44px tinggi, radius 2px, fokus 2px (lihat login-form). */
const fieldClass = "mt-3 h-11 rounded-xs focus-visible:ring-2";

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
  // Medan yang dirujuk ralat, untuk aria-invalid/aria-describedby yang tepat.
  const [errorField, setErrorField] = useState<"new" | "confirm" | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    if (newPassword.length < 8) {
      setError("Kata laluan mesti sekurang-kurangnya 8 aksara.");
      setErrorField("new");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Kata laluan tidak sepadan.");
      setErrorField("confirm");
      return;
    }
    setPending(true);
    setError(null);
    setErrorField(null);
    try {
      const result = await authClient.resetPassword({ newPassword, token });
      if (result.error) {
        setError(
          authErrorMessage(
            result.error,
            "Pautan reset tidak sah atau telah tamat tempoh. Minta pautan baharu.",
            {
              INVALID_TOKEN: "Pautan reset tidak sah atau telah tamat tempoh.",
              ...PASSWORD_ERROR_MESSAGES,
            },
          ),
        );
        return;
      }
      toast.success("Kata laluan berjaya diset semula.");
      router.push("/log-masuk?reset=1");
      router.refresh();
    } catch (caught) {
      console.error("[auth] set semula kata laluan gagal:", caught);
      setError("Ralat dalaman. Sila cuba sebentar lagi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10" aria-busy={pending}>
      <div className="divide-y divide-line border-y border-line">
        <div className="py-5">
          <label
            htmlFor="reset-new-password"
            className="meta-label block text-cocoa"
          >
            Kata Laluan Baru
          </label>
          <Input
            id="reset-new-password"
            type="password"
            required
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Sekurang-kurangnya 8 aksara"
            aria-invalid={errorField === "new"}
            aria-describedby={errorField === "new" ? "reset-error" : undefined}
            className={fieldClass}
          />
        </div>
        <div className="py-5">
          <label
            htmlFor="reset-confirm-password"
            className="meta-label block text-cocoa"
          >
            Sahkan Kata Laluan
          </label>
          <Input
            id="reset-confirm-password"
            type="password"
            required
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Ulang kata laluan baru"
            aria-invalid={errorField === "confirm"}
            aria-describedby={
              errorField === "confirm" ? "reset-error" : undefined
            }
            className={fieldClass}
          />
        </div>
      </div>

      <div aria-live="polite" className="min-h-6 pt-4">
        {error ? (
          <p id="reset-error" className="text-body-sm text-oxblood">
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
        {pending ? "Memproses..." : "Set Semula Kata Laluan"}
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
