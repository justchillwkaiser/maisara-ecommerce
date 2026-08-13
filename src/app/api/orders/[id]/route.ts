import { ApiError } from "@/lib/errors";
import { requireUser } from "@/server/guards";
import { getOrderDetail } from "@/server/services/order.service";

interface OrderDetailRouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Order detail API (API.md section 4 - GET /api/orders/[id]).
 * Customer hanya order sendiri; admin boleh semua.
 */
export async function GET(_request: Request, context: OrderDetailRouteContext) {
  try {
    const { id } = await context.params;
    const user = await requireUser();

    const order = await getOrderDetail(id, user);
    return Response.json(order);
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }
    console.error("[api/orders/[id]] ralat tidak dijangka:", error);
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
