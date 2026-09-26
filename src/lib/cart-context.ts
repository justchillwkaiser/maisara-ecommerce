import { cookies, headers } from "next/headers";

import { auth } from "@/lib/auth";
import { mergeCart } from "@/server/services/cart.service";

/**
 * Context cart untuk request semasa (API.md section 3).
 * - Guest: cookie `cart-session` (httpOnly, 30 hari) -> sessionId.
 * - User berdaftar: userId dari Better Auth session -> userId.
 * - Merge lazy (UX.md Flow C): bila kedua-dua userId + sessionId wujud
 *   (guest log masuk), cart guest digabung ke user dan cookie dibuang.
 */

export interface CartContext {
  sessionId: string | null;
  userId: string | null;
}

export const CART_COOKIE = "cart-session";
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 hari

/**
 * Cuba tulis cookie `cart-session`.
 *
 * Next.js hanya membenarkan cookie diubah dalam Server Action atau Route
 * Handler. `getCartContext` juga dipanggil daripada Server Component (cth.
 * halaman checkout), dan di situ cubaan menulis akan membaling ralat.
 * Penulisan cookie ialah pembersihan sokongan, bukan logik perniagaan:
 * kegagalannya tidak boleh dilaporkan sebagai kegagalan merge, dan ia akan
 * berjaya pada panggilan Route Handler seterusnya (`/api/cart`).
 */
function tryWriteCookie(mutate: () => void): boolean {
  try {
    mutate();
    return true;
  } catch {
    return false;
  }
}

export async function getCartContext(): Promise<CartContext> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(CART_COOKIE)?.value ?? null;

  let userId: string | null = null;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    userId = session?.user?.id ?? null;
  } catch (error) {
    console.error("[cart-context] gagal membaca session auth:", error);
  }

  // Merge lazy (UX.md Flow C): gabung cart guest ke user. Cookie dibuang
  // selepas merge berjaya supaya merge tidak berulang. Jika penulisan cookie
  // tidak dibenarkan pada konteks ini, merge tetap dikira berjaya - cookie
  // akan dibersihkan oleh panggilan Route Handler seterusnya.
  if (userId && sessionId) {
    try {
      await mergeCart(userId, sessionId);
      if (tryWriteCookie(() => cookieStore.delete(CART_COOKIE))) {
        sessionId = null;
      }
    } catch (error) {
      console.error("[cart-context] merge cart gagal, cuba semula kemudian:", error);
    }
  }

  // Guest tulen tanpa cookie: cipta token baru + set cookie.
  if (!userId && !sessionId) {
    sessionId = crypto.randomUUID();
    tryWriteCookie(() =>
      cookieStore.set(CART_COOKIE, sessionId as string, {
        httpOnly: true,
        path: "/",
        maxAge: CART_COOKIE_MAX_AGE,
        sameSite: "lax",
      }),
    );
  }

  return { sessionId, userId };
}
