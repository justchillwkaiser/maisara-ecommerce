import { NextRequest } from "next/server";

import { ApiError } from "@/lib/errors";
import { reviewSchema } from "@/lib/validations/review";
import { requireUser } from "@/server/guards";
import { listProductReviews, submitReview } from "@/server/services/review.service";

/**
 * Review API (API.md section 6).
 * GET  /api/reviews?productId=... - review APPROVED (public).
 * POST /api/reviews - hantar review (requireUser; syarat order COMPLETED).
 */

function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json({ error: { code: error.code, message: error.message } }, { status: error.status });
  }
  console.error("[api/reviews] ralat tidak dijangka:", error);
  return Response.json(
    { error: { code: "INTERNAL_ERROR", message: "Ralat dalaman. Sila cuba sebentar lagi." } },
    { status: 500 },
  );
}

export async function GET(request: NextRequest) {
  try {
    const productId = request.nextUrl.searchParams.get("productId");
    if (!productId) {
      return Response.json(
        { error: { code: "VALIDATION_ERROR", message: "Parameter productId diperlukan." } },
        { status: 400 },
      );
    }
    const items = await listProductReviews(productId);
    return Response.json({ items });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Data ulasan tidak sah.",
            issues: parsed.error.issues,
          },
        },
        { status: 400 },
      );
    }
    const review = await submitReview(user.id, parsed.data);
    return Response.json(review, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
