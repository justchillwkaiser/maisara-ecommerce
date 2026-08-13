"use client";

import Link from "next/link";
import { ShoppingBag } from "@phosphor-icons/react";

/**
 * Butang cart (placeholder). TODO (Task 9): wire ke cart context.
 * Untuk sekarang count hardcode 0, badge hanya nampak bila count > 0.
 */
export function CartButton() {
  // TODO (Task 9): ganti dengan count dari cart context.
  const count = 0;

  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${count} item`}
      className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-gold-tint hover:text-gold-deep"
    >
      <ShoppingBag size={20} />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[11px] font-semibold tabular-nums text-card">
          {count}
        </span>
      )}
    </Link>
  );
}
