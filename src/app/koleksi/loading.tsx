import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state /koleksi (P4 performance): skeleton segera semasa server
 * fetch produk + filter options, supaya navigation terasa responsif
 * walaupun DB lambat. Gaya ikut DESIGN.md (grid 2/3 kolum, 4:5 imej).
 */
export default function KoleksiLoading() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-12 md:px-8 md:py-20">
      <Skeleton className="h-10 w-56 rounded bg-surface md:h-12" />
      <Skeleton className="mt-5 h-4 w-24 rounded bg-surface" />

      <div className="mt-10 grid gap-10 lg:grid-cols-[260px,1fr]">
        <aside className="hidden lg:block">
          <div className="space-y-3">
            <Skeleton className="h-5 w-28 rounded bg-surface" />
            <Skeleton className="h-4 w-24 rounded bg-surface" />
            <Skeleton className="h-4 w-20 rounded bg-surface" />
            <Skeleton className="h-4 w-28 rounded bg-surface" />
          </div>
        </aside>

        <div>
          <div className="mb-6 flex justify-end">
            <Skeleton className="h-10 w-36 rounded-full bg-surface" />
          </div>
          <div className="grid grid-cols-2 gap-6 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[4/5] w-full rounded-xl bg-surface" />
                <Skeleton className="mt-3 h-5 w-3/4 rounded bg-surface" />
                <Skeleton className="mt-2 h-4 w-1/3 rounded bg-surface" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
