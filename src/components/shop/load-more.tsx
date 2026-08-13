"use client";

import { Plus } from "@phosphor-icons/react";
import { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import type { ProductSummary } from "@/server/services/product.service";

import { ProductCard } from "./product-card";

interface LoadMoreProps {
  initialItems: ProductSummary[];
  /** Query string tanpa page (cth. "category=tudung&sort=price-asc"). */
  queryString: string;
  nextPage: number;
  hasMore: boolean;
}

function CardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[4/5] w-full rounded-xl bg-surface" />
      <Skeleton className="mt-3 h-5 w-3/4 rounded bg-surface" />
      <Skeleton className="mt-2 h-4 w-1/3 rounded bg-surface" />
    </div>
  );
}

/**
 * "Muat Lagi" (DESIGN.md 8 - Katalog): fetch page seterusnya dari API dan
 * append ke grid, tanpa navigate. State reset bila filter berubah (parent
 * guna `key` pada komponen ini).
 */
export function LoadMore({
  initialItems,
  queryString,
  nextPage,
  hasMore: initialHasMore,
}: LoadMoreProps) {
  const [items, setItems] = useState(initialItems);
  const [nextPageState, setNextPageState] = useState(nextPage);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function loadMore() {
    setLoading(true);
    setError(false);
    try {
      const query = queryString ? `${queryString}&page=${nextPageState}` : `page=${nextPageState}`;
      const response = await fetch(`/api/products?${query}`);
      if (!response.ok) throw new Error("Gagal memuat produk");
      const data: { items: ProductSummary[]; total: number } = await response.json();
      setItems((prev) => [...prev, ...data.items]);
      setNextPageState((prev) => prev + 1);
      setHasMore(items.length + data.items.length < data.total);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-6 xl:grid-cols-3">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        {loading &&
          Array.from({ length: 3 }, (_, i) => <CardSkeleton key={`skeleton-${i}`} />)}
      </div>

      {error && (
        <p className="mt-8 text-center text-sm text-ink-soft">
          Gagal memuat produk.{" "}
          <button
            type="button"
            onClick={loadMore}
            className="font-medium text-gold-deep underline-offset-4 hover:underline"
          >
            Cuba semula
          </button>
        </p>
      )}

      {!error && hasMore && !loading && (
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            className="inline-flex h-11 items-center gap-1.5 rounded-full border border-line bg-card px-7 text-sm font-medium text-ink transition-colors hover:border-gold hover:text-gold-deep"
          >
            <Plus size={15} />
            Muat Lagi
          </button>
        </div>
      )}
    </>
  );
}
