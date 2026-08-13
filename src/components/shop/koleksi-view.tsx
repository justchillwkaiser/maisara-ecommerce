import Link from "next/link";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";

import { FilterDrawer } from "@/components/shop/filter-drawer";
import {
  FilterSidebar,
  type SidebarParams,
} from "@/components/shop/filter-sidebar";
import { LoadMore } from "@/components/shop/load-more";
import { SortSelect } from "@/components/shop/sort-select";
import { getCategories } from "@/lib/categories";
import { db } from "@/lib/db";
import {
  fallbackListProducts,
  FALLBACK_COLORS,
  FALLBACK_SIZES,
} from "@/lib/katalog-fallback";
import { productQuerySchema, type ProductQuery } from "@/lib/validations/product";
import { listProducts, type ProductListResult } from "@/server/services/product.service";

export type KoleksiSearchParams = Record<string, string | string[] | undefined>;

interface KoleksiViewProps {
  searchParams: Promise<KoleksiSearchParams>;
  /** Dari route /koleksi/[category] (path), bukan query string. */
  categoryParam?: string;
}

/**
 * Data warna/saiz untuk sidebar: distinct dari variants produk aktif
 * (dalam kategori aktif jika ada). Fallback = data seed bila DB offline.
 */
async function getFilterOptions(categorySlug?: string) {
  try {
    const categoryWhere = categorySlug ? { category: { slug: categorySlug } } : {};
    const [colorRows, sizeRows] = await Promise.all([
      db.productVariant.findMany({
        where: { product: { isActive: true, ...categoryWhere } },
        distinct: ["color"],
        select: { color: true },
      }),
      db.productVariant.findMany({
        where: { product: { isActive: true, ...categoryWhere } },
        distinct: ["size"],
        select: { size: true },
      }),
    ]);
    const colors = [
      ...new Set(colorRows.map((row) => row.color).filter((c): c is string => Boolean(c))),
    ].sort((a, b) => a.localeCompare(b));
    const sizes = [
      ...new Set(sizeRows.map((row) => row.size).filter(Boolean)),
    ].sort() as string[];
    return { colors, sizes };
  } catch {
    return { colors: FALLBACK_COLORS, sizes: FALLBACK_SIZES };
  }
}

/** Halaman koleksi (DESIGN.md 8 - Katalog). Dikongsi /koleksi dan /koleksi/[category]. */
export async function KoleksiView({ searchParams, categoryParam }: KoleksiViewProps) {
  const params = await searchParams;

  const raw: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") raw[key] = value;
  }

  const parsed = productQuerySchema.safeParse(raw);
  const query: ProductQuery = parsed.success ? parsed.data : productQuerySchema.parse({});
  const effectiveCategory = categoryParam ?? query.category;
  const finalQuery: ProductQuery = effectiveCategory
    ? { ...query, category: effectiveCategory }
    : query;

  const [categories, filterOptions] = await Promise.all([
    getCategories(),
    getFilterOptions(effectiveCategory ?? undefined),
  ]);

  let result: ProductListResult;
  try {
    result = await listProducts(finalQuery);
  } catch {
    // DB offline (corak sama seperti categories.ts / featured-products.tsx)
    result = fallbackListProducts(finalQuery);
  }

  const current: SidebarParams = {
    category: effectiveCategory,
    search: raw.search,
    minPrice: raw.minPrice,
    maxPrice: raw.maxPrice,
    color: raw.color,
    size: raw.size,
    sort: raw.sort,
  };

  const queryString = new URLSearchParams();
  for (const [key, value] of Object.entries(current)) {
    if (value) queryString.set(key, value);
  }
  const queryStringWithoutPage = queryString.toString();

  const activeCategoryName = categories.find(
    (category) => category.slug === effectiveCategory,
  )?.name;
  const title = activeCategoryName ? `Koleksi ${activeCategoryName}` : "Semua Koleksi";

  const hasMore = result.total > result.page * result.pageSize;

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-12 md:px-8 md:py-20">
      {/* Header: tajuk serif + kiraan + carian */}
      <header className="mb-10">
        <h1 className="font-serif text-4xl font-medium tracking-tight text-ink md:text-5xl">
          {title}
        </h1>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-ink-soft tabular-nums">
            {result.total} produk
          </p>
          <form action="/koleksi" method="get" className="flex items-center">
            <input type="hidden" name="category" value={current.category ?? ""} />
            <input type="hidden" name="color" value={current.color ?? ""} />
            <input type="hidden" name="size" value={current.size ?? ""} />
            <input type="hidden" name="sort" value={current.sort ?? ""} />
            <label className="relative flex items-center">
              <span className="sr-only">Cari produk</span>
              <MagnifyingGlass
                size={16}
                aria-hidden="true"
                className="pointer-events-none absolute left-4 text-ink-soft"
              />
              <input
                type="search"
                name="search"
                defaultValue={current.search}
                placeholder="Cari produk..."
                className="h-10 w-full min-w-0 rounded-full border border-line bg-card pr-4 pl-10 text-sm outline-none placeholder:text-ink-soft/70 focus-visible:border-gold focus-visible:ring-3 focus-visible:ring-gold/25 sm:w-64"
              />
            </label>
          </form>
        </div>
      </header>

      {/* Sidebar kiri desktop + kandungan kanan */}
      <div className="grid gap-10 lg:grid-cols-[260px,1fr]">
        <aside className="hidden lg:block">
          <FilterSidebar
            current={current}
            categories={categories}
            colors={filterOptions.colors}
            sizes={filterOptions.sizes}
          />
        </aside>

        <div>
          {/* Bar alat: drawer mobile + susun */}
          <div className="mb-6 flex items-center justify-between gap-3">
            <FilterDrawer>
              <FilterSidebar
                current={current}
                categories={categories}
                colors={filterOptions.colors}
                sizes={filterOptions.sizes}
              />
            </FilterDrawer>
            <SortSelect current={current} value={query.sort ?? "popular"} className="ml-auto" />
          </div>

          {result.items.length === 0 ? (
            <div className="rounded-2xl border border-line bg-card px-6 py-16 text-center">
              <p className="font-serif text-2xl font-semibold text-ink">
                Tiada produk ditemui.
              </p>
              <p className="mt-2 text-ink-soft">
                Cuba tukar filter atau carian anda.
              </p>
              <Link
                href="/koleksi"
                className="mt-7 inline-flex h-11 items-center rounded-full bg-gold px-7 text-sm font-medium text-card transition-colors hover:bg-gold-deep"
              >
                Reset Tapisan
              </Link>
            </div>
          ) : (
            <LoadMore
              key={queryStringWithoutPage}
              initialItems={result.items}
              queryString={queryStringWithoutPage}
              nextPage={result.page + 1}
              hasMore={hasMore}
            />
          )}
        </div>
      </div>
    </div>
  );
}
