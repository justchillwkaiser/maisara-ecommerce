"use client";

import Link from "next/link";
import { Trash } from "@phosphor-icons/react";

import { QuantityStepper } from "@/components/shop/quantity-stepper";
import type { CartItemView } from "@/components/shared/cart-context";
import { Button } from "@/components/ui/button";
import { FramedImage } from "@/components/ui/image-frame";
import { formatRM } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface CartLineItemProps {
  item: CartItemView;
  /** Item sedang disegerakkan ke server — kawalan dilumpuhkan, baris dimalapkan. */
  pending?: boolean;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  /** Dipanggil sebelum navigasi ke PDP; drawer menggunakannya untuk menutup. */
  onNavigate?: () => void;
  /** "page" untuk halaman beg, "drawer" untuk baris padat dalam drawer. */
  density?: "page" | "drawer";
  className?: string;
}

/**
 * Satu baris item beg (spesifikasi 17).
 *
 * Halaman /cart dan drawer dahulunya menyelenggara baris masing-masing dan
 * mudah menyimpang; kini hanya `density` yang berbeza. Komponen ini hanya
 * membentangkan data cart dan menyerahkan tindakan kepada pemanggil — logik
 * cart kekal di cart-context.
 */
export function CartLineItem({
  item,
  pending = false,
  onQuantityChange,
  onRemove,
  onNavigate,
  density = "page",
  className,
}: CartLineItemProps) {
  const page = density === "page";
  const variant = [item.variant.color, item.variant.size]
    .filter(Boolean)
    .join(" / ");
  const href = `/produk/${item.product.slug}`;
  const removeLabel = `Buang ${item.product.name} dari beg`;

  return (
    <div
      aria-busy={pending || undefined}
      className={cn(
        "flex",
        page ? "gap-5" : "gap-3",
        pending && "opacity-70",
        className,
      )}
    >
      {/* Thumbnail 4:5 — placeholder sistem bila produk tiada imej. */}
      <Link
        href={href}
        onClick={onNavigate}
        tabIndex={-1}
        aria-hidden="true"
        className="shrink-0"
      >
        <FramedImage
          src={item.image}
          alt=""
          sizes={page ? "80px" : "56px"}
          rounded="xs"
          frameClassName={page ? "w-20" : "w-14"}
        />
      </Link>

      <div
        className={cn("flex min-w-0 flex-1 flex-col", page ? "gap-4" : "gap-3")}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={href}
              onClick={onNavigate}
              className={cn(
                "block font-display text-ink transition-colors duration-(--dur-fast) hover:text-cocoa",
                page ? "text-lg leading-tight" : "text-body leading-snug",
              )}
            >
              {item.product.name}
            </Link>
            {variant ? (
              <p className="meta-label mt-1.5 text-cocoa">{variant}</p>
            ) : null}
          </div>

          {page ? (
            <Button
              type="button"
              variant="ghost"
              onClick={onRemove}
              disabled={pending}
              aria-label={removeLabel}
              className="shrink-0 px-3 text-cocoa hover:text-ink"
            >
              <Trash size={15} aria-hidden="true" />
              Buang
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRemove}
              disabled={pending}
              aria-label={removeLabel}
              className="shrink-0 text-cocoa hover:text-ink"
            >
              <Trash size={15} aria-hidden="true" />
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <QuantityStepper
            value={item.quantity}
            max={item.variant.stock}
            disabled={pending}
            label={item.product.name}
            size={page ? "default" : "compact"}
            onChange={onQuantityChange}
          />
          <p className="flex items-baseline gap-2.5">
            {/* Ruang label disimpan supaya harga tidak berganjak semasa sync. */}
            <span
              className={cn(
                "meta-label text-cocoa",
                (!pending || !page) && "invisible",
              )}
            >
              Menyegerak
            </span>
            <span className="font-mono text-body-sm tabular-nums text-ink">
              {formatRM(item.lineTotal)}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
