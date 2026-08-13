import { NextRequest } from "next/server";

import { ApiError } from "@/lib/errors";
import { wishlistAddSchema } from "@/lib/validations/wishlist";
import { requireUser } from "@/server/guards";
import { addToWishlist, getWishlist } from "@/server/services/wishlist.service";

/**
 * Wishlist API (API.md section 7, UX.md Flow D).
 * GET  /api/wishlist - senarai wishlist user (Auth: CUSTOMER).
 * POST /api/wishlist - tambah produk (Auth: CUSTOMER).
 */

export async function GET() {
  try {
    const user = await requireUser();
    const items = await getWishlist(user.id);
    return Response.json({ items });
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }
    console.error("[api/wishlist] ralat tidak dijangka:", error);
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
    const user = await requireUser();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: { code: "VALIDATION_ERROR", message: "Data wishlist tidak sah." } },
        { status: 400 },
      );
    }

    const parsed = wishlistAddSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Data wishlist tidak sah.",
            issues: parsed.error.issues,
          },
        },
        { status: 400 },
      );
    }

    await addToWishlist(user.id, parsed.data.productId);
    return Response.json({ ok: true }, { status: 200 });
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }
    console.error("[api/wishlist] ralat tidak dijangka:", error);
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
