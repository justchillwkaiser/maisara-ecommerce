"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ShoppingBag } from "@phosphor-icons/react";
import { toast } from "sonner";

import { useCart } from "@/components/shared/cart-context";
import { ImagePlaceholder } from "@/components/ui/image-frame";
import { formatRM } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Kad produk MAISARA (spesifikasi 13).
 *
 * Satu implementasi sahaja untuk katalog, carian, wishlist, homepage dan
 * produk berkaitan. Hierarki visual: imej, badge, nama, harga, metadata,
 * pautan. Tiada butang besar pada setiap kad — hover mendedahkan imej kedua
 * dan pautan yang tenang.
 */
export interface ProductCardProduct {
  name: string;
  slug: string;
  price: string | number;
  /** Imej utama (imej pertama galeri). null -> placeholder sistem. */
  image: string | null;
  /** Imej kedua untuk hover; null jika produk hanya ada satu imej. */
  hoverImage?: string | null;
  /** Warna yang benar-benar ada pada varian produk. */
  colors?: string[];
  minStock: number;
  avgRating?: number | null;
  reviewCount?: number;
  /** Variant pertama yang ada stok (untuk quick add); null -> pautan ke PDP. */
  quickAddVariant?: {
    id: string;
    color: string | null;
    size: string | null;
    stock: number;
  } | null;
}

interface ProductCardProps {
  product: ProductCardProduct;
  /** Kedudukan kad dalam grid — menentukan saiz imej yang diminta. */
  sizes?: string;
  /**
   * Baris pertama grid berada dalam viewport awal, jadi imejnya tidak boleh
   * ditangguhkan (`loading="lazy"` menangguhkan permintaan sehingga heuristik
   * viewport berjalan, dan Chrome menandakan imej itu sebagai LCP tanpa
   * `eager`). Penemuan awal dikendalikan oleh preload komponen pelayan
   * (`CriticalImagePreload`), jadi di sini hanya keutamaan imej ditetapkan —
   * bukan `<link rel=preload>` tambahan.
   */
  eager?: boolean;
  className?: string;
}

function StockBadge({ minStock }: { minStock: number }) {
  if (minStock === 0) {
    return (
      <span className="meta-label border border-line-strong bg-paper/90 px-2 py-1 whitespace-nowrap text-cocoa backdrop-blur-[2px]">
        Habis
      </span>
    );
  }
  if (minStock <= 5) {
    return (
      <span className="meta-label border border-clay/50 bg-paper/90 px-2 py-1 whitespace-nowrap text-cocoa backdrop-blur-[2px]">
        {minStock} unit lagi
      </span>
    );
  }
  return null;
}

export function ProductCard({
  product,
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw",
  eager = false,
  className,
}: ProductCardProps) {
  const { add } = useCart();
  const [pending, setPending] = useState(false);

  const productHref = `/produk/${product.slug}`;
  const quickAdd = product.quickAddVariant ?? null;
  const canQuickAdd = Boolean(quickAdd) && product.minStock > 0;
  const hasHoverImage = Boolean(product.hoverImage && product.hoverImage !== product.image);
  const soldOut = product.minStock === 0;

  async function handleQuickAdd() {
    if (!quickAdd) return;
    setPending(true);
    try {
      // Preview membolehkan drawer memaparkan imej sebenar serta-merta;
      // server tetap menjadi sumber kebenaran selepas POST.
      await add(quickAdd.id, 1, {
        product: { name: product.name, slug: product.slug },
        variant: { color: quickAdd.color, size: quickAdd.size, stock: quickAdd.stock },
        unitPrice:
          typeof product.price === "number" ? product.price.toFixed(2) : product.price,
        image: product.image ?? "",
      });
      toast.success(`${product.name} ditambah ke beg.`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal menambah ke beg. Sila cuba lagi.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <article className={cn("group flex flex-col", className)}>
      <div className="relative overflow-hidden rounded-sm bg-bone">
        <Link href={productHref} tabIndex={-1} aria-hidden="true" className="block">
          <div className="relative aspect-4/5">
            {product.image ? (
              <>
                <Image
                  src={product.image}
                  alt=""
                  fill
                  sizes={sizes}
                  loading={eager ? "eager" : "lazy"}
                  fetchPriority={eager ? "high" : "auto"}
                  className={cn(
                    "object-cover transition-transform duration-(--dur-editorial) ease-out",
                    "motion-safe:group-hover:scale-[1.03]",
                    hasHoverImage && "motion-safe:group-hover:opacity-0",
                  )}
                />
                {hasHoverImage ? (
                  <Image
                    src={product.hoverImage as string}
                    alt=""
                    fill
                    sizes={sizes}
                    className={cn(
                      "object-cover opacity-0 transition-opacity duration-(--dur-editorial) ease-out",
                      "motion-safe:group-hover:opacity-100",
                    )}
                  />
                ) : null}
              </>
            ) : (
              <ImagePlaceholder />
            )}
          </div>
        </Link>

        {soldOut || product.minStock <= 5 ? (
          <div className="pointer-events-none absolute top-3 left-3">
            <StockBadge minStock={product.minStock} />
          </div>
        ) : null}

        {/* Tindakan tenang pada hover; sentiasa tersedia untuk papan kekunci. */}
        {canQuickAdd ? (
          <button
            type="button"
            onClick={() => void handleQuickAdd()}
            disabled={pending}
            className={cn(
              "absolute right-3 bottom-3 inline-flex h-9 items-center gap-1.5 rounded-xs",
              "border border-line-strong bg-paper/95 px-3 font-mono text-[0.625rem] tracking-[0.12em] uppercase text-ink",
              "transition-all duration-(--dur-base) ease-out",
              "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
              "hover:border-ink hover:bg-ink hover:text-paper",
              "disabled:cursor-wait disabled:opacity-60",
            )}
          >
            <ShoppingBag size={13} aria-hidden="true" />
            {pending ? "Menambah" : "Tambah"}
          </button>
        ) : null}
      </div>

      {/* Maklumat produk */}
      <div className="flex flex-1 flex-col gap-1.5 pt-4">
        <h3 className="font-display text-lg leading-tight text-ink">
          <Link
            href={productHref}
            className="transition-colors duration-(--dur-fast) hover:text-cocoa"
          >
            {product.name}
          </Link>
        </h3>

        <p className="font-mono text-body-sm tabular-nums text-ink">
          {formatRM(product.price)}
        </p>

        {/* Metadata: warna sebenar produk + jumlah ulasan. */}
        {product.colors && product.colors.length > 0 ? (
          <p className="meta-label text-cocoa">
            {product.colors.slice(0, 3).join(" · ")}
            {product.colors.length > 3 ? ` +${product.colors.length - 3}` : ""}
          </p>
        ) : null}

        {product.avgRating != null && (product.reviewCount ?? 0) > 0 ? (
          <p className="meta-label text-cocoa">
            {product.avgRating.toFixed(1)} / 5 · {product.reviewCount} ulasan
          </p>
        ) : null}
      </div>
    </article>
  );
}
