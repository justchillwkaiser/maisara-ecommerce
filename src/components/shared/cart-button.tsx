"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ShoppingBag } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

import { useCart } from "./cart-context";

/**
 * Butang beg header (spesifikasi 11). Badge kiraan dari cart context
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
      className={cn(
        "relative flex size-11 items-center justify-center rounded-xs text-cocoa",
        "transition-colors duration-(--dur-fast) hover:bg-bone hover:text-ink",
        "group-data-[state=top]:text-paper/80 group-data-[state=top]:hover:bg-paper/10 group-data-[state=top]:hover:text-paper",
      )}
    >
      <ShoppingBag size={19} aria-hidden="true" />
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.span
            key="cart-badge"
            layout
            initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={reduceMotion ? undefined : { scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "absolute top-0.5 right-0.5 flex h-5 min-w-5 items-center justify-center rounded-xs px-1",
              "bg-ink font-mono text-meta leading-none tracking-normal text-paper tabular-nums",
              "group-data-[state=top]:bg-paper group-data-[state=top]:text-ink",
            )}
          >
            {itemCount}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
