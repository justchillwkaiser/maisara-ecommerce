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

/** Medan akaun: 44px tinggi, radius 2px, fokus 2px. */
const fieldClass = "mt-3 h-11 rounded-xs focus-visible:ring-2";

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
  // Medan yang dirujuk ralat, untuk aria-invalid/aria-describedby yang tepat.
  const [passwordErrorField, setPasswordErrorField] = useState<
    "current" | "new" | "confirm" | null
  >(null);

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
        setNameError(
          authErrorMessage(
            result.error,
            "Tidak dapat mengemas kini nama. Sila cuba sebentar lagi.",
          ),
        );
        return;
      }
      toast.success("Nama berjaya dikemas kini.");
      router.refresh();
    } catch (caught) {
      console.error("[akaun] kemas kini nama gagal:", caught);
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
      setPasswordErrorField("new");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Kata laluan baru tidak sepadan.");
      setPasswordErrorField("confirm");
      return;
    }
    setSavingPassword(true);
    setPasswordError(null);
    setPasswordErrorField(null);
    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
      });
      if (result.error) {
        if (result.error.code === "INVALID_PASSWORD") {
          setPasswordError("Kata laluan semasa tidak sah.");
          setPasswordErrorField("current");
        } else {
          setPasswordError(
            authErrorMessage(
              result.error,
              "Tidak dapat menukar kata laluan. Sila cuba sebentar lagi.",
              PASSWORD_ERROR_MESSAGES,
            ),
          );
        }
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Kata laluan berjaya ditukar.");
      router.refresh();
    } catch (caught) {
      console.error("[akaun] tukar kata laluan gagal:", caught);
      setPasswordError("Ralat dalaman. Sila cuba sebentar lagi.");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="space-y-12">
      {/* Edit nama */}
      <form onSubmit={handleSaveName} aria-busy={savingName}>
        <h3 className="meta-label text-cocoa">Maklumat Asas</h3>
        <div className="mt-5 divide-y divide-line border-y border-line">
          <div className="py-5">
            <label htmlFor="profile-name" className="meta-label block text-cocoa">
              Nama
            </label>
            <Input
              id="profile-name"
              type="text"
              required
              maxLength={80}
              autoComplete="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              aria-invalid={Boolean(nameError)}
              aria-describedby={nameError ? "profile-name-error" : undefined}
              className={fieldClass}
            />
          </div>
          <div className="py-5">
            <label htmlFor="profile-email" className="meta-label block text-cocoa">
              Email
            </label>
            <Input
              id="profile-email"
              type="email"
              disabled
              value={email}
              className={fieldClass}
            />
            <p className="mt-2 text-body-sm text-cocoa">
              Email tidak boleh ditukar dalam versi ini.
            </p>
          </div>
        </div>

        <div aria-live="polite" className="min-h-6 pt-4">
          {nameError ? (
            <p id="profile-name-error" className="text-body-sm text-oxblood">
              {nameError}
            </p>
          ) : null}
        </div>

        <Button type="submit" disabled={savingName} aria-busy={savingName}>
          {savingName ? "Menyimpan..." : "Simpan Nama"}
        </Button>
      </form>

      <div className="border-t border-line pt-10">
        <h3 className="font-display text-h3 text-ink">Tukar Kata Laluan</h3>
        <form onSubmit={handleChangePassword} className="mt-6" aria-busy={savingPassword}>
          <div className="divide-y divide-line border-y border-line">
            <div className="py-5">
              <label
                htmlFor="password-current"
                className="meta-label block text-cocoa"
              >
                Kata Laluan Semasa
              </label>
              <Input
                id="password-current"
                type="password"
                required
                maxLength={128}
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                aria-invalid={passwordErrorField === "current"}
                aria-describedby={
                  passwordErrorField === "current" ? "profile-password-error" : undefined
                }
                className={fieldClass}
              />
            </div>
            <div className="py-5">
              <label htmlFor="password-new" className="meta-label block text-cocoa">
                Kata Laluan Baru
              </label>
              <Input
                id="password-new"
                type="password"
                required
                minLength={8}
                maxLength={128}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Sekurang-kurangnya 8 aksara"
                aria-invalid={passwordErrorField === "new"}
                aria-describedby={
                  passwordErrorField === "new" ? "profile-password-error" : undefined
                }
                className={fieldClass}
              />
            </div>
            <div className="py-5">
              <label
                htmlFor="password-confirm"
                className="meta-label block text-cocoa"
              >
                Sahkan Kata Laluan Baru
              </label>
              <Input
                id="password-confirm"
                type="password"
                required
                minLength={8}
                maxLength={128}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulang kata laluan baru"
                aria-invalid={passwordErrorField === "confirm"}
                aria-describedby={
                  passwordErrorField === "confirm"
                    ? "profile-password-error"
                    : undefined
                }
                className={fieldClass}
              />
            </div>
          </div>

          <div aria-live="polite" className="min-h-6 pt-4">
            {passwordError ? (
              <p id="profile-password-error" className="text-body-sm text-oxblood">
                {passwordError}
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            variant="outline"
            disabled={savingPassword}
            aria-busy={savingPassword}
          >
            {savingPassword ? "Menyimpan..." : "Tukar Kata Laluan"}
          </Button>
        </form>
      </div>
    </div>
  );
}
