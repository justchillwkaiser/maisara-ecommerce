import { Heart } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { ProductCard } from "@/components/shop/product-card";
import { WishlistRemoveButton } from "@/components/shop/wishlist-remove-button";
import { requireUser } from "@/server/guards";
import { getWishlist } from "@/server/services/wishlist.service";

/**
 * Halaman wishlist akaun (UX.md section 4, DESIGN.md 8 - Akaun).
 * Grid ProductCard (shape dari getWishlist) + butang buang setiap item.
 * Empty state: mesej + CTA ke koleksi.
 */
export default async function AkaunWishlistPage() {
  const user = await requireUser();
  const items = await getWishlist(user.id);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-line px-6 py-16 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-gold-tint text-gold-deep">
          <Heart size={26} />
        </span>
        <h2 className="mt-5 font-serif text-2xl text-ink">Wishlist kosong</h2>
        <p className="mt-2 max-w-sm text-sm text-ink-soft">
          Simpan produk yang anda minati untuk memudahkan pembelian kemudian.
        </p>
        <Link
          href="/koleksi"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-gold px-7 text-sm font-medium text-card transition-colors hover:bg-gold-deep"
        >
          Terokai Koleksi
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-6 xl:grid-cols-3">
      {items.map((item) => (
        <div key={item.id}>
          <ProductCard product={item.product} />
          <div className="mt-3">
            <WishlistRemoveButton productId={item.product.id} />
          </div>
        </div>
      ))}
    </div>
  );
}
