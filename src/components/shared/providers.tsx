"use client";

import type { ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";

import { CartProvider, CartSync } from "./cart-context";
import { CartDrawer } from "./cart-drawer";

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
