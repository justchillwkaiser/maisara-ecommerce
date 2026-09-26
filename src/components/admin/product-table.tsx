"use client";

import { MagnifyingGlass, Plus } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImageFrame } from "@/components/ui/image-frame";
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
 * featured badge, stok minimum variants. Padat: garis halus + label mono.
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
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-cocoa"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari produk..."
            aria-label="Cari produk"
            className="h-10 rounded-xs pl-9"
          />
        </div>
        <Button asChild size="sm">
          <Link href="/admin/produk/baru">
            <Plus />
            Tambah Produk
          </Link>
        </Button>
      </div>

      {filtered.length === 0 ? (
        <p className="border border-line bg-paper-lift px-5 py-12 text-center text-body-sm text-cocoa">
          {products.length === 0
            ? "Tiada produk lagi. Tambah produk pertama anda."
            : "Tiada produk sepadan dengan carian."}
        </p>
      ) : (
        <div className="overflow-x-auto border border-line bg-paper-lift">
          <table className="w-full min-w-[760px] text-left text-body-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="meta-label px-5 py-3 text-cocoa">Produk</th>
                <th className="meta-label px-5 py-3 text-cocoa">Harga</th>
                <th className="meta-label px-5 py-3 text-cocoa">Kategori</th>
                <th className="meta-label px-5 py-3 text-cocoa">Stok Min</th>
                <th className="meta-label px-5 py-3 text-cocoa">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <ImageFrame
                        ratio="1 / 1"
                        rounded="xs"
                        className="size-10 shrink-0 border border-line"
                      >
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : null}
                      </ImageFrame>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/produk/${product.id}`}
                          className="block max-w-56 truncate text-ink underline-offset-4 hover:underline"
                        >
                          {product.name}
                        </Link>
                        <p className="mt-0.5 font-mono text-meta text-cocoa">
                          {product.variantCount} variant
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 tabular-nums text-ink">
                    {formatRM(product.price)}
                  </td>
                  <td className="px-5 py-3 text-cocoa">{product.category}</td>
                  <td className="px-5 py-3">
                    <Badge
                      variant={
                        product.minStock === 0
                          ? "danger"
                          : product.minStock <= 5
                            ? "clay"
                            : "outline"
                      }
                      className="tabular-nums"
                    >
                      {product.minStock}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant={product.isActive ? "olive" : "muted"}>
                        {product.isActive ? "Aktif" : "Tidak Aktif"}
                      </Badge>
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
