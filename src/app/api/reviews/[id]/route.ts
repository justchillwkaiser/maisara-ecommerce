import { NextRequest } from "next/server";

import { ApiError } from "@/lib/errors";
import { reviewStatusSchema } from "@/lib/validations/review";
import { requireAdmin } from "@/server/guards";
import { updateReviewStatus } from "@/server/services/review.service";

/**
 * PATCH /api/reviews/[id] - moderasi admin (API.md section 6).
 * Body: { status: "APPROVED" | "HIDDEN" }.
 */

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const parsed = reviewStatusSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Status ulasan tidak sah.",
            issues: parsed.error.issues,
          },
        },
        { status: 400 },
      );
    }
    await updateReviewStatus(id, parsed.data.status);
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }
    console.error("[api/reviews/[id]] ralat tidak dijangka:", error);
    return Response.json(
      { error: { code: "INTERNAL_ERROR", message: "Ralat dalaman. Sila cuba sebentar lagi." } },
      { status: 500 },
    );
  }
}
