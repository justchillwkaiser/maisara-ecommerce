"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider, CartSync, useCart } from "./cart-context";
/**
 * CartDrawer di-lazy-load (next/dynamic, ssr:false): drawer hanya perlu
 * apabila pengguna membukanya, bukan pada page load.
 *
 * `mounted` penting di sini: `<CartDrawer />` yang dirender tanpa syarat
 * menyebabkan React memasang komponen malas itu semasa hydration, jadi import
 * dinamik tercetus serta-merta pada SETIAP laluan (group 81KB dimuatkan selepas
 * hydration walaupun beg tidak pernah dibuka). Dengan gerbang ini, chunk hanya
 * diminta pada buka pertama; selepas itu drawer kekal terpasang supaya
 * animasi tutup tidak terpotong.
 */
const CartDrawer = dynamic(() => import("./cart-drawer").then((m) => m.CartDrawer), {
  ssr: false,
  loading: () => null,
});
function LazyCartDrawer() {
  const { isOpen } = useCart();
  const [mounted, setMounted] = useState(false);
  /** Elemen yang mempunyai fokus sebelum drawer dibuka. */
  const restoreRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!isOpen) return;
    setMounted(true);
    // Drawer dibuka secara programatik (badge header, add-to-cart), dan
    // selepas ini dimuat secara malas, jadi Radix tidak boleh bergantung
    // pada elemen fokus asal. Rakam di sini supaya fokus boleh dipulangkan.
    //
    // Nilai ini SENGAJA tidak dikosongkan apabila drawer ditutup: Radix
    // memanggil `onCloseAutoFocus` selepas animasi keluar selesai, jadi
    // mengosongkannya semasa `isOpen` menjadi false akan menjadikan
    // pemulihan fokus mustahil. Ia ditimpa pada buka seterusnya.
    if (document.activeElement instanceof HTMLElement) {
      restoreRef.current = document.activeElement;
    }
  }, [isOpen]);
  return mounted ? <CartDrawer restoreFocusRef={restoreRef} /> : null;
}
/**
 * Providers client (Task 9): CartProvider + drawer + sync auth + Toaster.
 * Dipasang dalam root layout supaya badge, drawer dan toast tersedia
 * di semua halaman.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      {children}
      <LazyCartDrawer />
      <CartSync />
      <Toaster position="top-center" />
    </CartProvider>
  );
}
