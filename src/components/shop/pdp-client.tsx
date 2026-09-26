"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import type { ProductVariantDetail } from "@/server/services/product.service";

import { AddToCart } from "./add-to-cart";
import { QuantityStepper } from "./quantity-stepper";
import { VariantPicker } from "./variant-picker";

interface PdpClientProps {
  variants: ProductVariantDetail[];
  /** Data produk untuk optimistic add (nama, harga, imej dari page server). */
  product: { name: string; slug: string; price: string; image: string };
}

/**
 * Status stok (spesifikasi 15): mono dan bersudut, bukan pill. Diumumkan
 * melalui aria-live supaya perubahan stok didengar bila variant bertukar.
 */
function StockStatus({ stock }: { stock: number | null }) {
  if (stock == null) return null;

  const label = stock === 0 ? "Habis" : stock <= 5 ? "Stok rendah" : "Tersedia";

  return (
    <p
      aria-live="polite"
      className={cn(
        "meta-label text-cocoa",
        stock === 0 && "border border-line bg-bone px-3 py-2",
      )}
    >
      {label}
    </p>
  );
}

/**
 * Client wrapper PDP (spesifikasi 15): pegang state variantId + quantity dan
 * render VariantPicker + QuantityStepper + AddToCart + status stok.
 * Parent (server page) hantar variants; semua interaksi di sini.
 */
export function PdpClient({ variants, product }: PdpClientProps) {
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

  // Ayat arahan ikut kawalan yang benar-benar wujud pada produk ini.
  const requiredGroups = [
    ...(variants.some((variant) => variant.color != null) ? ["warna"] : []),
    ...(variants.some((variant) => variant.size != null) ? ["saiz"] : []),
  ];
  const hint =
    requiredGroups.length > 0 ? `Pilih ${requiredGroups.join(" dan ")} dahulu.` : "";

  return (
    <div className="space-y-7">
      <VariantPicker variants={variants} value={variantId} onChange={handleVariantChange} />

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-line pt-6">
        <div className="flex items-center gap-4">
          <span className="meta-label text-cocoa">Kuantiti</span>
          <QuantityStepper
            value={quantity}
            onChange={setQuantity}
            max={stock ?? 99}
            disabled={!selected || stock === 0}
            label={product.name}
          />
        </div>
        <StockStatus stock={stock} />
      </div>

      <AddToCart
        variantId={variantId}
        stock={stock}
        quantity={quantity}
        product={product}
        variant={selected}
        hint={hint}
      />
    </div>
  );
}
