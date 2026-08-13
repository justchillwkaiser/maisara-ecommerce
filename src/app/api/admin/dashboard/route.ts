import { ApiError } from "@/lib/errors";
import { requireAdmin } from "@/server/guards";
import { getDashboardStats } from "@/server/services/dashboard.service";

/**
 * GET /api/admin/dashboard (API.md section 7 - Auth: ADMIN).
 * Stats ringkas + recentOrders (5) + lowStockItems (stok <= 5).
 */
export async function GET() {
  try {
    await requireAdmin();
    const data = await getDashboardStats();
    return Response.json(data);
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }
    console.error("[api/admin/dashboard] ralat tidak dijangka:", error);
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
