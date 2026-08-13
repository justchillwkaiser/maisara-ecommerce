import { NextRequest } from "next/server";

import { getCartContext } from "@/lib/cart-context";
import { ApiError } from "@/lib/errors";
import { cartQuantitySchema } from "@/lib/validations/cart";
import { removeCartItem, updateCartItem } from "@/server/services/cart.service";

/**
 * Cart item API (API.md section 3).
 * PATCH  /api/cart/[itemId] - kemas kini kuantiti { quantity } (cap stok).
 * DELETE /api/cart/[itemId] - buang item, response 204.
 */

interface CartItemRouteContext {
  params: Promise<{ itemId: string }>;
}

export async function PATCH(request: NextRequest, context: CartItemRouteContext) {
  try {
    const { itemId } = await context.params;
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

    const parsed = cartQuantitySchema.safeParse(body);
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

    const cart = await updateCartItem(ctx, itemId, parsed.data.quantity);
    return Response.json(cart);
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }
    console.error("[api/cart/[itemId]] ralat tidak dijangka:", error);
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

export async function DELETE(_request: NextRequest, context: CartItemRouteContext) {
  try {
    const { itemId } = await context.params;
    const ctx = await getCartContext();

    await removeCartItem(ctx, itemId);
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }
    console.error("[api/cart/[itemId]] ralat tidak dijangka:", error);
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
