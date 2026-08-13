"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { authClient } from "@/lib/auth-client";

/**
 * Cart context (API.md section 3 + UX.md Flow C).
 * State cart dikongsi seluruh app: badge header, drawer, add-to-cart.
 * Semua mutasi melalui API server (cookie cart-session / userId diurus
 * server). Fetch pertama berlaku pada mount (hydration safe - state awal
 * kosong sama dengan render server).
 */

export interface CartItemView {
  id: string;
  variantId: string;
  quantity: number;
  product: { id: string; name: string; slug: string };
  variant: { color: string | null; size: string | null; sku: string; stock: number };
  unitPrice: string;
  lineTotal: string;
  image: string;
}

export interface CartView {
  items: CartItemView[];
  subtotal: string;
  itemCount: number;
}

interface CartContextValue extends CartView {
  isOpen: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  add: (variantId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  remove: (itemId: string) => Promise<void>;
  open: () => void;
  close: () => void;
}

const EMPTY_CART: CartView = { items: [], subtotal: "0.00", itemCount: 0 };

const CartContext = createContext<CartContextValue | null>(null);

/** Tukar response ralat API menjadi Error dengan mesej BM dari server. */
async function errorFromResponse(response: Response): Promise<Error> {
  try {
    const body = await response.json();
    const message = body?.error?.message;
    if (typeof message === "string" && message.length > 0) return new Error(message);
  } catch {
    // badan bukan JSON - teruskan ke mesej generik
  }
  return new Error("Ralat dalaman. Sila cuba sebentar lagi.");
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartView>(EMPTY_CART);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/cart", { cache: "no-store" });
      if (!response.ok) throw await errorFromResponse(response);
      const data = (await response.json()) as CartView;
      setCart(data);
    } catch (error) {
      console.warn("[cart] gagal memuat cart:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch pertama selepas mount (hydration safe).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch async pada mount (pola dikehendaki untuk cart)
    void refresh();
  }, [refresh]);

  const add = useCallback(
    async (variantId: string, quantity = 1) => {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, quantity }),
        cache: "no-store",
      });
      if (!response.ok) throw await errorFromResponse(response);
      const data = (await response.json()) as CartView;
      setCart(data);
      setIsOpen(true);
    },
    [],
  );

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    const response = await fetch(`/api/cart/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
      cache: "no-store",
    });
    if (!response.ok) throw await errorFromResponse(response);
    const data = (await response.json()) as CartView;
    setCart(data);
  }, []);

  const remove = useCallback(async (itemId: string) => {
    const response = await fetch(`/api/cart/${itemId}`, { method: "DELETE", cache: "no-store" });
    if (!response.ok) throw await errorFromResponse(response);
    await refresh();
  }, [refresh]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ ...cart, isOpen, loading, refresh, add, updateQuantity, remove, open, close }),
    [cart, isOpen, loading, refresh, add, updateQuantity, remove, open, close],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart mesti digunakan dalam CartProvider.");
  }
  return context;
}

/**
 * Segerakkan cart bila session auth berubah (login/logout, UX.md Flow C).
 * Selepas login, cart guest sudah di-merge di server (lib/cart-context.ts);
 * komponen ini memastikan badge/drawer dikemas kini.
 */
export function CartSync() {
  const { data } = authClient.useSession();
  const { refresh } = useCart();
  const userId = data?.user?.id ?? null;
  const prevUserId = useRef(userId);

  useEffect(() => {
    if (userId !== prevUserId.current) {
      prevUserId.current = userId;
      void refresh();
    }
  }, [userId, refresh]);

  return null;
}
