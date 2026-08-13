import { NextRequest } from "next/server";

import { ApiError } from "@/lib/errors";
import { checkoutSchema } from "@/lib/validations/order";
import { requireUser } from "@/server/guards";
import { createOrder, listUserOrders } from "@/server/services/order.service";

/**
 * Order API (API.md section 4).
 * POST /api/orders - cipta order dari cart user (Auth: CUSTOMER).
 * GET  /api/orders - sejarah order user sendiri.
 */

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: { code: "VALIDATION_ERROR", message: "Data checkout tidak sah." } },
        { status: 400 },
      );
    }

    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Data checkout tidak sah.",
            issues: parsed.error.issues,
          },
        },
        { status: 400 },
      );
    }

    const result = await createOrder(user.id, parsed.data);
    return Response.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }
    console.error("[api/orders] ralat tidak dijangka:", error);
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

export async function GET() {
  try {
    const user = await requireUser();
    const orders = await listUserOrders(user.id);
    return Response.json(orders);
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }
    console.error("[api/orders] ralat tidak dijangka:", error);
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
