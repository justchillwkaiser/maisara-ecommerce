"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

/**
 * Borang daftar akaun (UX.md Flow C, DESIGN.md 7.5 - Form).
 * name, email, password (min 8). Tiada medan confirm - ringkas.
 * Selepas sign up (Better Auth auto cipta session), redirect terus ke
 * halaman utama + refresh supaya cart/session dikemas kini.
 */
export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const inputClass =
    "h-10 w-full rounded-xl border border-line bg-card px-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/70 focus-visible:border-gold focus-visible:ring-3 focus-visible:ring-gold/25";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const result = await authClient.signUp.email({ name, email, password });
      if (result.error) {
        if (result.error.code === "USER_ALREADY_EXISTS") {
          setError("Email sudah berdaftar. Sila log masuk.");
        } else {
          setError(
            result.error.message ?? "Pendaftaran gagal. Sila cuba sebentar lagi.",
          );
        }
        return;
      }
      // Better Auth sign-up mencipta session terus -> teruskan ke utama.
      router.push("/");
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
        <label htmlFor="register-name" className="mb-1.5 block text-sm text-ink">
          Nama
        </label>
        <input
          id="register-name"
          type="text"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          placeholder="Nama anda"
        />
      </div>
      <div>
        <label htmlFor="register-email" className="mb-1.5 block text-sm text-ink">
          Email
        </label>
        <input
          id="register-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          placeholder="nama@contoh.com"
        />
      </div>
      <div>
        <label htmlFor="register-password" className="mb-1.5 block text-sm text-ink">
          Kata Laluan
        </label>
        <input
          id="register-password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
          placeholder="Sekurang-kurangnya 8 aksara"
        />
        <p className="mt-1.5 text-xs text-ink-soft">
          Minimum 8 aksara.
        </p>
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
        {pending ? "Memproses..." : "Daftar"}
      </button>
    </form>
  );
}
