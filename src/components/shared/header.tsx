import Link from "next/link";
import { CaretDown, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { getCategories } from "@/lib/categories";
import { PRIMARY_NAV, SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

import { AuthNav } from "./auth-nav";
import { CartButton } from "./cart-button";
import { HeaderClient, HeaderShell } from "./header-client";

/** Pautan nav: ink pada permukaan paper yang hangat. */
const NAV_LINK = cn(
  "text-body-sm text-cocoa transition-colors duration-(--dur-fast) hover:text-ink",
);

/** Butang ikon header — sasaran 44px, sudut hampir segi empat (spesifikasi 09). */
const ICON_LINK = cn(
  "flex size-11 items-center justify-center rounded-xs text-cocoa",
  "transition-colors duration-(--dur-fast) hover:bg-bone hover:text-ink",
);

/**
 * Header Maisara (spesifikasi 11). Satu baris: wordmark kiri, nav utama
 * tengah, utiliti kanan (Carian, Akaun, Beg). "Koleksi" membuka dropdown
 * kategori; kategori datang dari getCategories() di server.
 *
 * Session diambil di server (bukan useSession dalam client) supaya hydration
 * konsisten; selepas login/logout, router.refresh() memuatkan semula props.
 */
export async function Header() {
  const [categories, session] = await Promise.all([
    getCategories(),
    auth.api.getSession({ headers: await headers() }).catch(() => null),
  ]);
  const user = (session?.user ?? null) as
    | { id: string; name?: string | null; email: string; role?: string }
    | null;

  // "Koleksi" ialah satu-satunya item nav dengan dropdown, jadi ia dipisahkan
  // daripada senarai pautan biasa.
  const navItems = PRIMARY_NAV.filter((item) => item.href !== "/koleksi");

  return (
    <HeaderShell>
      <div className="shell grid h-16 grid-cols-[1fr_auto_1fr] items-center md:h-18">
        {/* Wordmark */}
        <Link
          href="/"
          className={cn(
            "justify-self-start font-display text-2xl leading-none tracking-[0.16em] text-ink",
            "transition-colors duration-(--dur-fast) group-data-[state=top]:text-paper",
          )}
        >
          {SITE.name}
        </Link>

        {/* Nav tengah (desktop sahaja) */}
        <nav aria-label="Navigasi utama" className="hidden items-center gap-8 lg:flex">
          {/* Koleksi + dropdown kategori */}
          <div className="group/dropdown relative">
            <button
              type="button"
              className={cn(NAV_LINK, "flex items-center gap-1.5 py-3")}
            >
              Koleksi
              <CaretDown
                size={13}
                weight="bold"
                aria-hidden="true"
                className="transition-transform duration-(--dur-fast) ease-out group-hover/dropdown:rotate-180"
              />
            </button>
            <div
              className={cn(
                "invisible absolute top-full left-1/2 z-50 w-56 -translate-x-1/2 pt-2 opacity-0",
                "transition-[opacity,visibility] duration-(--dur-fast) ease-out",
                "group-hover/dropdown:visible group-hover/dropdown:opacity-100",
                "group-focus-within/dropdown:visible group-focus-within/dropdown:opacity-100",
              )}
            >
              <div className="rounded-sm border border-line bg-paper-lift p-1.5">
                <Link
                  href="/koleksi"
                  className="block rounded-xs px-3 py-3 text-body-sm text-ink transition-colors duration-(--dur-fast) hover:bg-bone"
                >
                  Semua Koleksi
                </Link>
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/koleksi/${category.slug}`}
                    className="block rounded-xs px-3 py-3 text-body-sm text-cocoa transition-colors duration-(--dur-fast) hover:bg-bone hover:text-ink"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={cn(NAV_LINK, "py-3")}>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Utiliti */}
        <div className="flex items-center justify-self-end gap-1 md:gap-2">
          <Link
            href="/koleksi?search="
            aria-label="Cari produk"
            className={cn(ICON_LINK, "hidden lg:flex")}
          >
            <MagnifyingGlass size={19} aria-hidden="true" />
          </Link>

          <CartButton />

          <AuthNav user={user} />

          <HeaderClient categories={categories} user={user} />
        </div>
      </div>
    </HeaderShell>
  );
}
