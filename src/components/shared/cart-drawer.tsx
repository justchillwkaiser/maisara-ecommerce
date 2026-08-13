"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Minus, Plus, ShoppingBag, Trash } from "@phosphor-icons/react";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatRM } from "@/lib/format";
import { cn } from "@/lib/utils";

import { useCart, type CartItemView } from "./cart-context";

/** Bezier lembut (DESIGN.md 9). */
const EASE = [0.16, 1, 0.3, 1] as const;

/** Label variant ringkas (cth. "Sage / M"). */
function variantLabel(item: CartItemView): string {
  return [item.variant.color, item.variant.size].filter(Boolean).join(" / ");
}

/** Stepper kuantiti kecil untuk drawer (h-8, cap stok). */
function MiniStepper({
  item,
  onDecrease,
  onIncrease,
}: {
  item: CartItemView;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  const cap = Math.min(Math.max(item.variant.stock, 1), 99);
  return (
    <div className="inline-flex items-center rounded-full border border-line bg-card">
      <button
        type="button"
        aria-label="Kurangkan kuantiti"
        disabled={item.quantity <= 1}
        onClick={onDecrease}
        className="flex h-8 w-8 items-center justify-center rounded-full text-ink transition-colors hover:text-gold-deep disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus size={13} />
      </button>
      <span className="w-8 text-center text-sm font-medium tabular-nums text-ink" aria-live="polite">
        {item.quantity}
      </span>
      <button
        type="button"
        aria-label="Tambah kuantiti"
        disabled={item.quantity >= cap}
        onClick={onIncrease}
        className="flex h-8 w-8 items-center justify-center rounded-full text-ink transition-colors hover:text-gold-deep disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus size={13} />
      </button>
    </div>
  );
}

/** Skeleton baris item semasa muat pertama (DESIGN.md 5 - loading state). */
function ItemSkeletons() {
  return (
    <div className="space-y-5 px-4 py-4">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-16 w-16 shrink-0 rounded-lg bg-surface" />
          <div className="flex-1 space-y-2 py-1">
            <Skeleton className="h-4 w-3/4 rounded bg-surface" />
            <Skeleton className="h-3 w-1/3 rounded bg-surface" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Drawer cart (DESIGN.md 8 - Cart & Checkout, section 9 - AnimatePresence).
 * Sheet shadcn side right; item masuk/keluar dengan motion. Footer: subtotal
 * + CTA "Teruskan ke Checkout" (gold pill penuh) ke /checkout.
 */
export function CartDrawer() {
  const { items, subtotal, itemCount, isOpen, loading, close, updateQuantity, remove } = useCart();
  const reduceMotion = useReducedMotion();

  async function handleUpdate(itemId: string, quantity: number) {
    try {
      await updateQuantity(itemId, quantity);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengemas kini cart.");
    }
  }

  async function handleRemove(itemId: string) {
    try {
      await remove(itemId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membuang item.");
    }
  }

  const empty = items.length === 0 && !loading;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? undefined : close())}>
      <SheetContent side="right" className="flex flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-line pr-12">
          <div className="flex items-baseline justify-between">
            <SheetTitle className="font-serif text-xl font-semibold text-ink">
              Cart Anda
            </SheetTitle>
            {itemCount > 0 && (
              <span className="text-xs text-ink-soft tabular-nums">{itemCount} item</span>
            )}
          </div>
          <SheetDescription className="sr-only">Senarai item dalam cart anda</SheetDescription>
        </SheetHeader>

        {loading && items.length === 0 ? (
          <ItemSkeletons />
        ) : empty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <ShoppingBag size={40} className="text-ink-soft/40" />
            <p className="font-serif text-xl font-semibold text-ink">Cart kosong.</p>
            <p className="text-sm text-ink-soft">Mula membeli-belah.</p>
            <Link
              href="/koleksi"
              onClick={close}
              className="mt-2 inline-flex h-11 items-center rounded-full bg-gold px-7 text-sm font-medium text-card transition-colors hover:bg-gold-deep"
            >
              Lihat Koleksi
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-4">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.li
                    key={item.id}
                    layout
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, x: 16 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="py-4"
                  >
                    <div className="flex gap-3">
                      <Link
                        href={`/produk/${item.product.slug}`}
                        onClick={close}
                        className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface"
                      >
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.product.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : null}
                      </Link>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/produk/${item.product.slug}`}
                            onClick={close}
                            className="line-clamp-2 text-sm leading-snug font-medium text-ink transition-colors hover:text-gold-deep"
                          >
                            {item.product.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => void handleRemove(item.id)}
                            aria-label={`Buang ${item.product.name} dari cart`}
                            className="shrink-0 rounded-full p-1 text-ink-soft transition-colors hover:bg-surface hover:text-gold-deep"
                          >
                            <Trash size={15} />
                          </button>
                        </div>

                        {variantLabel(item) && (
                          <p className="mt-0.5 text-xs text-ink-soft">{variantLabel(item)}</p>
                        )}

                        <div className="mt-2 flex items-center justify-between gap-3">
                          <MiniStepper
                            item={item}
                            onDecrease={() => void handleUpdate(item.id, item.quantity - 1)}
                            onIncrease={() => void handleUpdate(item.id, item.quantity + 1)}
                          />
                          <span className="text-sm font-medium tabular-nums text-ink">
                            {formatRM(item.lineTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            <div className="border-t border-line p-4">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm text-ink-soft">Subtotal</span>
                <span className="font-serif text-xl font-semibold tabular-nums text-ink">
                  {formatRM(subtotal)}
                </span>
              </div>
              <p className="mb-4 text-xs text-ink-soft">Penghantaran dikira di checkout.</p>
              <Link
                href="/checkout"
                onClick={close}
                className={cn(
                  "flex h-12 w-full items-center justify-center rounded-full bg-gold px-6 text-sm font-medium text-card transition-all",
                  "hover:bg-gold-deep active:scale-[0.98]",
                )}
              >
                Teruskan ke Checkout
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
