"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "@phosphor-icons/react";
import { toast } from "sonner";

import { useCart, type CartItemPreview } from "@/components/shared/cart-context";
import { cn } from "@/lib/utils";

interface AddToCartProps {
  /** Variant terpilih; null = warna/saiz belum lengkap. */
  variantId: string | null;
  /** Stok variant terpilih. */
  stock: number | null;
  quantity?: number;
  disabled?: boolean;
  /** Data produk untuk optimistic add (dari page server). */
  product?: { name: string; slug: string; price: string; image: string };
  /** Variant terpilih penuh (warna/saiz) untuk paparan segera dalam drawer. */
  variant?: { color: string | null; size: string | null; stock: number } | null;
}

/**
 * CTA "Tambah ke Cart" (DESIGN.md 7.2 primary, pill penuh lebar).
 * Optimistic UI: jika `product` + `variant` disediakan, UI (badge + drawer)
 * update serta-merta, kemudian POST /api/cart untuk pengesahan server.
 * Gagal -> rollback + toast mesej ApiError dari server.
 */
export function AddToCart({
  variantId,
  stock,
  quantity = 1,
  disabled = false,
  product,
  variant,
}: AddToCartProps) {
  const { add } = useCart();
  const [pending, setPending] = useState(false);
  const [added, setAdded] = useState(false);

  const noVariant = variantId == null;
  const outOfStock = !noVariant && stock != null && stock <= 0;
  const isDisabled = disabled || noVariant || outOfStock || pending;

  async function handleAdd() {
    if (variantId == null || pending) return;
    setPending(true);
    setAdded(false);

    let preview: CartItemPreview | undefined;
    if (product && variant) {
      preview = {
        product: { name: product.name, slug: product.slug },
        variant: { color: variant.color, size: variant.size, stock: variant.stock },
        unitPrice: product.price,
        image: product.image,
      };
    }

    try {
      await add(variantId, quantity, preview);
      setAdded(true);
      toast.success("Ditambah ke cart");
      window.setTimeout(() => setAdded(false), 1600);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal menambah ke cart. Sila cuba lagi.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => void handleAdd()}
        disabled={isDisabled}
        className={cn(
          "flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gold px-6 text-sm font-medium text-card transition-all",
          "hover:bg-gold-deep active:scale-[0.98]",
          "focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-gold disabled:active:scale-100",
        )}
      >
        {added ? <Check size={18} weight="bold" /> : <ShoppingBag size={18} />}
        {added ? "Ditambah" : pending ? "Menambah..." : "Tambah ke Cart"}
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
