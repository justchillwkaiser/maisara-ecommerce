import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading PDP: cerminan susun atur sebenar (galeri 4:5 di 7 kolum, maklumat di
 * 5 kolum) dalam tone bone, supaya peralihan kekal tenang dan tiada herotan
 * susun atur apabila data produk tiba.
 */
export default function ProdukLoading() {
  return (
    <div role="status" aria-label="Memuatkan butiran produk" className="shell">
      {/* Jejak navigasi */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 py-6">
        <Skeleton className="h-3 w-14 rounded-none" />
        <Skeleton className="h-3 w-16 rounded-none" />
        <Skeleton className="h-3 w-20 rounded-none" />
      </div>

      <div className="grid-12 items-start gap-y-12 pt-6 pb-(--space-section)">
        {/* Galeri 4:5 (7 kolum) */}
        <div className="col-span-12 flex flex-col gap-4 sm:flex-row lg:col-span-7">
          <div className="order-2 flex gap-3 sm:order-1 sm:w-20 sm:shrink-0 sm:flex-col">
            {[0, 1, 2].map((thumb) => (
              <Skeleton
                key={thumb}
                className="aspect-[4/5] w-16 rounded-xs sm:w-full"
              />
            ))}
          </div>
          <Skeleton className="order-1 aspect-[4/5] w-full rounded-sm sm:order-2 sm:flex-1" />
        </div>

        {/* Maklumat (5 kolum) */}
        <div className="col-span-12 lg:col-span-5">
          <Skeleton className="h-3 w-20 rounded-none" />
          <Skeleton className="mt-4 h-9 w-4/5 rounded-sm" />
          <Skeleton className="mt-5 h-5 w-24 rounded-none" />
          <Skeleton className="mt-6 h-4 w-full rounded-none" />
          <Skeleton className="mt-2 h-4 w-11/12 rounded-none" />

          <div className="mt-9 flex flex-wrap gap-2">
            {[0, 1, 2].map((option) => (
              <Skeleton key={option} className="h-11 w-24 rounded-xs" />
            ))}
          </div>

          <div className="mt-7 flex items-center justify-between gap-4 border-t border-line pt-6">
            <Skeleton className="h-11 w-36 rounded-xs" />
            <Skeleton className="h-3 w-16 rounded-none" />
          </div>

          <Skeleton className="mt-7 h-13 w-full rounded-xs" />

          <div className="mt-9 flex items-center gap-4 border-t border-line pt-6">
            <Skeleton className="size-11 rounded-xs" />
            <Skeleton className="h-3 w-40 rounded-none" />
          </div>

          <div className="mt-9 divide-y divide-line border-t border-line">
            {[0, 1, 2, 3].map((row) => (
              <Skeleton key={row} className="h-12 w-full rounded-none" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
