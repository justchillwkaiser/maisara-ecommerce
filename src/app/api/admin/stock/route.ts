import { NextRequest } from "next/server";

import { ApiError } from "@/lib/errors";
import { requireAdmin } from "@/server/guards";
import { listStockVariants } from "@/server/services/dashboard.service";

/**
 * GET /api/admin/stock (API.md section 7 - Auth: ADMIN).
 * Senarai semua variants stok. Query `?lowOnly=true` untuk stok <= 5 sahaja.
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const lowOnly = request.nextUrl.searchParams.get("lowOnly") === "true";
    const items = await listStockVariants(lowOnly);
    return Response.json({ items });
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }
    console.error("[api/admin/stock] ralat tidak dijangka:", error);
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
