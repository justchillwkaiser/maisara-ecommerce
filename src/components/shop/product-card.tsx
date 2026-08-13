import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Star, StarHalf } from "@phosphor-icons/react/dist/ssr";

import { formatRM } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Kad produk Maisara (DESIGN.md 7.3) - REUSABLE (katalog, wishlist, homepage).
 * Imej portrait 4:5, nama serif, harga tabular-nums, badge stok di bawah nama
 * (bukan atas imej). Hover: zoom imej CSS scale-105 700ms + quick button reveal.
 */
export interface ProductCardProduct {
  name: string;
  slug: string;
  price: string | number;
  image: string;
  minStock: number;
  avgRating?: number | null;
  reviewCount?: number;
}

interface ProductCardProps {
  product: ProductCardProduct;
  className?: string;
}

/** Badge stok (DESIGN.md 7.6): tiada badge jika stok > 5. */
function StockBadge({ minStock }: { minStock: number }) {
  if (minStock === 0) {
    return (
      <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium text-ink-soft">
        Habis
      </span>
    );
  }
  if (minStock <= 5) {
    return (
      <span className="rounded-full bg-gold-tint px-2 py-0.5 text-[11px] font-medium text-gold-deep">
        Stok rendah
      </span>
    );
  }
  return null;
}

/** Bintang rating kecil (Phosphor Star/StarHalf) + jumlah ulasan, ink-soft. */
function Rating({ avgRating, reviewCount }: { avgRating: number; reviewCount: number }) {
  const rounded = Math.round(avgRating * 2) / 2;
  const fullStars = Math.floor(rounded);
  const hasHalf = rounded % 1 !== 0;

  return (
    <span
      className="flex items-center gap-1.5 text-xs text-ink-soft"
      aria-label={`Bintang ${avgRating.toFixed(1)} daripada 5, ${reviewCount} ulasan`}
    >
      <span className="flex items-center gap-0.5 text-gold" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => {
          if (i < fullStars) {
            return <Star key={i} size={12} weight="fill" />;
          }
          if (i === fullStars && hasHalf) {
            return <StarHalf key={i} size={12} weight="fill" />;
          }
          return <Star key={i} size={12} className="opacity-30" />;
        })}
      </span>
      <span className="tabular-nums">{reviewCount} ulasan</span>
    </span>
  );
}

export function ProductCard({ product, className }: ProductCardProps) {
  return (
    <div className={cn("group", className)}>
      <Link href={`/produk/${product.slug}`} className="block">
        {/* Imej 4:5 + quick add (reveal pada hover desktop sahaja) */}
        <div className="relative overflow-hidden rounded-xl bg-surface transition-shadow duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:shadow-[0_2px_4px_rgba(42,38,34,0.06),0_16px_48px_rgba(42,38,34,0.10)]">
          <div className="relative aspect-[4/5]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
            />
          </div>
          {/* TODO (Task 9): wire ke cart context. Sekarang placeholder -
              klik akan navigate ke PDP melalui link kad. Sembunyi mobile (touch). */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-3 left-1/2 hidden -translate-x-1/2 translate-y-2 items-center gap-1.5 rounded-full bg-card/95 px-4 py-2 text-xs font-medium whitespace-nowrap text-ink opacity-0 shadow-[0_8px_24px_rgba(42,38,34,0.12)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100 sm:flex"
          >
            <ShoppingBag size={14} />
            Tambah ke Cart
          </span>
        </div>

        {/* Info bawah: nama serif, harga, badge stok, rating */}
        <div className="pt-3">
          <h3 className="font-serif text-lg leading-snug font-semibold text-ink">
            {product.name}
          </h3>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="text-[15px] font-medium tabular-nums text-ink">
              {formatRM(product.price)}
            </span>
            <StockBadge minStock={product.minStock} />
          </div>
          {product.avgRating != null &&
            product.reviewCount != null &&
            product.reviewCount > 0 && (
              <div className="mt-1.5">
                <Rating avgRating={product.avgRating} reviewCount={product.reviewCount} />
              </div>
            )}
        </div>
      </Link>
    </div>
  );
}
