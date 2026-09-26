"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
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
 * Borang daftar akaun (UX.md Flow C, DESIGN.md 7.5 - Form).
 * name, email, password (min 8). Tiada medan confirm - ringkas.
 * Selepas sign up (Better Auth auto cipta session), toast feedback +
 * redirect ke halaman utama + refresh supaya cart/session dikemas kini.
 */
export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  // Medan yang dirujuk ralat, untuk aria-invalid/aria-describedby yang tepat.
  const [errorField, setErrorField] = useState<"name" | "email" | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const trimmedName = name.trim();
    // Better Auth tiada had minimum untuk nama, jadi nama kosong (atau hanya
    // ruang) mesti ditolak di sini sebelum akaun dicipta tanpa nama.
    if (!trimmedName) {
      setError("Sila masukkan nama anda.");
      setErrorField("name");
      return;
    }
    setPending(true);
    setError(null);
    setErrorField(null);
    try {
      const result = await authClient.signUp.email({
        name: trimmedName,
        email: email.trim(),
        password,
      });
      if (result.error) {
        if (
          result.error.code === "USER_ALREADY_EXISTS" ||
          result.error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
        ) {
          setError("Email sudah berdaftar. Sila log masuk.");
          setErrorField("email");
          return;
        }
        setError(
          authErrorMessage(
            result.error,
            "Pendaftaran tidak berjaya. Sila cuba sebentar lagi.",
            PASSWORD_ERROR_MESSAGES,
          ),
        );
        return;
      }
      // Better Auth sign-up mencipta session terus -> toast + ke utama.
      toast.success(`Akaun berjaya didaftarkan. Selamat datang, ${trimmedName}!`);
      router.push("/");
      router.refresh();
    } catch (caught) {
      console.error("[auth] pendaftaran gagal:", caught);
      setError("Ralat dalaman. Sila cuba sebentar lagi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10" aria-busy={pending}>
      <div className="divide-y divide-line border-y border-line">
        <div className="py-5">
          <label htmlFor="register-name" className="meta-label block text-cocoa">
            Nama
          </label>
          <Input
            id="register-name"
            type="text"
            required
            maxLength={80}
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama anda"
            aria-invalid={errorField === "name"}
            aria-describedby={errorField === "name" ? "register-error" : undefined}
            className={fieldClass}
          />
        </div>
        <div className="py-5">
          <label htmlFor="register-email" className="meta-label block text-cocoa">
            Email
          </label>
          <Input
            id="register-email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@contoh.com"
            aria-invalid={errorField === "email"}
            aria-describedby={errorField === "email" ? "register-error" : undefined}
            className={fieldClass}
          />
        </div>
        <div className="py-5">
          <label htmlFor="register-password" className="meta-label block text-cocoa">
            Kata Laluan
          </label>
          <Input
            id="register-password"
            type="password"
            required
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Sekurang-kurangnya 8 aksara"
            className={fieldClass}
          />
          <p className="mt-2 text-body-sm text-cocoa">Minimum 8 aksara.</p>
        </div>
      </div>

      <div aria-live="polite" className="min-h-6 pt-4">
        {error ? (
          <p id="register-error" className="text-body-sm text-oxblood">
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
        {pending ? "Memproses..." : "Daftar"}
      </Button>
    </form>
  );
}
