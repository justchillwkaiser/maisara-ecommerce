import { ApiError } from "@/lib/errors";
import { requireUser } from "@/server/guards";
import { initiatePayment } from "@/server/services/payment.service";

interface PaymentRouteContext {
  params: Promise<{ orderId: string }>;
}

/**
 * Payment API (API.md section 5 - POST /api/payments/[orderId]).
 * Initiate semula payment untuk order (guna bila payment gagal / cuba semula).
 */
export async function POST(_request: Request, context: PaymentRouteContext) {
  try {
    const { orderId } = await context.params;
    const user = await requireUser();

    const result = await initiatePayment(orderId, user.id);
    return Response.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }
    console.error("[api/payments/[orderId]] ralat tidak dijangka:", error);
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
