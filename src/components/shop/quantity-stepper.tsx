"use client";

import { Minus, Plus } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  /** Stok variant (cap 99). */
  max: number;
  disabled?: boolean;
}

/**
 * Stepper kuantiti (DESIGN.md 8 - PDP): 1 hingga min(stok variant, 99),
 * butang Minus/Plus + input number. Style pill, border-line.
 */
export function QuantityStepper({ value, onChange, max, disabled = false }: QuantityStepperProps) {
  const cap = Math.min(Math.max(max, 1), 99);

  function clamp(n: number) {
    if (!Number.isFinite(n)) return 1;
    return Math.min(Math.max(Math.round(n), 1), cap);
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-line bg-card",
        disabled && "opacity-50",
      )}
    >
      <button
        type="button"
        aria-label="Kurangkan kuantiti"
        disabled={disabled || value <= 1}
        onClick={() => onChange(clamp(value - 1))}
        className="flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:text-gold-deep disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus size={16} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={cap}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(clamp(Number(event.target.value)))}
        aria-label="Kuantiti"
        className="w-14 border-none bg-transparent text-center text-sm font-medium tabular-nums text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none disabled:cursor-not-allowed"
      />
      <button
        type="button"
        aria-label="Tambah kuantiti"
        disabled={disabled || value >= cap}
        onClick={() => onChange(clamp(value + 1))}
        className="flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:text-gold-deep disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
