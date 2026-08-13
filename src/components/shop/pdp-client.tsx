"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import type { ProductVariantDetail } from "@/server/services/product.service";

import { AddToCart } from "./add-to-cart";
import { QuantityStepper } from "./quantity-stepper";
import { VariantPicker } from "./variant-picker";

interface PdpClientProps {
  variants: ProductVariantDetail[];
}

/** Status stok (DESIGN.md 7.6): teks ink-soft, gold tint pill, surface pill. */
function StockStatus({ stock }: { stock: number | null }) {
  if (stock == null) return null;
  if (stock === 0) {
    return (
      <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-ink-soft">
        Habis
      </span>
    );
  }
  if (stock <= 5) {
    return (
      <span className="rounded-full bg-gold-tint px-3 py-1 text-xs font-medium text-gold-deep">
        Stok rendah
      </span>
    );
  }
  return <span className="text-sm text-ink-soft">Tersedia</span>;
}

/**
 * Client wrapper PDP (DESIGN.md 8): pegang state variantId + quantity dan
 * render VariantPicker + QuantityStepper + AddToCart + status stok.
 * Parent (server page) hantar variants; semua interaksi di sini.
 */
export function PdpClient({ variants }: PdpClientProps) {
  const [variantId, setVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const selected = useMemo(
    () => variants.find((variant) => variant.id === variantId) ?? null,
    [variants, variantId],
  );

  function handleVariantChange(nextId: string | null) {
    setVariantId(nextId);
    setQuantity(1);
  }

  const stock = selected?.stock ?? null;

  return (
    <div className="space-y-6">
      <VariantPicker variants={variants} value={variantId} onChange={handleVariantChange} />

      <div className="flex flex-wrap items-center gap-4">
        <QuantityStepper
          value={quantity}
          onChange={setQuantity}
          max={stock ?? 99}
          disabled={!selected || stock === 0}
        />
        <StockStatus stock={stock} />
      </div>

      <AddToCart variantId={variantId} stock={stock} quantity={quantity} />
    </div>
  );
}
