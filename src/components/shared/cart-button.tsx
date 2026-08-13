"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ShoppingBag } from "@phosphor-icons/react";

import { useCart } from "./cart-context";

/**
 * Butang cart header (DESIGN.md 7.1). Badge kiraan dari cart context
 * (sembunyi bila 0, motion layout bila berubah). Klik buka drawer cart;
 * href /cart kekal sebagai fallback semantik.
 */
export function CartButton() {
  const { itemCount, open } = useCart();
  const reduceMotion = useReducedMotion();

  return (
    <Link
      href="/cart"
      onClick={(event) => {
        event.preventDefault();
        open();
      }}
      aria-label={`Cart, ${itemCount} item`}
      className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-gold-tint hover:text-gold-deep"
    >
      <ShoppingBag size={20} />
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.span
            key="cart-badge"
            layout
            initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={reduceMotion ? undefined : { scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[11px] font-semibold tabular-nums text-card"
          >
            {itemCount}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
