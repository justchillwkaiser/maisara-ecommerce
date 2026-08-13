import { ApiError } from "@/lib/errors";
import { requireUser } from "@/server/guards";
import { removeFromWishlist } from "@/server/services/wishlist.service";

interface WishlistItemRouteContext {
  params: Promise<{ productId: string }>;
}

/**
 * Wishlist item API (API.md section 7).
 * DELETE /api/wishlist/[productId] - buang produk dari wishlist (Auth: CUSTOMER).
 */
export async function DELETE(_request: Request, context: WishlistItemRouteContext) {
  try {
    const { productId } = await context.params;
    const user = await requireUser();

    await removeFromWishlist(user.id, productId);
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }
    console.error("[api/wishlist/[productId]] ralat tidak dijangka:", error);
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
