import { redirect } from "next/navigation";
import Link from "next/link";
import { ShoppingBag } from "@phosphor-icons/react/dist/ssr";

import { CheckoutForm } from "@/components/shop/checkout-form";
import { getCartContext } from "@/lib/cart-context";
import { requireUser } from "@/server/guards";
import { getCart } from "@/server/services/cart.service";

/**
 * Checkout (DESIGN.md 8, UX.md Flow A).
 * Server component: guard session (redirect /log-masuk), baca cart;
 * jika kosong papar empty state (halaman /cart dibina task akaun).
 */
export default async function CheckoutPage() {
  let userId: string;
  try {
    const user = await requireUser();
    userId = user.id;
  } catch {
    redirect("/log-masuk?next=/checkout");
  }

  const ctx = await getCartContext();
  const cart = await getCart(ctx);

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col items-center px-4 py-24 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-gold-tint text-gold">
          <ShoppingBag size={28} />
        </div>
        <h1 className="mt-6 font-serif text-3xl text-ink">Cart anda kosong</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Tambah item kegemaran anda dahulu sebelum meneruskan checkout.
        </p>
        <Link
          href="/koleksi"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-gold px-7 text-sm font-medium text-card transition-colors hover:bg-gold-deep"
        >
          Teruskan Membeli
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 md:py-14">
      <div className="mb-8">
        <p className="text-xs tracking-wide text-ink-soft uppercase">Checkout</p>
        <h1 className="mt-1 font-serif text-3xl text-ink">Selesaikan Pesanan Anda</h1>
      </div>
      <CheckoutForm items={cart.items} subtotal={cart.subtotal} />
    </div>
  );
}
