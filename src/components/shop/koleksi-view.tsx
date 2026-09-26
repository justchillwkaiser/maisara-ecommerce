import { unstable_cache } from "next/cache";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";

import { FilterDrawer } from "@/components/shop/filter-drawer";
import {
  FilterSidebar,
  KoleksiFilterTokens,
  type SidebarParams,
} from "@/components/shop/filter-sidebar";
import {
  KoleksiResultCount,
  KoleksiResults,
  KoleksiResultsProvider,
} from "@/components/shop/load-more";
import { SortSelect } from "@/components/shop/sort-select";
import { EmptyState } from "@/components/ui/empty-state";
import { CriticalImagePreload } from "@/components/ui/critical-image-preload";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCategories } from "@/lib/categories";
import { db } from "@/lib/db";
import { GRID_SIZES } from "@/lib/image-sizes";
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
 * Query di-cache 5 minit - set warna/saiz jarang berubah dan dikongsi
 * oleh /koleksi dan /koleksi/[category] pada setiap request.
 */
const getFilterOptionsCached = unstable_cache(
  async (categorySlug?: string): Promise<{ colors: string[]; sizes: string[] }> => {
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
  },
  ["koleksi-filter-options"],
  { revalidate: 300 },
);

async function getFilterOptions(categorySlug?: string) {
  try {
    return await getFilterOptionsCached(categorySlug);
  } catch {
    return { colors: FALLBACK_COLORS, sizes: FALLBACK_SIZES };
  }
}

/** Bilangan tapisan aktif daripada URL; ketersediaan (klien) ditambah di UI. */
function countActiveFilters(params: SidebarParams): number {
  let count = 0;
  if (params.category) count += 1;
  if (params.search) count += 1;
  if (params.minPrice || params.maxPrice) count += 1;
  if (params.color) count += 1;
  if (params.size) count += 1;
  return count;
}

/** Halaman koleksi (spesifikasi 14 - Katalog). Dikongsi /koleksi dan /koleksi/[category]. */
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
  const activeFilterCount = countActiveFilters(current);
  const hasMore = result.total > result.page * result.pageSize;
  const isEmpty = result.items.length === 0;

  const emptyState =
    activeFilterCount > 0 ? (
      <EmptyState
        eyebrow="Tiada padanan"
        title="Tiada produk sepadan dengan tapisan ini"
        description="Cuba luaskan julat harga, buang satu tapisan, atau kosongkan penapis untuk melihat seluruh koleksi."
        action={{ label: "Kosongkan penapis", href: "/koleksi" }}
      />
    ) : activeCategoryName ? (
      <EmptyState
        eyebrow={activeCategoryName}
        title={`Koleksi ${activeCategoryName} belum ada produk`}
        description="Koleksi ini akan diisi apabila produk baharu dibuka. Lihat koleksi lain sementara itu."
        action={{ label: "Lihat semua koleksi", href: "/koleksi" }}
      />
    ) : (
      <EmptyState
        eyebrow="Katalog"
        title="Katalog belum dibuka"
        description="Tiada produk diterbitkan buat masa ini. Kembali sebentar lagi."
        action={{ label: "Kembali ke laman utama", href: "/" }}
      />
    );

  return (
    <div className="shell py-(--space-section)">
      {/* Preload baris pertama grid daripada komponen pelayan: `loading.tsx`
          pada /koleksi menjadikan laluan ini sempadan Suspense, jadi pautan
          preload dari kad klien jatuh ~60KB ke dalam <body> (ditemui pada
          253ms). Baris pertama (4 kad) berada dalam viewport awal pada desktop,
          jadi ia sah untuk diutamakan; baris seterusnya kekal lazy. */}
      {result.items.slice(0, 4).map((item) => (
        <CriticalImagePreload
          key={`lcp-${item.id}`}
          src={item.image}
          sizes={GRID_SIZES}
        />
      ))}
      <KoleksiResultsProvider
        key={queryStringWithoutPage}
        initialItems={result.items}
        queryString={queryStringWithoutPage}
        nextPage={result.page + 1}
        hasMore={hasMore}
      >
        <header className="border-b border-line pb-8 md:pb-10">
          <SectionHeading
            as="h1"
            size="display-m"
            eyebrow={activeCategoryName ? "Katalog / Kategori" : "Katalog / Semua"}
            title={activeCategoryName ? `Koleksi ${activeCategoryName}` : "SHOP ALL"}
            description={
              activeCategoryName
                ? undefined
                : "Koleksi Maisara untuk hari biasa, hari istimewa dan segala yang di antaranya."
            }
            action={<KoleksiResultCount total={result.total} />}
          />

          <form action="/koleksi" method="get" className="mt-8 flex items-center">
            <input type="hidden" name="category" value={current.category ?? ""} />
            <input type="hidden" name="color" value={current.color ?? ""} />
            <input type="hidden" name="size" value={current.size ?? ""} />
            <input type="hidden" name="sort" value={current.sort ?? ""} />
            <label className="relative flex w-full items-center sm:w-72">
              <span className="sr-only">Cari produk</span>
              <MagnifyingGlass
                size={16}
                aria-hidden="true"
                className="pointer-events-none absolute left-4 text-cocoa"
              />
              <input
                type="search"
                name="search"
                defaultValue={current.search}
                placeholder="Cari produk..."
                className="h-11 w-full min-w-0 rounded-xs border border-line bg-paper-lift pr-4 pl-10 text-body-sm text-ink outline-none placeholder:text-cocoa/70 focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/30"
              />
            </label>
          </form>
        </header>

        <div className="grid-12 mt-10 gap-y-10 md:mt-14">
          <aside aria-label="Penapis" className="col-span-12 hidden lg:col-span-3 lg:block">
            <FilterSidebar
              current={current}
              categories={categories}
              colors={filterOptions.colors}
              sizes={filterOptions.sizes}
            />
          </aside>

          <div className="col-span-12 lg:col-span-9">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <FilterDrawer baseCount={activeFilterCount}>
                <FilterSidebar
                  current={current}
                  categories={categories}
                  colors={filterOptions.colors}
                  sizes={filterOptions.sizes}
                />
              </FilterDrawer>
              <SortSelect current={current} value={query.sort ?? "popular"} className="ml-auto" />
            </div>

            <KoleksiFilterTokens current={current} categories={categories} />

            {isEmpty ? emptyState : <KoleksiResults />}
          </div>
        </div>
      </KoleksiResultsProvider>
    </div>
  );
}