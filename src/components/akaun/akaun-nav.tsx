"use client";

import { Heart, Package, SignOut, UserCircle } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/akaun", label: "Profil", icon: UserCircle },
  { href: "/akaun/order", label: "Order", icon: Package },
  { href: "/akaun/wishlist", label: "Wishlist", icon: Heart },
] as const;

/**
 * Navigasi akaun (UX.md section 4, DESIGN.md 8 - Akaun).
 *
 * Rel tab editorial, bukan pill: satu garis halus jadi paksi, item aktif
 * ditanda garis 2px + berat teks + `aria-current="page"` — jadi keadaan aktif
 * tidak bergantung pada warna sahaja. Mobile: rel mendatar boleh skrol;
 * desktop: rel menegak.
 * Log keluar di bawah (Better Auth signOut -> refresh ke /).
 */
export function AkaunNav({ name }: { name: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const displayName = name?.trim() ? name : "Pelanggan";

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const result = await authClient.signOut();
      if (result.error) {
        console.error("[auth] log keluar gagal:", result.error);
        toast.error("Log keluar tidak berjaya. Sila cuba lagi.");
        return;
      }
      router.push("/");
      router.refresh();
    } catch (caught) {
      console.error("[auth] log keluar gagal:", caught);
      toast.error("Log keluar tidak berjaya. Sila cuba lagi.");
    } finally {
      setSigningOut(false);
    }
  }

  const itemClass =
    "-mb-px flex shrink-0 items-center gap-2.5 border-b-2 border-transparent px-4 py-3 text-body-sm whitespace-nowrap transition-colors duration-(--dur-fast) lg:-ml-px lg:mb-0 lg:border-b-0 lg:border-l-2";

  return (
    <aside className="lg:w-56 lg:shrink-0">
      {/* Mobile: rel mendatar boleh skrol. Desktop: rel menegak. */}
      <nav
        aria-label="Navigasi akaun"
        className="flex overflow-x-auto border-b border-line lg:flex-col lg:border-b-0 lg:border-l lg:border-line"
      >
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/akaun"
              ? pathname === "/akaun"
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

        <button
          type="button"
          onClick={() => void handleSignOut()}
          disabled={signingOut}
          aria-busy={signingOut}
          className={cn(
            itemClass,
            "text-cocoa hover:border-line-strong hover:text-ink lg:mt-6",
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
