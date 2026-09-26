import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state /koleksi: rangka yang meniru grid sebenar (4/3/2 kolum,
 * jubin 4:5, permukaan bone) supaya peralihan ke kandungan tidak melompat.
 * Tiada spinner dan tiada blok kelabu - hanya bentuk yang sama seperti hasil.
 */

/** Mesti sepadan dengan konstanta grid dalam koleksi-view/load-more. */
const GRID_CLASSES =
  "grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-5";

function GridTileSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-4/5 w-full rounded-sm" />
      <Skeleton className="mt-4 h-5 w-3/4 rounded-xs" />
      <Skeleton className="mt-2 h-4 w-1/3 rounded-xs" />
    </div>
  );
}

function FilterGroupSkeleton({ rows }: { rows: number }) {
  return (
    <div>
      <Skeleton className="h-4 w-24 rounded-xs" />
      <div className="mt-3 flex flex-col gap-2">
        {Array.from({ length: rows }, (_, index) => (
          <Skeleton key={index} className="h-6 w-full rounded-xs" />
        ))}
      </div>
    </div>
  );
}

export default function KoleksiLoading() {
  return (
    <div className="shell py-(--space-section)">
      <header className="border-b border-line pb-8 md:pb-10">
        <Skeleton className="h-4 w-28 rounded-xs" />
        <Skeleton className="mt-4 h-12 w-64 rounded-xs md:h-14" />
        <Skeleton className="mt-5 h-5 w-full max-w-xl rounded-xs" />
        <Skeleton className="mt-8 h-11 w-full rounded-xs sm:w-72" />
      </header>

      <div className="grid-12 mt-10 gap-y-10 md:mt-14">
        <aside className="col-span-12 hidden lg:col-span-3 lg:block">
          <div className="flex flex-col gap-6">
            <FilterGroupSkeleton rows={6} />
            <FilterGroupSkeleton rows={2} />
            <FilterGroupSkeleton rows={4} />
          </div>
        </aside>

        <div className="col-span-12 lg:col-span-9">
          <div className="mb-6 flex items-center justify-between gap-3">
            <Skeleton className="h-11 w-32 rounded-xs" />
            <Skeleton className="ml-auto h-11 w-44 rounded-xs" />
          </div>

          <div className={GRID_CLASSES}>
            {Array.from({ length: 8 }, (_, index) => (
              <GridTileSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}