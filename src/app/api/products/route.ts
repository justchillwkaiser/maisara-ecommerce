import { NextRequest } from "next/server";

import { ApiError } from "@/lib/errors";
import {
  productCreateSchema,
  productQuerySchema,
} from "@/lib/validations/product";
import { requireAdmin } from "@/server/guards";
import { createProduct, listProducts } from "@/server/services/product.service";

/**
 * Produk API (API.md section 2 & 7).
 * GET  /api/products - senarai produk aktif dengan filter (public).
 * POST /api/products - cipta produk + variants (Auth: ADMIN).
 *   Slug auto-generate dari name jika kosong; SKU duplicate -> 409 SKU_EXISTS.
 */

export async function GET(request: NextRequest) {
  try {
    const raw = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = productQuerySchema.safeParse(raw);

    if (!parsed.success) {
      return Response.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Parameter carian tidak sah.",
            issues: parsed.error.issues,
          },
        },
        { status: 400 },
      );
    }

    const result = await listProducts(parsed.data);
    return Response.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }
    console.error("[api/products] ralat tidak dijangka:", error);
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
    await requireAdmin();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: { code: "VALIDATION_ERROR", message: "Data produk tidak sah." } },
        { status: 400 },
      );
    }

    const parsed = productCreateSchema.safeParse(body);
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

    const product = await createProduct(parsed.data);
    return Response.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }
    console.error("[api/products] ralat tidak dijangka:", error);
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
