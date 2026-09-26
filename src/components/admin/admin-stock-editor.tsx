"use client";

import { Check } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      <p className="border border-line bg-paper-lift px-5 py-12 text-center text-body-sm text-cocoa">
        Tiada variant dengan stok rendah.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto border border-line bg-paper-lift">
      <table className="w-full min-w-[720px] text-left text-body-sm">
        <thead>
          <tr className="border-b border-line">
            <th className="meta-label px-5 py-3 text-cocoa">Produk</th>
            <th className="meta-label px-5 py-3 text-cocoa">Variant</th>
            <th className="meta-label px-5 py-3 text-cocoa">SKU</th>
            <th className="meta-label px-5 py-3 text-cocoa">Status</th>
            <th className="meta-label px-5 py-3 text-right text-cocoa">Stok</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const draft = drafts[row.id];
            const hasDraft = draft !== undefined && draft !== String(row.stock);
            return (
              <tr key={row.id} className="border-b border-line last:border-0">
                <td className="max-w-52 truncate px-5 py-3 text-ink">
                  {row.product.name}
                </td>
                <td className="px-5 py-3 text-cocoa">
                  {[row.color, row.size].filter(Boolean).join(" / ") || "Saiz tunggal"}
                </td>
                <td className="px-5 py-3 font-mono text-meta text-cocoa">
                  <span className="tabular-nums">{row.sku}</span>
                </td>
                <td className="px-5 py-3">
                  <Badge
                    variant={
                      row.stock === 0 ? "danger" : row.stock <= 5 ? "clay" : "outline"
                    }
                  >
                    {row.stock === 0 ? "Habis" : row.stock <= 5 ? "Stok Rendah" : "Mencukupi"}
                  </Badge>
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
                      className="h-9 w-24 rounded-xs text-right tabular-nums focus-visible:ring-2"
                    />
                    <Button
                      type="button"
                      size="icon-sm"
                      variant={hasDraft ? "default" : "outline"}
                      onClick={() => void saveStock(row.id)}
                      disabled={!hasDraft || savingId === row.id}
                      aria-label="Simpan stok"
                    >
                      <Check />
                    </Button>
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
