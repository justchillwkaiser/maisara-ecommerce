import type { Metadata } from "next";

import { CartPage } from "@/components/shop/cart-page";

export const metadata: Metadata = {
  title: "Cart | Maisara",
  description:
    "Semak item dalam cart anda dan teruskan ke checkout. Penghantaran dikira di checkout.",
};

/**
 * Halaman Cart (backlog P1.2): fallback penuh untuk CartButton,
 * supaya link /cart tidak lagi 404. State cart dikongsi dengan drawer
 * melalui CartProvider (components/shared/providers.tsx).
 */
export default function CartRoute() {
  return <CartPage />;
}
