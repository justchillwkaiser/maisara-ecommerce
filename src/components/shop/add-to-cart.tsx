"use client";

import { ShoppingBag } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

interface AddToCartProps {
  /** Variant terpilih; null = warna/saiz belum lengkap. */
  variantId: string | null;
  /** Stok variant terpilih. */
  stock: number | null;
  quantity?: number;
  disabled?: boolean;
}

/**
 * CTA "Tambah ke Cart" (DESIGN.md 7.2 primary, pill penuh lebar).
 * Disabled bila variant belum lengkap atau stok 0.
 * TODO (Task 9): wire ke cart context / POST /api/cart. Untuk sekarang
 * handler hanya log nota - API cart belum wujud, elak panggilan 404.
 */
export function AddToCart({ variantId, stock, quantity = 1, disabled = false }: AddToCartProps) {
  const noVariant = variantId == null;
  const outOfStock = !noVariant && stock != null && stock <= 0;
  const isDisabled = disabled || noVariant || outOfStock;

  function handleAdd() {
    // TODO (Task 9): ganti dengan POST /api/cart { variantId, quantity } dan
    // update cart context. Jangan panggil API yang belum wujud sekarang.
    console.info("[add-to-cart] TODO Task 9 - wire ke /api/cart", { variantId, quantity });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleAdd}
        disabled={isDisabled}
        className={cn(
          "flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gold px-6 text-sm font-medium text-card transition-all",
          "hover:bg-gold-deep active:scale-[0.98]",
          "focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-gold disabled:active:scale-100",
        )}
      >
        <ShoppingBag size={18} />
        Tambah ke Cart
      </button>
      {noVariant && (
        <p className="mt-2 text-center text-xs text-ink-soft">Pilih warna dan saiz dahulu</p>
      )}
      {outOfStock && (
        <p className="mt-2 text-center text-xs text-ink-soft">Habis Stok</p>
      )}
    </div>
  );
}
