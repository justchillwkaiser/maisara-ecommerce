"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";

import { CartProvider, CartSync } from "./cart-context";

/**
 * CartDrawer di-lazy-load (next/dynamic, ssr:false): drawer hanya perlu
 * pada interaksi (klik badge cart / add-to-cart), bukan pada page load.
 * Ini mengurangkan JS bundle awal + hydration, terutamanya pada halaman
 * berat (koleksi, PDP). Badge header tetap responsif — ia guna cart
 * context, bukan drawer.
 */
const CartDrawer = dynamic(() => import("./cart-drawer").then((m) => m.CartDrawer), {
  ssr: false,
  loading: () => null,
});

/**
 * Providers client (Task 9): CartProvider + drawer + sync auth + Toaster.
 * Dipasang dalam root layout supaya badge, drawer dan toast tersedia
 * di semua halaman.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
      <CartSync />
      <Toaster richColors position="top-center" />
    </CartProvider>
  );
}
