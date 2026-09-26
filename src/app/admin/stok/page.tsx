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

  const tabs = [
    { href: "/admin/stok", label: "Semua", active: !lowOnlyActive },
    { href: "/admin/stok?lowOnly=true", label: "Stok Rendah", active: lowOnlyActive },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-h3 text-ink">Stok</h2>
        <p className="mt-2 text-body-sm text-cocoa">
          {rows.length} variants {lowOnlyActive ? "(stok rendah)" : "keseluruhan"}
        </p>
      </div>

      {/* Penapis status: rel garis halus, bukan pill. */}
      <div className="flex gap-6 border-b border-line">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={tab.active ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-1 pb-3 text-body-sm transition-colors duration-(--dur-fast)",
              tab.active
                ? "border-ink font-medium text-ink"
                : "border-transparent text-cocoa hover:border-line-strong hover:text-ink",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <AdminStockTable rows={rows} />
    </div>
  );
}
