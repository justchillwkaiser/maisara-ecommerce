"use client";

import { SignOut, User } from "@phosphor-icons/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export interface HeaderUser {
  id: string;
  name?: string | null;
  email: string;
  role?: string;
}

/** Penyesuaian untuk header telus (data-state="top") di atas hero gelap. */
const GHOST_ON_HERO = cn(
  "group-data-[state=top]:text-paper/80",
  "group-data-[state=top]:hover:bg-paper/10 group-data-[state=top]:hover:text-paper",
);
const OUTLINE_ON_HERO = cn(
  "group-data-[state=top]:border-paper/40 group-data-[state=top]:text-paper",
  "group-data-[state=top]:hover:border-paper group-data-[state=top]:hover:bg-paper/10",
);
const FILL_ON_HERO = cn(
  "group-data-[state=top]:bg-paper group-data-[state=top]:text-ink",
  "group-data-[state=top]:hover:bg-paper/90",
);

/**
 * Kawasan auth di header (desktop). Session datang dari server (Header
 * ambil via auth.api.getSession) supaya hydration konsisten; selepas
 * login/logout, router.refresh() memuatkan semula props.
 * - Logged in: nama user (link /akaun) + link Admin (jika role ADMIN) + Log Keluar.
 * - Guest: Log Masuk + Daftar.
 */
export function AuthNav({ user }: { user: HeaderUser | null }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const result = await authClient.signOut();
      if (result.error) {
        // Session masih aktif — jangan arah keluar dan jangan umumkan kejayaan.
        console.error("[auth] log keluar gagal:", result.error);
        toast.error("Log keluar tidak berjaya. Sila cuba lagi.");
        return;
      }
      toast.success("Anda telah log keluar.");
      router.push("/");
      router.refresh();
    } catch (caught) {
      console.error("[auth] log keluar gagal:", caught);
      toast.error("Log keluar tidak berjaya. Sila cuba lagi.");
    } finally {
      setSigningOut(false);
    }
  }

  if (!user) {
    return (
      <div className="hidden items-center gap-2 lg:flex">
        <Button asChild variant="outline" className={OUTLINE_ON_HERO}>
          <Link href="/log-masuk">Log Masuk</Link>
        </Button>
        <Button asChild className={FILL_ON_HERO}>
          <Link href="/daftar">Daftar</Link>
        </Button>
      </div>
    );
  }

  const name = user.name?.trim() ? user.name : user.email;

  return (
    <div className="hidden items-center gap-2 lg:flex">
      <Link
        href="/akaun"
        className={cn(
          "flex h-11 items-center gap-2 rounded-xs px-3 text-body-sm text-ink",
          "transition-colors duration-(--dur-fast) hover:bg-bone",
          GHOST_ON_HERO,
        )}
      >
        <User
          size={18}
          aria-hidden="true"
          className="text-cocoa group-data-[state=top]:text-paper/70"
        />
        <span className="max-w-[10rem] truncate">{name}</span>
      </Link>
      {user.role === "ADMIN" && (
        <Button asChild variant="outline" className={OUTLINE_ON_HERO}>
          <Link href="/admin">Admin</Link>
        </Button>
      )}
      <button
        type="button"
        onClick={() => void handleSignOut()}
        disabled={signingOut}
        aria-busy={signingOut}
        aria-label="Log keluar"
        title="Log keluar"
        className={cn(
          "flex size-11 items-center justify-center rounded-xs text-cocoa",
          "transition-colors duration-(--dur-fast) hover:bg-bone hover:text-danger",
          GHOST_ON_HERO,
        )}
      >
        <SignOut size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
