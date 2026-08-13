import Link from "next/link";

import { AdminStockTable } from "@/components/admin/admin-stock-editor";
import { listStockVariants } from "@/server/services/dashboard.service";
import { cn } from "@/lib/utils";

interface AdminStokPageProps {
  searchParams: Promise<{ lowOnly?: string }>;
}

/**
 * Pengurusan stok admin (UX.md section 4 - Stok, DESIGN.md 8).
 * Jadual semua variants; toggle ?lowOnly=true untuk stok <= 5 sahaja.
 * Edit stok inline (PATCH /api/products/[id] dengan variants penuh).
 */
export default async function AdminStokPage({ searchParams }: AdminStokPageProps) {
  const { lowOnly } = await searchParams;
  const lowOnlyActive = lowOnly === "true";
  const rows = await listStockVariants(lowOnlyActive);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-medium text-ink">Stok</h2>
          <p className="mt-1 text-sm text-ink-soft">
            {rows.length} variants {lowOnlyActive ? "(stok rendah)" : "keseluruhan"}
          </p>
        </div>
        <div className="flex gap-1 rounded-full border border-line bg-card p-1">
          <Link
            href="/admin/stok"
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              !lowOnlyActive ? "bg-gold-tint text-gold-deep" : "text-ink-soft hover:text-ink",
            )}
          >
            Semua
          </Link>
          <Link
            href="/admin/stok?lowOnly=true"
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              lowOnlyActive ? "bg-gold-tint text-gold-deep" : "text-ink-soft hover:text-ink",
            )}
          >
            Stok Rendah
          </Link>
        </div>
      </div>

      <AdminStockTable rows={rows} />
    </div>
  );
}
