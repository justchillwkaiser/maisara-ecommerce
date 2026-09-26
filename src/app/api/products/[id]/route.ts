import { NextRequest } from "next/server";

import { ApiError } from "@/lib/errors";
import { fallbackGetProductDetail } from "@/lib/katalog-fallback";
import { productUpdateSchema } from "@/lib/validations/product";
import { requireAdmin } from "@/server/guards";
import {
  deactivateProduct,
  getProductById,
  updateProduct,
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

    const product = await getProductById(id);
    if (!product) {
      throw new ApiError("NOT_FOUND", "Produk tidak ditemui.", 404);
    }
    return Response.json(product);
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

/**
 * PATCH /api/products/[id] (API.md section 7 - Auth: ADMIN).
 * Update asas + variants (replace list, sync ikut SKU).
 */
export async function PATCH(request: NextRequest, context: ProductDetailRouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: { code: "VALIDATION_ERROR", message: "Data produk tidak sah." } },
        { status: 400 },
      );
    }

    const parsed = productUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Data produk tidak sah.",
            issues: parsed.error.issues,
          },
        },
        { status: 400 },
      );
    }

    await updateProduct(id, parsed.data);
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
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

/**
 * DELETE /api/products/[id] (API.md section 7 - Auth: ADMIN).
 * Soft delete: set isActive=false (JANGAN hard delete - produk mungkin
 * dirujuk OrderItem).
 */
export async function DELETE(_request: Request, context: ProductDetailRouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    await deactivateProduct(id);
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
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
