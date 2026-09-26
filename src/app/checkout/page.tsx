import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CheckoutForm } from "@/components/shop/checkout-form";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCartContext } from "@/lib/cart-context";
import { requireUser } from "@/server/guards";
import { getCart } from "@/server/services/cart.service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

/**
 * Checkout (spesifikasi 14 + 30).
 * Server component: guard session (redirect /log-masuk), baca cart;
 * jika kosong papar empty state. Restyle sahaja — guard, fetch dan
 * penyerahan ke CheckoutForm kekal sama.
 */
export default async function CheckoutPage() {
  try {
    await requireUser();
  } catch {
    redirect("/log-masuk?next=/checkout");
  }

  const ctx = await getCartContext();
  const cart = await getCart(ctx);

  if (cart.items.length === 0) {
    return (
      <div className="shell py-(--space-section)">
        <EmptyState
          eyebrow="Checkout"
          title="Beg anda kosong"
          description="Tambah item kegemaran anda dahulu sebelum meneruskan checkout."
          action={{ label: "Teruskan Membeli", href: "/koleksi" }}
        />
      </div>
    );
  }

  return (
    <div className="shell py-(--space-section)">
      <SectionHeading
        as="h1"
        size="h1"
        eyebrow="Checkout"
        title="Selesaikan Pesanan Anda"
        description="Tiga langkah ringkas: alamat, kaedah penghantaran, kemudian semakan."
      />
      <div className="mt-12">
        <CheckoutForm items={cart.items} subtotal={cart.subtotal} />
      </div>
    </div>
  );
}
