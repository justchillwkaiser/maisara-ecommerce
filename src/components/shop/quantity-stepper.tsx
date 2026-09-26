"use client";

import { Minus, Plus } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  /** Stok varian — had atas sebenar. */
  max: number;
  disabled?: boolean;
  /** Label untuk pembaca skrin, cth. nama produk. */
  label?: string;
  size?: "default" | "compact";
}

/**
 * Stepper kuantiti MAISARA — dikongsi PDP dan beg.
 *
 * Radius 2px dan bucu bersudut, bukan pill: ia kekal sebagai kawalan editorial.
 * Butang mengekalkan sasaran sentuh 44px pada saiz lalai; saiz padat (36px)
 * hanya untuk baris beg yang sudah padat.
 */
export function QuantityStepper({
  value,
  onChange,
  max,
  disabled = false,
  label,
  size = "default",
}: QuantityStepperProps) {
  const cap = Math.min(Math.max(max, 1), 99);
  const compact = size === "compact";
  const buttonSize = compact ? "size-9" : "size-11";

  function clamp(next: number) {
    if (!Number.isFinite(next)) return 1;
    return Math.min(Math.max(Math.round(next), 1), cap);
  }

  const controlClass = cn(
    buttonSize,
    "flex items-center justify-center text-ink transition-colors duration-(--dur-fast)",
    "hover:bg-bone disabled:cursor-not-allowed disabled:opacity-35",
  );

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-xs border border-line bg-paper-lift",
        disabled && "opacity-50",
      )}
    >
      <button
        type="button"
        aria-label={label ? `Kurangkan kuantiti ${label}` : "Kurangkan kuantiti"}
        disabled={disabled || value <= 1}
        onClick={() => onChange(clamp(value - 1))}
        className={controlClass}
      >
        <Minus size={14} aria-hidden="true" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={cap}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(clamp(Number(event.target.value)))}
        aria-label={label ? `Kuantiti ${label}` : "Kuantiti"}
        className={cn(
          "border-x border-line bg-transparent text-center font-mono tabular-nums text-ink outline-none",
          "focus-visible:bg-bone",
          "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          "disabled:cursor-not-allowed",
          compact ? "h-9 w-11 text-xs" : "h-11 w-14 text-sm",
        )}
      />
      <button
        type="button"
        aria-label={label ? `Tambah kuantiti ${label}` : "Tambah kuantiti"}
        disabled={disabled || value >= cap}
        onClick={() => onChange(clamp(value + 1))}
        className={controlClass}
      >
        <Plus size={14} aria-hidden="true" />
      </button>
    </div>
  );
}
