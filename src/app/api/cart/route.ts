import { NextRequest } from "next/server";

import { getCartContext } from "@/lib/cart-context";
import { ApiError } from "@/lib/errors";
import { cartItemSchema } from "@/lib/validations/cart";
import { addToCart, getCart } from "@/server/services/cart.service";

/**
 * Cart API (API.md section 3).
 * GET  /api/cart - senarai item + subtotal + itemCount (guest cookie atau user).
 * POST /api/cart - tambah item { variantId, quantity } (cap stok).
 */

export async function GET() {
  try {
    const ctx = await getCartContext();
    const cart = await getCart(ctx);
    return Response.json(cart);
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }
    console.error("[api/cart] ralat tidak dijangka:", error);
    return Response.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Ralat dalaman. Sila cuba sebentar lagi.",
        },
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await getCartContext();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: { code: "VALIDATION_ERROR", message: "Data cart tidak sah." } },
        { status: 400 },
      );
    }

    const parsed = cartItemSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Data cart tidak sah.",
            issues: parsed.error.issues,
          },
        },
        { status: 400 },
      );
    }

    const cart = await addToCart(ctx, parsed.data);
    return Response.json(cart);
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }
    console.error("[api/cart] ralat tidak dijangka:", error);
    return Response.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Ralat dalaman. Sila cuba sebentar lagi.",
        },
      },
      { status: 500 },
    );
  }
}
