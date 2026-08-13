import { ApiError } from "@/lib/errors";
import { db } from "@/lib/db";
import { fallbackGetProductDetail } from "@/lib/katalog-fallback";
import {
  PRODUCT_DETAIL_INCLUDE,
  toProductDetail,
} from "@/server/services/product.service";

interface ProductDetailRouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/products/[id] (API.md section 2).
 * Detail produk penuh: category, variants (dengan stock per variant),
 * reviews APPROVED, avgRating, reviewCount. 404 NOT_FOUND jika tiada.
 * Fallback ke data seed bila DB tidak dapat dicapai (corak sama seperti
 * halaman koleksi), supaya demo storefront kekal berfungsi.
 */
export async function GET(_request: Request, context: ProductDetailRouteContext) {
  try {
    const { id } = await context.params;

    const product = await db.product.findUnique({
      where: { id },
      include: PRODUCT_DETAIL_INCLUDE,
    });

    if (!product || !product.isActive) {
      throw new ApiError("NOT_FOUND", "Produk tidak ditemui.", 404);
    }

    return Response.json(toProductDetail(product));
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }

    // DB offline: cuba data fallback seed (id fallback = slug).
    try {
      const { id } = await context.params;
      const fallback = fallbackGetProductDetail(id);
      if (fallback) {
        return Response.json(fallback);
      }
      return Response.json(
        { error: { code: "NOT_FOUND", message: "Produk tidak ditemui." } },
        { status: 404 },
      );
    } catch {
      // terus ke INTERNAL_ERROR di bawah
    }

    console.error("[api/products/[id]] ralat tidak dijangka:", error);
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
