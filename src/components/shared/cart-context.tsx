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
 *
 * OPTIMISTIC UI (P4 performance): add/updateQuantity/remove mengemas kini
 * state SEGERA (badge, drawer, subtotal) sebelum server mengesahkan.
 * Server kekal source of truth: respons API menggantikan state; jika
 * server menolak (cth. OUT_OF_STOCK / NOT_FOUND), state di-rollback ke
 * snapshot sebelumnya dan error dibaling kepada caller.
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

/**
 * Data produk yang sudah diketahui oleh caller (PDP / kad produk) untuk
 * bina baris cart optimistic serta-merta. id sebenar diberikan oleh server
 * selepas POST; semasa menunggu, item guna id sementara `temp-<variantId>`.
 */
export interface CartItemPreview {
  product: { name: string; slug: string };
  variant: { color: string | null; size: string | null; stock: number };
  unitPrice: string;
  image: string;
}

interface CartContextValue extends CartView {
  isOpen: boolean;
  loading: boolean;
  /** id item (atau `temp-<variantId>`) yang sedang disegerakkan ke server. */
  pendingItemIds: ReadonlySet<string>;
  refresh: () => Promise<void>;
  add: (variantId: string, quantity?: number, preview?: CartItemPreview) => Promise<void>;
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

function toFixed2(value: number): string {
  return value.toFixed(2);
}

/** Kira semula itemCount + subtotal dari senarai item (untuk state optimistic). */
function recalc(cart: CartView): CartView {
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.items.reduce(
    (sum, item) => sum + parseFloat(item.lineTotal),
    0,
  );
  return { ...cart, itemCount, subtotal: toFixed2(subtotal) };
}

/**
 * Gabung item optimistic ke cart semasa:
 * - variantId sudah wujud -> increment quantity (cap stok).
 * - belum wujud -> tambah baris baru dengan id sementara `temp-<variantId>`.
 */
function applyOptimisticAdd(
  cart: CartView,
  variantId: string,
  quantity: number,
  preview: CartItemPreview,
): CartView {
  const existingIndex = cart.items.findIndex((item) => item.variantId === variantId);

  if (existingIndex >= 0) {
    const existing = cart.items[existingIndex];
    const stock = Math.max(existing.variant.stock, 1);
    const newQuantity = Math.min(existing.quantity + quantity, stock);
    const items = cart.items.map((item, index) =>
      index === existingIndex
        ? {
            ...item,
            quantity: newQuantity,
            lineTotal: toFixed2(parseFloat(item.unitPrice) * newQuantity),
          }
        : item,
    );
    return recalc({ ...cart, items });
  }

  const tempItem: CartItemView = {
    id: `temp-${variantId}`,
    variantId,
    quantity,
    product: { id: "", name: preview.product.name, slug: preview.product.slug },
    variant: {
      color: preview.variant.color,
      size: preview.variant.size,
      sku: "",
      stock: preview.variant.stock,
    },
    unitPrice: preview.unitPrice,
    lineTotal: toFixed2(parseFloat(preview.unitPrice) * quantity),
    image: preview.image,
  };

  return recalc({ ...cart, items: [tempItem, ...cart.items] });
}

/** Kemas kini kuantiti satu item (cap stok) + kira semula ringkasan. */
function applyOptimisticQuantity(cart: CartView, itemId: string, quantity: number): CartView {
  const items = cart.items.map((item) => {
    if (item.id !== itemId) return item;
    const stock = Math.max(item.variant.stock, 1);
    const capped = Math.max(0, Math.min(quantity, stock));
    return { ...item, quantity: capped, lineTotal: toFixed2(parseFloat(item.unitPrice) * capped) };
  });
  return recalc({ ...cart, items });
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartView>(EMPTY_CART);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingItemIds, setPendingItemIds] = useState<ReadonlySet<string>>(new Set());

  // Snapshot cart terkini untuk rollback. Dikemas kini selepas commit
  // (useEffect) - bukan semasa render - supaya patuh React 19 lint.
  const cartRef = useRef<CartView>(cart);
  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  const markPending = useCallback((id: string) => {
    setPendingItemIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const clearPending = useCallback((id: string) => {
    setPendingItemIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

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
    async (variantId: string, quantity = 1, preview?: CartItemPreview) => {
      const snapshot = cartRef.current;

      // Optimistic: UI update segera (badge + drawer) tanpa menunggu server.
      if (preview) {
        setCart((prev) => applyOptimisticAdd(prev, variantId, quantity, preview));
        setPendingItemIds((prev) => new Set(prev).add(`temp-${variantId}`));
        setIsOpen(true);
      }

      try {
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variantId, quantity }),
          cache: "no-store",
        });
        if (!response.ok) throw await errorFromResponse(response);
        // Server = source of truth (id sebenar, cap stok, harga terkini).
        const data = (await response.json()) as CartView;
        setCart(data);
        if (!preview) setIsOpen(true);
      } catch (error) {
        if (preview) setCart(snapshot); // rollback kepada state sebelum add
        throw error;
      } finally {
        setPendingItemIds((prev) => {
          const next = new Set(prev);
          next.delete(`temp-${variantId}`);
          return next;
        });
      }
    },
    [],
  );

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    const snapshot = cartRef.current;

    // Optimistic: stepper respond segera; server sahkan cap stok.
    setCart(applyOptimisticQuantity(cartRef.current, itemId, quantity));
    markPending(itemId);

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
        cache: "no-store",
      });
      if (!response.ok) throw await errorFromResponse(response);
      const data = (await response.json()) as CartView;
      setCart(data);
    } catch (error) {
      setCart(snapshot); // rollback
      throw error;
    } finally {
      clearPending(itemId);
    }
  }, [markPending, clearPending]);

  const remove = useCallback(
    async (itemId: string) => {
      const snapshot = cartRef.current;

      // Optimistic: item hilang serta-merta; server sahkan pemadaman.
      setCart((prev) => recalc({ ...prev, items: prev.items.filter((item) => item.id !== itemId) }));
      markPending(itemId);

      try {
        const response = await fetch(`/api/cart/${itemId}`, { method: "DELETE", cache: "no-store" });
        if (!response.ok) throw await errorFromResponse(response);
        // Server balas 204 tanpa body; state optimistic sudah betul.
      } catch (error) {
        setCart(snapshot); // rollback
        throw error;
      } finally {
        clearPending(itemId);
      }
    },
    [markPending, clearPending],
  );

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({
      ...cart,
      isOpen,
      loading,
      pendingItemIds,
      refresh,
      add,
      updateQuantity,
      remove,
      open,
      close,
    }),
    [cart, isOpen, loading, pendingItemIds, refresh, add, updateQuantity, remove, open, close],
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
