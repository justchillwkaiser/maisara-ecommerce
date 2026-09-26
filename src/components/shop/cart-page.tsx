"use client";

import Link from "next/link";
import { toast } from "sonner";

import { CartLineItem } from "@/components/shop/cart-line-item";
import { TRUST_POINTS } from "@/components/shared/trust-strip";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRM } from "@/lib/format";
import { shippingMethods } from "@/lib/shipping";

import { useCart } from "../shared/cart-context";

/** Kaedah penghantaran sebenar (lib/shipping) — dibaca sekali, bukan direka. */
const SHIPPING_METHODS = shippingMethods();

/**
 * Dua jaminan yang paling relevan di sisi beg. Dipilih daripada TRUST_POINTS
 * supaya salinan hanya wujud di satu tempat.
 */
const CART_TRUST = TRUST_POINTS.filter((point) =>
  ["Penghantaran seluruh Malaysia", "Dibungkus dengan teliti"].includes(
    point.label,
  ),
);

/** Skeleton baris item semasa muat pertama. */
function ItemSkeletons() {
  return (
    <ul className="divide-y divide-line border-y border-line" aria-hidden="true">
      {Array.from({ length: 3 }, (_, index) => (
        <li key={index} className="flex gap-5 py-6">
          <Skeleton className="aspect-4/5 w-20 shrink-0 rounded-xs" />
          <div className="flex flex-1 flex-col gap-3">
            <Skeleton className="h-5 w-2/3 rounded-xs" />
            <Skeleton className="h-4 w-1/3 rounded-xs" />
            <Skeleton className="h-11 w-32 rounded-xs" />
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * Halaman Beg (spesifikasi 17 + 30): baris item, ringkasan order dan CTA
 * checkout. Restyle sahaja — semua panggilan useCart, kemas kini optimistik,
 * pengendalian ralat dan toast kekal seperti sebelum ini.
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
        error instanceof Error ? error.message : "Gagal mengemas kini beg.",
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
    <div className="shell py-(--space-section)">
      <SectionHeading
        as="h1"
        size="h1"
        eyebrow={itemCount > 0 ? `Beg — ${itemCount} item` : "Beg"}
        title="YOUR BAG"
        description="Semak pilihan anda sebelum meneruskan ke checkout."
      />

      {loading && items.length === 0 ? (
        <div className="mt-12" aria-busy="true">
          <p role="status" className="sr-only">
            Memuatkan beg anda.
          </p>
          <ItemSkeletons />
        </div>
      ) : empty ? (
        <EmptyState
          className="mt-12"
          eyebrow="Beg"
          title="Beg anda kosong"
          description="Belum ada apa-apa di dalam beg. Mulakan dengan koleksi terbaru kami."
          action={{ label: "Lihat Koleksi", href: "/koleksi" }}
        />
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
          {/* Senarai item */}
          <ul className="divide-y divide-line border-y border-line">
            {items.map((item) => (
              <li key={item.id}>
                <CartLineItem
                  className="py-6"
                  item={item}
                  pending={pendingItemIds.has(item.id)}
                  onQuantityChange={(quantity) =>
                    void handleUpdate(item.id, quantity)
                  }
                  onRemove={() => void handleRemove(item.id)}
                />
              </li>
            ))}
          </ul>

          {/* Ringkasan order */}
          <aside
            aria-labelledby="ringkasan-order"
            className="h-fit border border-line bg-bone p-6 lg:sticky lg:top-24"
          >
            <h2 id="ringkasan-order" className="meta-label text-cocoa">
              Ringkasan Order
            </h2>
            <div className="mt-5 flex items-baseline justify-between gap-4">
              <span className="meta-label text-cocoa">Subtotal</span>
              <span className="font-display text-h3 tabular-nums text-ink">
                {formatRM(subtotal)}
              </span>
            </div>
            <p className="mt-2 text-body-sm text-cocoa">
              {itemCount} item dalam beg.
            </p>

            <div className="mt-6 border-t border-line pt-5">
              <h3 className="meta-label text-cocoa">Penghantaran</h3>
              <ul className="mt-3 space-y-2">
                {SHIPPING_METHODS.map((method) => (
                  <li
                    key={method.id}
                    className="flex items-baseline justify-between gap-4"
                  >
                    <span className="text-body-sm text-ink">{method.label}</span>
                    <span className="font-mono text-body-sm tabular-nums text-cocoa">
                      dari {formatRM(method.feeSemenanjung)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-body-sm text-cocoa">
                Kadar akhir ikut negeri dan dikira di checkout.
              </p>
            </div>

            {pendingItemIds.size > 0 ? (
              <Button
                size="lg"
                className="mt-6 w-full"
                disabled
                aria-busy="true"
              >
                Menyegerakkan beg…
              </Button>
            ) : (
              <Button asChild size="lg" className="mt-6 w-full">
                <Link href="/checkout">Teruskan ke Checkout</Link>
              </Button>
            )}
            <Link
              href="/koleksi"
              className="mt-4 block text-center text-body-sm text-cocoa transition-colors duration-(--dur-fast) hover:text-ink"
            >
              Teruskan Membeli
            </Link>

            <ul className="mt-6 space-y-4 border-t border-line pt-5">
              {CART_TRUST.map((point) => (
                <li key={point.label} className="flex flex-col gap-1">
                  <span className="meta-label text-ink">{point.label}</span>
                  <span className="text-body-sm text-cocoa">
                    {point.detail}
                  </span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      )}
    </div>
  );
}
