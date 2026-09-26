import type { Metadata } from "next";
import { Heart, Package } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { db } from "@/lib/db";
import { requireUser } from "@/server/guards";
import { ProfilForm } from "@/components/akaun/profil-form";
import { Badge } from "@/components/ui/badge";

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
  // Ralat di-log supaya kegagalan DB tidak hilang tanpa jejak.
  let orderCount = 0;
  let wishlistCount = 0;
  try {
    [orderCount, wishlistCount] = await Promise.all([
      db.order.count({ where: { userId: user.id } }),
      db.wishlistItem.count({ where: { userId: user.id } }),
    ]);
  } catch (caught) {
    console.error("[akaun] ringkasan pesanan/wishlist gagal:", caught);
  }

  const isAdmin = user.role === "ADMIN";
  const displayName = user.name?.trim() ? user.name : "Pelanggan";

  return (
    <div className="space-y-14">
      {/* Info peribadi */}
      <section aria-labelledby="akaun-profil">
        <h2 id="akaun-profil" className="font-display text-h3 text-ink">
          Profil
        </h2>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <dl className="grid content-start gap-6 sm:grid-cols-2 lg:grid-cols-1">
            <div>
              <dt className="meta-label text-cocoa">Nama</dt>
              <dd className="mt-2 text-body-sm text-ink">{displayName}</dd>
            </div>
            <div>
              <dt className="meta-label text-cocoa">Email</dt>
              <dd className="mt-2 text-body-sm text-ink">{user.email}</dd>
            </div>
            <div>
              <dt className="meta-label text-cocoa">Peranan</dt>
              <dd className="mt-2">
                <Badge variant={isAdmin ? "default" : "outline"}>
                  {isAdmin ? "Admin" : "Pelanggan"}
                </Badge>
              </dd>
            </div>
          </dl>
          <ProfilForm name={displayName} email={user.email} />
        </div>
      </section>

      {/* Ringkasan */}
      <section aria-label="Ringkasan akaun" className="grid gap-6 sm:grid-cols-2">
        <Link
          href="/akaun/order"
          className="flex items-center justify-between gap-6 border border-line bg-paper-lift px-6 py-7 transition-colors duration-(--dur-fast) hover:border-ink"
        >
          <span className="flex flex-col gap-3">
            <span className="meta-label text-cocoa">Jumlah pesanan</span>
            <span className="font-display text-h3 tabular-nums text-ink">
              {orderCount}
            </span>
          </span>
          <Package size={20} aria-hidden="true" className="shrink-0 text-cocoa" />
        </Link>
        <Link
          href="/akaun/wishlist"
          className="flex items-center justify-between gap-6 border border-line bg-paper-lift px-6 py-7 transition-colors duration-(--dur-fast) hover:border-ink"
        >
          <span className="flex flex-col gap-3">
            <span className="meta-label text-cocoa">Produk disimpan</span>
            <span className="font-display text-h3 tabular-nums text-ink">
              {wishlistCount}
            </span>
          </span>
          <Heart size={20} aria-hidden="true" className="shrink-0 text-cocoa" />
        </Link>
      </section>
    </div>
  );
}
