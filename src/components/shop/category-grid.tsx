import Image from "next/image";
import Link from "next/link";

import { BatikPattern } from "@/components/shared/motif";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

import { Reveal } from "./reveal";

interface CategoryWithCount {
  name: string;
  slug: string;
  image: string | null;
  productCount: number;
}

/**
 * Fallback = data seed (prisma/seed.ts) supaya render/build kekal hijau
 * walaupun DATABASE_URL tidak boleh dicapai.
 */
const FALLBACK_CATEGORIES: CategoryWithCount[] = [
  { name: "Tudung", slug: "tudung", image: null, productCount: 5 },
  { name: "Baju Kurung", slug: "baju-kurung", image: null, productCount: 5 },
  { name: "Dress", slug: "dress", image: null, productCount: 4 },
  { name: "Abaya", slug: "abaya", image: null, productCount: 4 },
  { name: "Aksesori", slug: "aksesori", image: null, productCount: 4 },
];

function categoryImage(image: string | null, slug: string): string {
  return image ?? `https://picsum.photos/seed/maisara-${slug}/600/750`;
}

async function getCategoryGrid(): Promise<CategoryWithCount[]> {
  try {
    const categories = await db.category.findMany({
      orderBy: { order: "asc" },
      select: {
        name: true,
        slug: true,
        image: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
    });
    if (categories.length === 0) {
      return FALLBACK_CATEGORIES;
    }
    return categories.map((category) => ({
      name: category.name,
      slug: category.slug,
      image: category.image,
      productCount: category._count.products,
    }));
  } catch {
    return FALLBACK_CATEGORIES;
  }
}

/**
 * Kad kategori double-bezel (DESIGN.md 7.4): outer gold-tint p-1.5 rounded-2xl,
 * inner bg-card. Nama serif + bilangan produk, batik halus di belakang imej.
 */
function CategoryCard({
  category,
  large = false,
}: {
  category: CategoryWithCount;
  large?: boolean;
}) {
  return (
    <Link
      href={`/koleksi/${category.slug}`}
      className={cn(
        "group block h-full rounded-2xl bg-gold-tint p-1.5",
        "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(42,38,34,0.12)]",
      )}
    >
      <div className="relative h-full overflow-hidden rounded-[calc(1rem-0.375rem)] bg-card">
        <BatikPattern opacity={0.08} className="absolute inset-0 z-0" />
        <div className="absolute inset-0 z-[1]">
          <Image
            src={categoryImage(category.image, category.slug)}
            alt={`Koleksi ${category.name}`}
            fill
            sizes={
              large
                ? "(min-width: 1024px) 50vw, 100vw"
                : "(min-width: 1024px) 25vw, 50vw"
            }
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
          />
        </div>
        <div className="absolute bottom-3 left-3 z-[2] rounded-xl bg-card/90 px-4 py-2.5 shadow-[0_1px_2px_rgba(42,38,34,0.04),0_8px_24px_rgba(42,38,34,0.06)] backdrop-blur">
          <span className="block font-serif text-xl leading-tight font-semibold text-ink">
            {category.name}
          </span>
          <span className="mt-0.5 block text-xs text-ink-soft">
            {category.productCount} produk
          </span>
        </div>
      </div>
    </Link>
  );
}

/**
 * Kategori asymmetric grid (DESIGN.md 8, homepage section 2):
 * kad pertama besar (col-span-2 row-span-2), 4 kecil 1x1. Mobile: 2 kolum.
 * Stagger reveal 60ms per kad.
 */
export async function CategoryGrid() {
  const categories = await getCategoryGrid();
  const large = categories[0] ?? null;
  const smalls = categories.slice(1);

  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-8">
        <Reveal>
          <div className="mb-12">
            <h2 className="font-serif text-3xl font-medium tracking-tight text-ink md:text-5xl">
              Pilih mengikut koleksi
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
          {large && (
            <Reveal
              className="col-span-2 row-auto aspect-[16/11] sm:aspect-[21/10] lg:col-span-2 lg:row-span-2 lg:aspect-auto"
            >
              <CategoryCard category={large} large />
            </Reveal>
          )}
          {smalls.map((category, i) => (
            <Reveal
              key={category.slug}
              delay={(i + 1) * 0.06}
              className="aspect-[4/5]"
            >
              <CategoryCard category={category} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
