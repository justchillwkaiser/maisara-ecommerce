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
 * Navigasi admin (UX.md section 4, DESIGN.md 8 - Admin Panel).
 *
 * Rel tab yang sama dengan akaun (bukan pill): garis halus jadi paksi, item
 * aktif ditanda garis 2px + berat teks + `aria-current="page"`. Mobile:
 * mendatar boleh skrol; desktop: menegak.
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

  const itemClass =
    "-mb-px flex shrink-0 items-center gap-2.5 border-b-2 border-transparent px-4 py-2.5 text-body-sm whitespace-nowrap transition-colors duration-(--dur-fast) lg:-ml-px lg:mb-0 lg:border-b-0 lg:border-l-2";

  return (
    <aside className="lg:w-56 lg:shrink-0">
      <nav
        aria-label="Navigasi admin"
        className="flex overflow-x-auto border-b border-line lg:flex-col lg:border-b-0 lg:border-l lg:border-line"
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
                itemClass,
                isActive
                  ? "border-ink font-medium text-ink"
                  : "text-cocoa hover:border-line-strong hover:text-ink",
              )}
            >
              <item.icon size={16} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}

        <Link
          href="/"
          className={cn(
            itemClass,
            "text-cocoa hover:border-line-strong hover:text-ink lg:mt-6",
          )}
        >
          <Storefront size={16} aria-hidden="true" />
          Lihat Kedai
        </Link>

        <button
          type="button"
          onClick={() => void handleSignOut()}
          className={cn(
            itemClass,
            "text-cocoa hover:border-line-strong hover:text-ink lg:mt-2",
          )}
        >
          <SignOut size={16} aria-hidden="true" />
          Log Keluar
        </button>
      </nav>

      <p className="mt-5 hidden font-mono text-meta text-cocoa lg:block">
        Log masuk sebagai <span className="text-ink">{displayName}</span>
      </p>
    </aside>
  );
}
