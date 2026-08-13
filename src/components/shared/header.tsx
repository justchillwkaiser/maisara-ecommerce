import Link from "next/link";
import { CaretDown, Heart, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { getCategories } from "@/lib/categories";
import { cn } from "@/lib/utils";

import { CartButton } from "./cart-button";
import { HeaderClient } from "./header-client";
import { AuthNav } from "./auth-nav";

/**
 * Header Maisara (DESIGN.md 7.1): satu baris, sticky, border-b line.
 * Desktop: logo kiri, nav tengah (Koleksi + dropdown kategori, Kisah Kami),
 * kanan (Carian, Simpan, Cart, AuthNav). Mobile: hamburger -> HeaderClient.
 * Session diambil di server (bukan useSession dalam client) supaya
 * hydration konsisten; selepas login/logout, router.refresh() memuatkan semula.
 */
export async function Header() {
  const [categories, session] = await Promise.all([
    getCategories(),
    auth.api.getSession({ headers: await headers() }).catch(() => null),
  ]);
  const user = (session?.user ?? null) as
    | { id: string; name?: string | null; email: string; role?: string }
    | null;

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-[72px] w-full max-w-[1400px] items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="font-serif text-2xl font-semibold tracking-[0.02em] text-ink transition-colors hover:text-gold-deep"
        >
          Maisara
        </Link>

        {/* Nav tengah (desktop sahaja) */}
        <nav aria-label="Navigasi utama" className="hidden items-center gap-8 lg:flex">
          {/* Koleksi + dropdown kategori */}
          <div className="group relative">
            <button
              type="button"
              className="flex items-center gap-1 rounded-full py-2 text-sm text-ink-soft transition-colors hover:text-gold-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              Koleksi
              <CaretDown size={14} weight="bold" className="transition-transform duration-200 group-hover:rotate-180" />
            </button>
            <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="w-56 rounded-2xl border border-line bg-card p-2 shadow-[0_2px_4px_rgba(42,38,34,0.06),0_16px_48px_rgba(42,38,34,0.10)]">
                <Link
                  href="/koleksi"
                  className="block rounded-xl px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-gold-tint hover:text-gold-deep"
                >
                  Semua Koleksi
                </Link>
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/koleksi/${category.slug}`}
                    className="block rounded-xl px-4 py-2 text-sm text-ink-soft transition-colors hover:bg-gold-tint hover:text-gold-deep"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link
            href="/kisah-kami"
            className="text-sm text-ink-soft transition-colors hover:text-gold-deep"
          >
            Kisah Kami
          </Link>
        </nav>

        {/* Kanan */}
        <div className="flex items-center gap-1 md:gap-2">
          <Link
            href="/koleksi?search="
            aria-label="Cari produk"
            className={cn(
              "hidden h-10 w-10 items-center justify-center rounded-full text-ink-soft transition-colors",
              "hover:bg-gold-tint hover:text-gold-deep lg:flex",
            )}
          >
            <MagnifyingGlass size={20} />
          </Link>
          <Link
            href="/akaun/wishlist"
            aria-label="Senarai simpanan"
            className={cn(
              "hidden h-10 w-10 items-center justify-center rounded-full text-ink-soft transition-colors",
              "hover:bg-gold-tint hover:text-gold-deep lg:flex",
            )}
          >
            <Heart size={20} />
          </Link>

          <CartButton />

          <AuthNav user={user} />

          {/* Hamburger mobile */}
          <HeaderClient categories={categories} user={user} />
        </div>
      </div>
    </header>
  );
}
