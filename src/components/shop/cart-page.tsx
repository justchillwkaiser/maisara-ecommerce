"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash } from "@phosphor-icons/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRM } from "@/lib/format";
import { cn } from "@/lib/utils";

import { useCart, type CartItemView } from "../shared/cart-context";

/** Label variant ringkas (cth. "Sage / M"). */
function variantLabel(item: CartItemView): string {
  return [item.variant.color, item.variant.size].filter(Boolean).join(" / ");
}

/** Skeleton baris item semasa muat pertama. */
function ItemSkeletons() {
  return (
    <div className="space-y-5">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-24 w-24 shrink-0 rounded-xl bg-surface" />
          <div className="flex-1 space-y-3 py-2">
            <Skeleton className="h-4 w-2/3 rounded bg-surface" />
            <Skeleton className="h-3 w-1/3 rounded bg-surface" />
            <Skeleton className="h-8 w-28 rounded-full bg-surface" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Halaman Cart penuh (backlog P1.2): senarai item cart dengan kuantiti,
 * subtotal dan CTA checkout. Reuse cart context (sama dengan drawer).
 * Gaya ikut DESIGN.md (kad card, garisan line, gold CTA).
 */
export function CartPage() {
  const { items, subtotal, itemCount, loading, pendingItemIds, updateQuantity, remove } =
    useCart();

  async function handleUpdate(itemId: string, quantity: number) {
    if (pendingItemIds.has(itemId)) return; // tunggu sync selesai
    try {
      await updateQuantity(itemId, quantity);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal mengemas kini cart.",
      );
    }
  }

  async function handleRemove(itemId: string) {
    if (pendingItemIds.has(itemId)) return; // tunggu sync selesai
    try {
      await remove(itemId);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal membuang item.",
      );
    }
  }

  const empty = items.length === 0 && !loading;

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-12 md:px-8 md:py-16">
      <p className="text-xs tracking-wide text-ink-soft uppercase">Cart Anda</p>
      <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight text-ink md:text-4xl">
        Cart Anda
      </h1>

      {loading && items.length === 0 ? (
        <div className="mt-10">
          <ItemSkeletons />
        </div>
      ) : empty ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-line bg-card px-6 py-20 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-gold-tint text-gold">
            <ShoppingBag size={28} />
          </div>
          <p className="mt-6 font-serif text-2xl font-medium text-ink">
            Cart kosong.
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            Mula membeli-belah dan temui koleksi Maisara.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/koleksi">Lihat Koleksi</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          {/* Senarai item */}
          <ul className="divide-y divide-line rounded-2xl border border-line bg-card">
            {items.map((item) => (
              <li
                key={item.id}
                className={cn(
                  "flex gap-4 p-5 transition-opacity md:gap-5",
                  pendingItemIds.has(item.id) && "opacity-60",
                )}
              >
                <Link
                  href={`/produk/${item.product.slug}`}
                  className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface"
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.product.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : null}
                </Link>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/produk/${item.product.slug}`}
                      className="line-clamp-2 font-serif text-lg font-medium text-ink transition-colors hover:text-gold-deep"
                    >
                      {item.product.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleRemove(item.id)}
                      aria-label={`Buang ${item.product.name} dari cart`}
                      className="shrink-0 rounded-full p-1.5 text-ink-soft transition-colors hover:bg-surface hover:text-gold-deep"
                    >
                      <Trash size={16} />
                    </button>
                  </div>

                  {variantLabel(item) && (
                    <p className="mt-1 text-sm text-ink-soft">
                      {variantLabel(item)}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div
                      className={cn(
                        "inline-flex items-center rounded-full border border-line bg-card",
                        pendingItemIds.has(item.id) && "opacity-60",
                      )}
                    >
                      <button
                        type="button"
                        aria-label="Kurangkan kuantiti"
                        disabled={item.quantity <= 1 || pendingItemIds.has(item.id)}
                        onClick={() =>
                          void handleUpdate(item.id, item.quantity - 1)
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:text-gold-deep disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Minus size={14} />
                      </button>
                      <span
                        className="w-10 text-center text-sm font-medium tabular-nums text-ink"
                        aria-live="polite"
                      >
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Tambah kuantiti"
                        disabled={
                          item.quantity >=
                            Math.min(Math.max(item.variant.stock, 1), 99) ||
                          pendingItemIds.has(item.id)
                        }
                        onClick={() =>
                          void handleUpdate(item.id, item.quantity + 1)
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:text-gold-deep disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="font-serif text-lg font-semibold tabular-nums text-ink">
                      {formatRM(item.lineTotal)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Ringkasan */}
          <aside className="h-fit rounded-2xl border border-line bg-card p-6 lg:sticky lg:top-24">
            <h2 className="font-serif text-xl font-semibold text-ink">
              Ringkasan
            </h2>
            <div className="mt-4 flex items-center justify-between text-sm text-ink-soft">
              <span>{itemCount} item</span>
              <span className="font-medium tabular-nums text-ink">
                {formatRM(subtotal)}
              </span>
            </div>
            <p className="mt-2 text-xs text-ink-soft">
              Penghantaran dikira di checkout.
            </p>
            <Button asChild size="lg" className="mt-6 w-full">
              <Link href="/checkout">Teruskan ke Checkout</Link>
            </Button>
            <Link
              href="/koleksi"
              className="mt-4 block text-center text-sm text-ink-soft transition-colors hover:text-gold-deep"
            >
              Teruskan Membeli
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
