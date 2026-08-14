"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import type { ProductVariantDetail } from "@/server/services/product.service";

interface VariantPickerProps {
  variants: ProductVariantDetail[];
  /** variant id terpilih (atau null jika belum lengkap). */
  value: string | null;
  onChange: (variantId: string | null) => void;
}

/** Peta nama warna -> hex untuk swatch (produk data, bukan token design). */
const COLOR_SWATCH: Record<string, string> = {
  Sage: "#9CAF88",
  Ivory: "#F3ECDC",
  Mocha: "#8B6F5B",
  Black: "#2C2622",
  Navy: "#3A4A5A",
  Cream: "#F7F0E3",
  Emerald: "#2F5D50",
  Burgundy: "#6E2B3A",
  Gold: "#C9A45C",
  "Dusty Pink": "#D8A79E",
  Taupe: "#A08C7B",
  Rose: "#C98A8A",
  "Rose Gold": "#C99E8E",
  Silver: "#B8B8BC",
  Beige: "#DDD2BD",
};

/**
 * Pemilih variant (DESIGN.md 8 - PDP): swatch warna bulat + pill saiz.
 * Swatch warna disabled bila SEMUA variant warna itu habis stok; pill saiz
 * disabled bila kombinasi (warna, saiz) tiada atau stok 0 (label "Habis").
 * onChange dipanggil dengan variant terpilih; parent simpan state.
 */
export function VariantPicker({ variants, value, onChange }: VariantPickerProps) {
  const [color, setColor] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);

  // Sync warna/saiz bila value berubah dari luar (cth. reset parent).
  // "Adjust state during render" (React docs - You Might Not Need an Effect):
  // setState semasa render dibenarkan untuk state yang derive dari prop;
  // React re-render serta-merta sebelum commit, jadi tiada cascading render.
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    const selected = variants.find((variant) => variant.id === value) ?? null;
    setColor(selected?.color ?? null);
    setSize(selected?.size ?? null);
  }

  const colors = [...new Set(variants.map((v) => v.color).filter((c): c is string => Boolean(c)))];
  const sizes = [...new Set(variants.map((v) => v.size).filter((s): s is string => Boolean(s)))];
  const hasSizes = sizes.length > 0;

  /** Jumlah stok bagi semua variant warna ini (0 -> swatch disabled). */
  function colorAvailable(c: string): boolean {
    return variants.some((v) => v.color === c && v.stock > 0);
  }

  /** Kombinasi (warna, saiz) wujud dan ada stok. */
  function sizeAvailable(s: string): boolean {
    return variants.some((v) => v.color === color && v.size === s && v.stock > 0);
  }

  /** Kombinasi wujud TETAPI stok 0 -> label "Habis". */
  function sizeOutOfStock(s: string): boolean {
    return (
      color != null &&
      variants.some((v) => v.color === color && v.size === s && v.stock === 0)
    );
  }

  /** Tanpa warna dipilih: saiz enabled jika ada mana-mana variant stok>0. */
  function sizeAvailableNoColor(s: string): boolean {
    return variants.some((v) => v.size === s && v.stock > 0);
  }

  /** Resolve variant id dari (warna, saiz). Perlu kedua-dua jika produk ada saiz. */
  function resolveVariant(nextColor: string | null, nextSize: string | null): string | null {
    if (hasSizes && (!nextColor || !nextSize)) return null;
    if (!hasSizes && !nextColor) return null;
    const match = variants.find(
      (v) => v.color === nextColor && (v.size ?? null) === (nextSize ?? null) && v.stock > 0,
    );
    return match?.id ?? null;
  }

  function selectColor(c: string) {
    // Reset saiz jika kombinasi baru tidak sah (tiada variant / habis stok).
    const nextSize =
      size != null && variants.some((v) => v.color === c && v.size === size && v.stock > 0)
        ? size
        : null;
    setColor(c);
    setSize(nextSize);
    onChange(resolveVariant(c, nextSize));
  }

  function selectSize(s: string) {
    setSize(s);
    onChange(resolveVariant(color, s));
  }

  return (
    <div className="space-y-5">
      {colors.length > 0 && (
        <div>
          <p className="text-sm font-medium text-ink">
            Warna
            {color && <span className="ml-1.5 font-normal text-ink-soft">: {color}</span>}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2.5">
            {colors.map((c) => {
              const disabled = !colorAvailable(c);
              const active = color === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => selectColor(c)}
                  disabled={disabled}
                  aria-pressed={active}
                  aria-label={`Warna ${c}${disabled ? ", habis stok" : ""}`}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border transition-all",
                    active
                      ? "border-gold ring-2 ring-gold/40"
                      : "border-line hover:border-gold/60",
                    disabled && "cursor-not-allowed opacity-35 hover:border-line",
                  )}
                  style={{ backgroundColor: COLOR_SWATCH[c] ?? "#F1E9DC" }}
                />
              );
            })}
          </div>
        </div>
      )}

      {hasSizes && (
        <div>
          <p className="text-sm font-medium text-ink">
            Saiz
            {size && <span className="ml-1.5 font-normal text-ink-soft">: {size}</span>}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {sizes.map((s) => {
              const available = color != null ? sizeAvailable(s) : sizeAvailableNoColor(s);
              const outOfStock = sizeOutOfStock(s);
              const disabled = !available;
              const active = size === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => selectSize(s)}
                  disabled={disabled}
                  aria-pressed={active}
                  aria-label={`Saiz ${s}${outOfStock ? ", habis stok" : ""}`}
                  className={cn(
                    "flex h-10 min-w-12 items-center justify-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors",
                    active
                      ? "border-gold bg-gold-tint text-gold-deep"
                      : "border-line bg-card text-ink hover:border-gold hover:text-gold-deep",
                    disabled && "cursor-not-allowed opacity-40 hover:border-line hover:text-ink",
                  )}
                >
                  {s}
                  {outOfStock && <span className="text-[10px] text-ink-soft">Habis</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
