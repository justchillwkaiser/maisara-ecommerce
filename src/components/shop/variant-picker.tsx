"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import type { ProductVariantDetail } from "@/server/services/product.service";

interface VariantPickerProps {
  variants: ProductVariantDetail[];
  /** variant id terpilih (atau null jika belum lengkap). */
  value: string | null;
  onChange: (variantId: string | null) => void;
}

/** Rupa asas satu pilihan: bucu bersudut, mono, sasaran sentuh 44px. */
const OPTION_CLASS =
  "flex h-11 items-center justify-center gap-2 rounded-xs border px-4 font-mono text-meta transition-colors duration-(--dur-fast)";
const OPTION_IDLE = "border-line bg-paper-lift text-ink hover:border-ink";
const OPTION_ACTIVE = "border-ink bg-ink text-paper";
const OPTION_DISABLED =
  "cursor-not-allowed border-line bg-bone text-cocoa opacity-70 hover:border-line";

/**
 * Pemilih variant (spesifikasi 15 - PDP).
 *
 * Kawalan dibina HANYA daripada data sebenar `variants`: kumpulan warna dari
 * warna yang benar-benar wujud, kumpulan saiz dari saiz yang benar-benar wujud.
 * Tiada julat saiz rekaan dan tiada swatch hex yang dicipta - nama warna sebenar
 * dipaparkan sebagai pilihan mono, jadi warna yang tiada dalam peta tidak pernah
 * muncul sebagai nilai palsu.
 *
 * Pilihan yang stoknya 0 (atau tiada bagi warna terpilih) dilumpuhkan dan
 * dilabel "Habis"; satu-satunya saiz produk (cth. "ONE SIZE") dipilih automatik
 * supaya ia kelihatan sebagai satu pilihan, bukan julat.
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
  const hasColors = colors.length > 0;
  const hasSizes = sizes.length > 0;
  /** Produk satu saiz (cth. "ONE SIZE") - bukan julat, jadi dipilih automatik. */
  const singleSize = sizes.length === 1 ? sizes[0] : null;
  /** Produk tanpa kawalan warna/saiz: variant sebenar yang ada stok dipilih terus. */
  const soleVariantId =
    !hasColors && !hasSizes ? (variants.find((variant) => variant.stock > 0)?.id ?? null) : null;

  /** Jumlah stok bagi semua variant warna ini (0 -> pilihan warna disabled). */
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

  /** Boleh dipilih dengan keadaan warna semasa. */
  function sizeSelectable(s: string): boolean {
    return color != null ? sizeAvailable(s) : sizeAvailableNoColor(s);
  }

  /** Saiz yang dipaparkan sebagai terpilih: state pembeli, atau satu-satunya saiz. */
  const activeSize = size ?? (singleSize != null && sizeSelectable(singleSize) ? singleSize : null);

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
      activeSize != null && variants.some((v) => v.color === c && v.size === activeSize && v.stock > 0)
        ? activeSize
        : null;
    setColor(c);
    setSize(nextSize);
    onChange(resolveVariant(c, nextSize));
  }

  function selectSize(s: string) {
    setSize(s);
    onChange(resolveVariant(color, s));
  }

  // Pilihan tunggal (satu saiz, atau produk tanpa kawalan) dipilih automatik
  // sebaik variant sebenar boleh diselesaikan, supaya pembeli tidak perlu
  // menekan satu-satunya pilihan yang ada.
  useEffect(() => {
    if (value !== null) return;
    if (soleVariantId !== null) {
      onChange(soleVariantId);
      return;
    }
    if (singleSize === null || size !== null) return;
    const match = variants.find(
      (v) => v.color === color && v.size === singleSize && v.stock > 0,
    );
    if (match) onChange(match.id);
  }, [value, soleVariantId, singleSize, size, color, variants, onChange]);

  const hasDisabledOption =
    colors.some((c) => !colorAvailable(c)) || sizes.some((s) => !sizeSelectable(s));

  return (
    <div className="space-y-7">
      {hasColors ? (
        <fieldset>
          <legend className="meta-label text-ink">Warna</legend>
          {color ? <p className="mt-1.5 font-mono text-body-sm text-cocoa">{color}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
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
                    OPTION_CLASS,
                    active ? OPTION_ACTIVE : OPTION_IDLE,
                    disabled && OPTION_DISABLED,
                  )}
                >
                  {c}
                  {disabled ? <span className="text-cocoa">Habis</span> : null}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      {hasSizes ? (
        <fieldset>
          <legend className="meta-label text-ink">Saiz</legend>
          {activeSize ? (
            <p className="mt-1.5 font-mono text-body-sm text-cocoa">{activeSize}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {sizes.map((s) => {
              const available = sizeSelectable(s);
              const outOfStock = sizeOutOfStock(s);
              const active = activeSize === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => selectSize(s)}
                  disabled={!available}
                  aria-pressed={active}
                  aria-label={`Saiz ${s}${outOfStock ? ", habis stok" : ""}`}
                  className={cn(
                    OPTION_CLASS,
                    "min-w-11 px-3",
                    active ? OPTION_ACTIVE : OPTION_IDLE,
                    !available && OPTION_DISABLED,
                  )}
                >
                  {s}
                  {outOfStock ? <span className="text-cocoa">Habis</span> : null}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      {hasDisabledOption ? (
        <p className="text-body-sm text-cocoa">
          Pilihan pudar tidak boleh dipilih: stok habis atau tiada bagi warna terpilih.
        </p>
      ) : null}
    </div>
  );
}
