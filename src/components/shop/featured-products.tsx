import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

import { db } from "@/lib/db";

import { ProductCard, type ProductCardProduct } from "./product-card";
import { Reveal } from "./reveal";

/**
 * Fallback = data seed (prisma/seed.ts) supaya render/build kekal hijau
 * walaupun DATABASE_URL tidak boleh dicapai.
 */
const FALLBACK_FEATURED: ProductCardProduct[] = [
  {
    name: "Tudung Bella Voal Premium",
    slug: "tudung-bella-voal",
    price: "39.90",
    image: "https://picsum.photos/seed/maisara-tudung-bella-voal/600/750",
    minStock: 3,
    avgRating: 4.8,
    reviewCount: 12,
  },
  {
    name: "Shawl Silk Premium",
    slug: "shawl-silk-premium",
    price: "89.00",
    image: "https://picsum.photos/seed/maisara-shawl-silk-premium/600/750",
    minStock: 9,
    avgRating: 4.6,
    reviewCount: 8,
  },
  {
    name: "Baju Kurung Moden Cik Puan",
    slug: "baju-kurung-cik-puan",
    price: "159.00",
    image: "https://picsum.photos/seed/maisara-baju-kurung-cik-puan/600/750",
    minStock: 14,
    avgRating: 4.9,
    reviewCount: 15,
  },
  {
    name: "Dress Raya Satin",
    slug: "dress-raya-satin",
    price: "199.00",
    image: "https://picsum.photos/seed/maisara-dress-raya-satin/600/750",
    minStock: 0,
    avgRating: 4.7,
    reviewCount: 10,
  },
];

async function getFeaturedProducts(): Promise<ProductCardProduct[]> {
  try {
    const products = await db.product.findMany({
      where: { featured: true, isActive: true },
      include: {
        variants: { select: { stock: true } },
        reviews: {
          where: { status: "APPROVED" },
          select: { rating: true },
        },
      },
      take: 4,
      orderBy: { createdAt: "asc" },
    });

    if (products.length === 0) {
      return [];
    }

    return products.map((product) => {
      const images = product.images;
      const image =
        Array.isArray(images) && typeof images[0] === "string"
          ? images[0]
          : `https://picsum.photos/seed/maisara-${product.slug}/600/750`;

      const stocks = product.variants.map((variant) => variant.stock);
      const minStock =
        stocks.length > 0 ? Math.min(...stocks) : Number.POSITIVE_INFINITY;

      const ratings = product.reviews.map((review) => review.rating);
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
          : null;

      return {
        name: product.name,
        slug: product.slug,
        price: product.price.toString(),
        image,
        minStock,
        avgRating,
        reviewCount: ratings.length,
      };
    });
  } catch {
    return FALLBACK_FEATURED;
  }
}

/**
 * Produk featured (DESIGN.md 8, homepage section 3): grid 4 (2x2 desktop),
 * header serif + link "Lihat Semua" kanan. Empty state jika tiada featured.
 */
export async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-8">
        <Reveal>
          <div className="mb-12 flex items-baseline justify-between gap-4">
            <h2 className="font-serif text-3xl font-medium tracking-tight text-ink md:text-5xl">
              Pilihan Maisara
            </h2>
            <Link
              href="/koleksi"
              className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-gold-deep transition-colors hover:text-gold"
            >
              Lihat Semua
              <ArrowRight size={14} />
            </Link>
          </div>
        </Reveal>

        {products.length === 0 ? (
          <p className="text-ink-soft">
            Tiada produk featured buat masa ini. Sila kembali kemudian.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {products.map((product, i) => (
              <Reveal key={product.slug} delay={i * 0.06}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
