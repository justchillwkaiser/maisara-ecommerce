import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state PDP (P4 performance): skeleton galeri + info segera semasa
 * server fetch produk, supaya navigation terasa responsif.
 */
export default function ProdukLoading() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 md:px-8">
      <div className="grid gap-10 py-12 md:py-20 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <Skeleton className="aspect-[4/5] w-full rounded-xl bg-surface" />
        </div>
        <div className="lg:col-span-5">
          <Skeleton className="h-4 w-20 rounded bg-surface" />
          <Skeleton className="mt-3 h-10 w-3/4 rounded bg-surface" />
          <Skeleton className="mt-3 h-6 w-28 rounded bg-surface" />
          <Skeleton className="mt-6 h-4 w-full rounded bg-surface" />
          <Skeleton className="mt-2 h-4 w-11/12 rounded bg-surface" />
          <Skeleton className="mt-8 h-12 w-full rounded-full bg-surface" />
        </div>
      </div>
    </div>
  );
}
