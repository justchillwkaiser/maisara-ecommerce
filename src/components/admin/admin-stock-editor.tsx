"use client";

import { Check } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface StockRow {
  id: string;
  color: string | null;
  size: string | null;
  sku: string;
  stock: number;
  product: { id: string; name: string; slug: string };
}

/**
 * Jadual stok admin (UX.md section 4 - Stok) dengan edit inline.
 * Pendekatan dipilih: simpan stok melalui PATCH /api/products/[id] dengan
 * senarai variants penuh produk (dari data halaman) - guna service
 * updateProduct yang selaraskan variants ikut SKU. Ini paling robust kerana
 * tiada endpoint baru diperlukan dan konsisten dengan sync SKU service.
 */
export function AdminStockTable({ rows }: { rows: StockRow[] }) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  function setDraft(variantId: string, value: string) {
    setDrafts((current) => ({ ...current, [variantId]: value }));
  }

  async function saveStock(variantId: string) {
    const raw = drafts[variantId];
    if (raw === undefined) return;

    const stock = Number(raw);
    if (!Number.isInteger(stock) || stock < 0) {
      toast.error("Stok mesti nombor bulat 0 atau lebih.");
      return;
    }

    const target = rows.find((row) => row.id === variantId);
    if (!target) return;

    // Payload penuh: semua variants produk ini (sync ikut SKU di service).
    const variants = rows
      .filter((row) => row.product.id === target.product.id)
      .map((row) => ({
        color: row.color ?? "",
        size: row.size ?? "",
        sku: row.sku,
        stock: row.id === variantId ? stock : row.stock,
      }));

    setSavingId(variantId);
    try {
      const response = await fetch(`/api/products/${target.product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variants }),
        cache: "no-store",
      });
      const body = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(
          typeof body?.error?.message === "string" && body.error.message.length > 0
            ? body.error.message
            : "Gagal menyimpan stok.",
        );
        return;
      }

      toast.success("Stok dikemas kini.");
      setDrafts((current) => {
        const next = { ...current };
        delete next[variantId];
        return next;
      });
      router.refresh();
    } catch {
      toast.error("Ralat dalaman. Sila cuba sebentar lagi.");
    } finally {
      setSavingId(null);
    }
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-card px-6 py-14 text-center text-sm text-ink-soft">
        Tiada variants stok rendah. Bagus!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-card">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs tracking-wide text-ink-soft uppercase">
            <th className="px-5 py-3 font-medium">Produk</th>
            <th className="px-5 py-3 font-medium">Variant</th>
            <th className="px-5 py-3 font-medium">SKU</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 text-right font-medium">Stok</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const draft = drafts[row.id];
            const hasDraft = draft !== undefined && draft !== String(row.stock);
            return (
              <tr key={row.id} className="border-b border-line last:border-0">
                <td className="max-w-52 truncate px-5 py-3 font-medium text-ink">
                  {row.product.name}
                </td>
                <td className="px-5 py-3 text-ink-soft">
                  {[row.color, row.size].filter(Boolean).join(" / ") || "Saiz tunggal"}
                </td>
                <td className="px-5 py-3 text-ink-soft">
                  <span className="tabular-nums">{row.sku}</span>
                </td>
                <td className="px-5 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                      row.stock === 0
                        ? "bg-danger/10 text-danger"
                        : row.stock <= 5
                          ? "bg-gold-tint text-gold-deep"
                          : "bg-surface text-ink",
                    )}
                  >
                    {row.stock === 0 ? "Habis" : row.stock <= 5 ? "Stok Rendah" : "Mencukupi"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={draft ?? String(row.stock)}
                      onChange={(event) => setDraft(row.id, event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") void saveStock(row.id);
                      }}
                      aria-label={`Kemas kini stok ${row.sku}`}
                      className="h-9 w-24 text-right tabular-nums"
                    />
                    <button
                      type="button"
                      onClick={() => void saveStock(row.id)}
                      disabled={!hasDraft || savingId === row.id}
                      aria-label="Simpan stok"
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-xl border border-line text-ink transition-colors",
                        hasDraft
                          ? "border-gold bg-gold text-card hover:bg-gold-deep"
                          : "cursor-not-allowed opacity-40",
                      )}
                    >
                      <Check size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
