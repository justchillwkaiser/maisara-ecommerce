"use client";

import Link from "next/link";
import type { RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";

import { CartLineItem } from "@/components/shop/cart-line-item";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatRM } from "@/lib/format";

import { useCart } from "./cart-context";

/** Bezier lembut (DESIGN.md 9). */
const EASE = [0.16, 1, 0.3, 1] as const;

/** Skeleton baris item semasa muat pertama. */
function ItemSkeletons() {
  return (
    <div className="space-y-5 px-5 py-5" aria-hidden="true">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="flex gap-3">
          <Skeleton className="aspect-4/5 w-14 shrink-0 rounded-xs" />
          <div className="flex flex-1 flex-col gap-2 py-1">
            <Skeleton className="h-4 w-3/4 rounded-xs" />
            <Skeleton className="h-3 w-1/3 rounded-xs" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Drawer beg (spesifikasi 17). Baris item dikongsi dengan halaman /cart
 * melalui CartLineItem supaya kedua-dua permukaan tidak menyimpang.
 * Wiring buka/tutup dan cart-context kekal seperti asal.
 *
 * `restoreFocusRef`: drawer dibuka secara programatik (tiada SheetTrigger), jadi
 * Radix tiada pencetus untuk dipulihkan fokusnya - dan sejak drawer dimuat
 * secara malas, elemen yang direkod Radix semasa buka pertama boleh jadi
 * <body>. Pemanggil merakam elemen fokus sebelum buka; di sini ia dipulihkan
 * secara eksplisit apabila drawer ditutup.
 */
export function CartDrawer({
  restoreFocusRef,
}: {
  restoreFocusRef?: RefObject<HTMLElement | null>;
}) {
  const {
    items,
    subtotal,
    itemCount,
    isOpen,
    loading,
    pendingItemIds,
    close,
    updateQuantity,
    remove,
  } = useCart();
  const reduceMotion = useReducedMotion();

  async function handleUpdate(itemId: string, quantity: number) {
    if (pendingItemIds.has(itemId)) return; // tunggu sync selesai
    try {
      await updateQuantity(itemId, quantity);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengemas kini beg.");
    }
  }

  async function handleRemove(itemId: string) {
    if (pendingItemIds.has(itemId)) return; // tunggu sync selesai
    try {
      await remove(itemId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membuang item.");
    }
  }

  const empty = items.length === 0 && !loading;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? undefined : close())}>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 p-0 sm:max-w-md"
        onCloseAutoFocus={(event) => {
          const target = restoreFocusRef?.current;
          // Radix memulihkan fokus kepada `previouslyFocusedElement` yang
          // direkodnya semasa dialog dibuka. Drawer ini dibuka secara
          // programatik dan dimuat secara malas, jadi rekod itu boleh jadi
          // <body>; utamakan elemen yang dirakam pemanggil.
          if (target?.isConnected) {
            event.preventDefault();
            target.focus();
          }
        }}
      >
        <SheetHeader className="gap-2 border-b border-line px-5 py-5 pr-14">
          <p className="meta-label text-cocoa">
            {itemCount > 0 ? `Beg — ${itemCount} item` : "Beg"}
          </p>
          <SheetTitle className="font-display text-h3 text-ink">
            YOUR BAG
          </SheetTitle>
          <SheetDescription className="sr-only">
            Senarai item dalam beg anda
          </SheetDescription>
        </SheetHeader>

        {loading && items.length === 0 ? (
          <div aria-busy="true">
            <p role="status" className="sr-only">
              Memuatkan beg anda.
            </p>
            <ItemSkeletons />
          </div>
        ) : empty ? (
          <EmptyState
            className="flex-1 border-0 bg-transparent"
            density="panel"
            eyebrow="Beg"
            title="Beg anda kosong"
            description="Belum ada item. Mulakan dengan koleksi kami."
          >
            <Button asChild>
              <Link href="/koleksi" onClick={close}>
                Lihat Koleksi
              </Link>
            </Button>
          </EmptyState>
        ) : (
          <>
            <ul
              className="flex-1 divide-y divide-line overflow-y-auto px-5"
              aria-busy={loading || undefined}
            >
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.li
                    key={item.id}
                    layout
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, x: 16 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="py-5"
                  >
                    <CartLineItem
                      density="drawer"
                      item={item}
                      pending={pendingItemIds.has(item.id)}
                      onNavigate={close}
                      onQuantityChange={(quantity) =>
                        void handleUpdate(item.id, quantity)
                      }
                      onRemove={() => void handleRemove(item.id)}
                    />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            <div className="border-t border-line px-5 py-5">
              <div className="flex items-baseline justify-between gap-4">
                <span className="meta-label text-cocoa">Subtotal</span>
                <span className="font-display text-h3 tabular-nums text-ink">
                  {formatRM(subtotal)}
                </span>
              </div>
              <p className="mt-2 text-body-sm text-cocoa">
                Penghantaran dikira di checkout.
              </p>
              {/* Item optimistic belum dikomit oleh server. Membenarkan
                  navigasi sekarang menghantar pengguna ke /checkout yang
                  dirender pelayan dengan beg KOSONG (race pada sambungan
                  lambat: add-to-cart mengambil masa). Tunggu sync selesai. */}
              {pendingItemIds.size > 0 ? (
                <Button
                  size="lg"
                  className="mt-5 w-full"
                  disabled
                  aria-busy="true"
                  aria-describedby="cart-sync-status"
                >
                  Menyegerakkan beg…
                </Button>
              ) : (
                <Button asChild size="lg" className="mt-5 w-full">
                  <Link href="/checkout" onClick={close}>
                    Teruskan ke Checkout
                  </Link>
                </Button>
              )}
              <p id="cart-sync-status" role="status" className="sr-only">
                {pendingItemIds.size > 0
                  ? "Beg sedang disegerakkan dengan pelayan."
                  : "Beg sudah disegerakkan."}
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
