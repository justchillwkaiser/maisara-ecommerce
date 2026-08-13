import { NextRequest } from "next/server";
import { z } from "zod";

import { ApiError } from "@/lib/errors";
import { requireAdmin } from "@/server/guards";
import { updateOrderStatus } from "@/server/services/order.service";

const orderStatusSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"], {
    message: "Status order tidak sah.",
  }),
});

/**
 * PATCH /api/orders/[id]/status (API.md section 4 - Auth: ADMIN).
 * Body: { "status": "PROCESSING" }. Transition divalidasi service;
 * CANCELLED dari PENDING/PROCESSING pulangkan stok variants.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: { code: "VALIDATION_ERROR", message: "Data status tidak sah." } },
        { status: 400 },
      );
    }

    const parsed = orderStatusSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Status order tidak sah.",
            issues: parsed.error.issues,
          },
        },
        { status: 400 },
      );
    }

    await updateOrderStatus(id, parsed.data.status);
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }
    console.error("[api/orders/[id]/status] ralat tidak dijangka:", error);
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
