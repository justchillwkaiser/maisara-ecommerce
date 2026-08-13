"use client";

import {
  Gauge,
  Package,
  ShirtFolded,
  SignOut,
  Stack,
  Star,
  Storefront,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: Gauge },
  { href: "/admin/produk", label: "Produk", icon: ShirtFolded },
  { href: "/admin/order", label: "Order", icon: Package },
  { href: "/admin/stok", label: "Stok", icon: Stack },
  { href: "/admin/review", label: "Review", icon: Star },
] as const;

/**
 * Navigasi admin (UX.md section 4, DESIGN.md 8 - Admin Panel):
 * sidebar pada desktop, tabs scroll pada mobile. Aktif berdasarkan pathname.
 * Log keluar + pautan ke storefront di bawah sidebar.
 */
export function AdminNav({ name }: { name: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const displayName = name?.trim() ? name : "Admin";

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="lg:w-60 lg:shrink-0">
      {/* Tabs mobile (horizontal scroll) */}
      <nav
        aria-label="Navigasi admin"
        className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0"
      >
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-medium transition-colors lg:rounded-xl",
                isActive
                  ? "bg-gold-tint text-gold-deep"
                  : "text-ink-soft hover:bg-surface hover:text-ink",
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}

        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-surface hover:text-ink lg:mt-2 lg:rounded-xl"
        >
          <Storefront size={18} />
          Lihat Kedai
        </Link>

        <button
          type="button"
          onClick={() => void handleSignOut()}
          className="flex shrink-0 items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-surface hover:text-danger lg:mt-2 lg:rounded-xl"
        >
          <SignOut size={18} />
          Log Keluar
        </button>
      </nav>

      <p className="mt-4 hidden text-xs text-ink-soft lg:block">
        Log masuk sebagai <span className="font-medium text-ink">{displayName}</span>
      </p>
    </aside>
  );
}
