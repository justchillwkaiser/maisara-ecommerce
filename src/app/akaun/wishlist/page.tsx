import { Heart } from "@phosphor-icons/react/dist/ssr";

import { ProductCard } from "@/components/shop/product-card";
import { WishlistRemoveButton } from "@/components/shop/wishlist-remove-button";
import { EmptyState } from "@/components/ui/empty-state";
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
      <EmptyState
        eyebrow="Wishlist"
        title="Wishlist kosong"
        description="Simpan produk yang anda minati untuk memudahkan pembelian kemudian."
        action={{ label: "Terokai Koleksi", href: "/koleksi" }}
      />
    );
  }

  return (
    <div>
      <p className="meta-label mb-6 flex items-center gap-2 text-cocoa">
        <Heart size={14} aria-hidden="true" />
        {items.length} produk disimpan
      </p>
      <div className="grid grid-cols-2 gap-6 xl:grid-cols-3">
        {items.map((item) => (
          <div key={item.id}>
            <ProductCard
              product={item.product}
              sizes="(min-width: 1280px) 33vw, 50vw"
            />
            <div className="mt-3">
              <WishlistRemoveButton productId={item.product.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
