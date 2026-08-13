"use client";

import { MagnifyingGlass, Plus } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRM } from "@/lib/format";

export interface AdminProductRow {
  id: string;
  name: string;
  slug: string;
  price: string;
  image: string;
  category: string;
  minStock: number;
  variantCount: number;
  isActive: boolean;
  featured: boolean;
}

/**
 * Jadual produk admin (DESIGN.md 8 - Admin Panel).
 * Search ringkas klien (nama/kategori), imej kecil 40px, status aktif +
 * featured badge, stok minimum variants.
 */
export function AdminProductTable({ products }: { products: AdminProductRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        product.slug.includes(q),
    );
  }, [products, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <MagnifyingGlass
            size={16}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-soft"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari produk..."
            aria-label="Cari produk"
            className="pl-9"
          />
        </div>
        <Button asChild>
          <Link href="/admin/produk/baru">
            <Plus />
            Tambah Produk
          </Link>
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card px-6 py-14 text-center text-sm text-ink-soft">
          {products.length === 0
            ? "Tiada produk lagi. Tambah produk pertama anda."
            : "Tiada produk sepadan dengan carian."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs tracking-wide text-ink-soft uppercase">
                <th className="px-5 py-3 font-medium">Produk</th>
                <th className="px-5 py-3 font-medium">Harga</th>
                <th className="px-5 py-3 font-medium">Kategori</th>
                <th className="px-5 py-3 font-medium">Stok Min</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-line bg-surface">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/produk/${product.id}`}
                          className="block max-w-56 truncate font-medium text-ink hover:text-gold"
                        >
                          {product.name}
                        </Link>
                        <p className="text-xs text-ink-soft">
                          {product.variantCount} variant
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-medium tabular-nums text-ink">
                    {formatRM(product.price)}
                  </td>
                  <td className="px-5 py-3 text-ink-soft">{product.category}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium tabular-nums ${
                        product.minStock === 0
                          ? "bg-danger/10 text-danger"
                          : product.minStock <= 5
                            ? "bg-gold-tint text-gold-deep"
                            : "bg-surface text-ink"
                      }`}
                    >
                      {product.minStock}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {product.isActive ? (
                        <Badge variant="success">Aktif</Badge>
                      ) : (
                        <Badge variant="secondary">Tidak Aktif</Badge>
                      )}
                      {product.featured && <Badge variant="default">Featured</Badge>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
