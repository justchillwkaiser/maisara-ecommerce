"use client";

import { SignOut, User } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export interface HeaderUser {
  id: string;
  name?: string | null;
  email: string;
  role?: string;
}

/**
 * Kawasan auth di header (desktop). Session datang dari server (Header
 * ambil via auth.api.getSession) supaya hydration konsisten; selepas
 * login/logout, router.refresh() memuatkan semula props.
 * - Logged in: nama user (link /akaun) + link Admin (jika role ADMIN) + Log Keluar.
 * - Guest: Log Masuk + Daftar.
 */
export function AuthNav({ user }: { user: HeaderUser | null }) {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    toast.success("Anda telah log keluar.");
    router.push("/");
    router.refresh();
  }

  if (!user) {
    return (
      <div className="hidden items-center gap-2 lg:flex">
        <Link
          href="/log-masuk"
          className="inline-flex h-10 items-center rounded-full border border-ink/20 px-5 text-sm font-medium text-ink transition-colors hover:border-gold hover:text-gold-deep"
        >
          Log Masuk
        </Link>
        <Link
          href="/daftar"
          className="inline-flex h-10 items-center rounded-full bg-gold px-5 text-sm font-medium text-card transition-colors hover:bg-gold-deep"
        >
          Daftar
        </Link>
      </div>
    );
  }

  const name = user.name?.trim() ? user.name : user.email;

  return (
    <div className="hidden items-center gap-1 lg:flex">
      <Link
        href="/akaun"
        className="flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-ink transition-colors hover:bg-gold-tint hover:text-gold-deep"
      >
        <User size={18} className="text-ink-soft" />
        <span className="max-w-[10rem] truncate">{name}</span>
      </Link>
      {user.role === "ADMIN" && (
        <Link
          href="/admin"
          className="flex h-10 items-center rounded-full border border-gold/40 px-4 text-sm font-medium text-gold-deep transition-colors hover:bg-gold-tint"
        >
          Admin
        </Link>
      )}
      <button
        type="button"
        onClick={() => void handleSignOut()}
        aria-label="Log keluar"
        title="Log keluar"
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full text-ink-soft",
          "transition-colors hover:bg-gold-tint hover:text-danger",
        )}
      >
        <SignOut size={18} />
      </button>
    </div>
  );
}
