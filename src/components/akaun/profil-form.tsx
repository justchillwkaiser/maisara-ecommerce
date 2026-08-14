"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const inputClass =
  "h-10 w-full rounded-xl border border-line bg-card px-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/70 focus-visible:border-gold focus-visible:ring-3 focus-visible:ring-gold/25";

/**
 * Borang profil akaun (P3): edit nama + tukar kata laluan.
 * Nama -> authClient.updateUser; kata laluan -> authClient.changePassword.
 * Selepas berjaya, refresh supaya header/layout papar nilai baru.
 */
export function ProfilForm({ name, email }: { name: string; email: string }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(name);
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  async function handleSaveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (savingName) return;
    const trimmed = displayName.trim();
    if (!trimmed) {
      setNameError("Nama tidak boleh kosong.");
      return;
    }
    setSavingName(true);
    setNameError(null);
    try {
      const result = await authClient.updateUser({ name: trimmed });
      if (result.error) {
        setNameError(result.error.message ?? "Tidak dapat mengemas kini nama.");
        return;
      }
      toast.success("Nama berjaya dikemas kini.");
      router.refresh();
    } catch {
      setNameError("Ralat dalaman. Sila cuba sebentar lagi.");
    } finally {
      setSavingName(false);
    }
  }

  async function handleChangePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (savingPassword) return;
    if (newPassword.length < 8) {
      setPasswordError("Kata laluan baru mesti sekurang-kurangnya 8 aksara.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Kata laluan baru tidak sepadan.");
      return;
    }
    setSavingPassword(true);
    setPasswordError(null);
    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
      });
      if (result.error) {
        if (result.error.code === "INVALID_PASSWORD") {
          setPasswordError("Kata laluan semasa tidak sah.");
        } else {
          setPasswordError(result.error.message ?? "Tidak dapat menukar kata laluan.");
        }
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Kata laluan berjaya ditukar.");
      router.refresh();
    } catch {
      setPasswordError("Ralat dalaman. Sila cuba sebentar lagi.");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Edit nama */}
      <form onSubmit={handleSaveName} className="space-y-4">
        <div>
          <label htmlFor="profile-name" className="mb-1.5 block text-sm text-ink">
            Nama
          </label>
          <input
            id="profile-name"
            type="text"
            required
            autoComplete="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="profile-email" className="mb-1.5 block text-sm text-ink">
            Email
          </label>
          <input
            id="profile-email"
            type="email"
            disabled
            value={email}
            className={`${inputClass} cursor-not-allowed opacity-60`}
          />
          <p className="mt-1.5 text-xs text-ink-soft">
            Email tidak boleh ditukar dalam versi ini.
          </p>
        </div>
        {nameError && (
          <p role="alert" className="text-sm text-danger">
            {nameError}
          </p>
        )}
        <button
          type="submit"
          disabled={savingName}
          className="flex h-10 items-center justify-center rounded-full bg-gold px-6 text-sm font-medium text-card transition-all hover:bg-gold-deep focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          {savingName ? "Menyimpan..." : "Simpan Nama"}
        </button>
      </form>

      <div className="border-t border-line pt-6">
        <h3 className="font-serif text-xl font-medium text-ink">Tukar Kata Laluan</h3>
        <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
          <div>
            <label htmlFor="password-current" className="mb-1.5 block text-sm text-ink">
              Kata Laluan Semasa
            </label>
            <input
              id="password-current"
              type="password"
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label htmlFor="password-new" className="mb-1.5 block text-sm text-ink">
              Kata Laluan Baru
            </label>
            <input
              id="password-new"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
              placeholder="Sekurang-kurangnya 8 aksara"
            />
          </div>
          <div>
            <label htmlFor="password-confirm" className="mb-1.5 block text-sm text-ink">
              Sahkan Kata Laluan Baru
            </label>
            <input
              id="password-confirm"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
              placeholder="Ulang kata laluan baru"
            />
          </div>
          {passwordError && (
            <p role="alert" className="text-sm text-danger">
              {passwordError}
            </p>
          )}
          <button
            type="submit"
            disabled={savingPassword}
            className="flex h-10 items-center justify-center rounded-full border border-gold/40 px-6 text-sm font-medium text-gold-deep transition-all hover:bg-gold-tint focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingPassword ? "Menyimpan..." : "Tukar Kata Laluan"}
          </button>
        </form>
      </div>
    </div>
  );
}
