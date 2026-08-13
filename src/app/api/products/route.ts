import { NextRequest } from "next/server";

import { ApiError } from "@/lib/errors";
import { productQuerySchema } from "@/lib/validations/product";
import { listProducts } from "@/server/services/product.service";

/**
 * GET /api/products (API.md section 2).
 * Senarai produk dengan filter: category, search, minPrice, maxPrice,
 * color, size, sort, page, pageSize.
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
