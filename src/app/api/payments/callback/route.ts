import { NextRequest } from "next/server";

import { ApiError } from "@/lib/errors";
import { paymentCallbackSchema } from "@/lib/validations/order";
import { handlePaymentCallback } from "@/server/services/payment.service";

/**
 * Payment callback API (API.md section 5 - POST /api/payments/callback).
 * Callback dari provider mock (halaman simulasi FPX). Idempotent.
 * Body: { reference, status: "paid" | "failed" }.
 */
export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: { code: "VALIDATION_ERROR", message: "Data callback tidak sah." } },
        { status: 400 },
      );
    }

    const parsed = paymentCallbackSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Data callback tidak sah.",
            issues: parsed.error.issues,
          },
        },
        { status: 400 },
      );
    }

    const result = await handlePaymentCallback(parsed.data);
    return Response.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }
    console.error("[api/payments/callback] ralat tidak dijangka:", error);
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
