"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "@phosphor-icons/react";
import { toast } from "sonner";

import { useCart, type CartItemPreview } from "@/components/shared/cart-context";
import { Button } from "@/components/ui/button";

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
  /** Mesej bila variant belum lengkap; PDP menghantar ayat ikut data sebenar. */
  hint?: string;
}

/**
 * CTA "Tambah ke Cart" (spesifikasi 15: add to bag sebagai tindakan utama).
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
  hint,
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
      <Button
        type="button"
        size="lg"
        onClick={() => void handleAdd()}
        disabled={isDisabled}
        className="w-full"
      >
        {added ? <Check weight="bold" aria-hidden="true" /> : <ShoppingBag aria-hidden="true" />}
        {added ? "Ditambah" : pending ? "Menambah..." : "Tambah ke Cart"}
      </Button>
      {noVariant && hint ? (
        <p className="mt-3 text-body-sm text-cocoa">{hint}</p>
      ) : null}
      {outOfStock ? (
        <p className="mt-3 text-body-sm text-cocoa">Habis stok untuk pilihan ini.</p>
      ) : null}
    </div>
  );
}
