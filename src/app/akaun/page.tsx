import type { Metadata } from "next";
import { Heart, Package } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { db } from "@/lib/db";
import { requireUser } from "@/server/guards";
import { ProfilForm } from "@/components/akaun/profil-form";

export const metadata: Metadata = {
  title: "Akaun Saya",
  robots: { index: false, follow: false },
};

/**
 * Profil akaun (UX.md section 4, DESIGN.md 8 - Akaun).
 * Info user + ringkasan (jumlah order, wishlist count) + borang edit
 * profil (nama, kata laluan) - P3.
 */
export default async function AkaunProfilePage() {
  const user = await requireUser();

  // Ringkasan: gagal senyap ke 0 jika DB tidak dapat dicapai (corak fallback).
  let orderCount = 0;
  let wishlistCount = 0;
  try {
    [orderCount, wishlistCount] = await Promise.all([
      db.order.count({ where: { userId: user.id } }),
      db.wishlistItem.count({ where: { userId: user.id } }),
    ]);
  } catch {
    /* fallback: paparan 0 */
  }

  const isAdmin = user.role === "ADMIN";
  const displayName = user.name?.trim() ? user.name : "Pelanggan";

  return (
    <div className="space-y-8">
      {/* Info peribadi */}
      <section className="rounded-2xl border border-line p-6 md:p-8">
        <h2 className="font-serif text-2xl font-medium text-ink">Profil</h2>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          <dl className="grid content-start gap-5 sm:grid-cols-2 lg:grid-cols-1">
            <div>
              <dt className="text-xs tracking-wide text-ink-soft uppercase">Nama</dt>
              <dd className="mt-1 text-ink">{displayName}</dd>
            </div>
            <div>
              <dt className="text-xs tracking-wide text-ink-soft uppercase">Email</dt>
              <dd className="mt-1 text-ink">{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs tracking-wide text-ink-soft uppercase">Peranan</dt>
              <dd>
                <span
                  className={
                    isAdmin
                      ? "mt-1 inline-flex rounded-full bg-gold px-3 py-1 text-xs font-medium text-card"
                      : "mt-1 inline-flex rounded-full bg-surface px-3 py-1 text-xs font-medium text-ink"
                  }
                >
                  {isAdmin ? "Admin" : "Pelanggan"}
                </span>
              </dd>
            </div>
          </dl>
          <ProfilForm name={displayName} email={user.email} />
        </div>
      </section>

      {/* Ringkasan */}
      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/akaun/order"
          className="group rounded-2xl border border-line p-6 transition-colors hover:border-gold"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-gold-tint text-gold-deep">
            <Package size={20} />
          </span>
          <span className="mt-4 block font-serif text-3xl font-medium tabular-nums text-ink">
            {orderCount}
          </span>
          <span className="mt-1 block text-sm text-ink-soft">Jumlah pesanan</span>
        </Link>
        <Link
          href="/akaun/wishlist"
          className="group rounded-2xl border border-line p-6 transition-colors hover:border-gold"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-gold-tint text-gold-deep">
            <Heart size={20} />
          </span>
          <span className="mt-4 block font-serif text-3xl font-medium tabular-nums text-ink">
            {wishlistCount}
          </span>
          <span className="mt-1 block text-sm text-ink-soft">Produk disimpan</span>
        </Link>
      </section>
    </div>
  );
}
