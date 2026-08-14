import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";

import { ProductCard, type ProductCardProduct } from "@/components/shop/product-card";
import { ProductGallery } from "@/components/shop/product-gallery";
import { PdpClient } from "@/components/shop/pdp-client";
import { RatingStars } from "@/components/shop/rating-stars";
import { ReviewList } from "@/components/shop/review-list";
import { ReviewForm } from "@/components/shop/review-form";
import { WishlistButton } from "@/components/shop/wishlist-button";
import { db } from "@/lib/db";
import { formatRM } from "@/lib/format";
import {
  fallbackGetProductDetail,
  fallbackRelatedProducts,
} from "@/lib/katalog-fallback";
import {
  getProductBySlug,
  type ProductDetail,
} from "@/server/services/product.service";

interface ProdukPageProps {
  params: Promise<{ slug: string }>;
}

const RELATED_INCLUDE = {
  variants: { select: { stock: true } },
  reviews: { where: { status: "APPROVED" }, select: { rating: true } },
} satisfies Prisma.ProductInclude;

type RelatedRow = Prisma.ProductGetPayload<{ include: typeof RELATED_INCLUDE }>;

/** Row produk berkaitan -> ProductCardProduct (corak featured-products.tsx). */
function toCardProduct(product: RelatedRow): ProductCardProduct {
  const images = product.images;
  const image =
    Array.isArray(images) && typeof images[0] === "string"
      ? images[0]
      : `https://picsum.photos/seed/maisara-${product.slug}/600/750`;

  const stocks = product.variants.map((variant) => variant.stock);
  const ratings = product.reviews.map((review) => review.rating);

  return {
    name: product.name,
    slug: product.slug,
    price: product.price.toString(),
    image,
    minStock: stocks.length > 0 ? Math.min(...stocks) : 0,
    avgRating:
      ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : null,
    reviewCount: ratings.length,
  };
}

/** Service sebenar + fallback seed bila DB tidak dapat dicapai (corak koleksi). */
async function getProduct(slug: string): Promise<ProductDetail | null> {
  try {
    return await getProductBySlug(slug);
  } catch {
    return fallbackGetProductDetail(slug);
  }
}

export async function generateMetadata({ params }: ProdukPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: "Produk | Maisara" };
  }

  const description =
    product.description.length > 160
      ? `${product.description.slice(0, 157)}...`
      : product.description;

  return {
    title: `${product.name} | Maisara`,
    description,
  };
}

/**
 * PDP (DESIGN.md 8): galeri 7 kolum + info 5 kolum, variant picker,
 * kuantiti stepper, stok status, review, produk berkaitan.
 */
export default async function ProdukPage({ params }: ProdukPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  // Produk berkaitan: kategori sama, exclude semasa, limit 4.
  let related: ProductCardProduct[] = [];
  try {
    const rows = await db.product.findMany({
      where: {
        categoryId: product.category.id,
        isActive: true,
        NOT: { id: product.id },
      },
      include: RELATED_INCLUDE,
      take: 4,
    });
    related = rows.map(toCardProduct);
  } catch {
    related = fallbackRelatedProducts(product.slug, product.category.slug);
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 md:px-8">
      <div className="grid gap-10 py-12 md:py-20 lg:grid-cols-12 lg:gap-12">
        {/* Galeri (7 kolum) */}
        <div className="lg:col-span-7">
          <ProductGallery images={product.images} alt={product.name} />
        </div>

        {/* Info (5 kolum) */}
        <div className="lg:col-span-5">
          <Link
            href={`/koleksi/${product.category.slug}`}
            className="text-sm font-medium text-gold-deep transition-colors hover:text-gold"
          >
            {product.category.name}
          </Link>

          <h1 className="mt-2 font-serif text-4xl leading-[1.05] font-medium tracking-tight text-ink md:text-5xl">
            {product.name}
          </h1>

          <p className="mt-3 text-2xl font-medium tabular-nums text-ink">
            {formatRM(product.price)}
          </p>

          {product.reviewCount > 0 && product.avgRating != null && (
            <div className="mt-3 flex items-center gap-2">
              <RatingStars value={product.avgRating} size={14} />
              <span className="text-sm tabular-nums text-ink-soft">
                {product.reviewCount} ulasan
              </span>
            </div>
          )}

          <p className="mt-6 max-w-[60ch] leading-relaxed text-ink-soft">
            {product.description}
          </p>

          <div className="mt-8">
            <PdpClient
              variants={product.variants}
              product={{
                name: product.name,
                slug: product.slug,
                price: product.price,
                image: product.images[0] ?? "",
              }}
            />
          </div>

          <div className="mt-8 flex items-center gap-3 border-t border-line pt-6">
            <WishlistButton productId={product.id} />
            <p className="text-sm text-ink-soft">
              Penghantaran dalam 2-4 hari bekerja
            </p>
          </div>
        </div>
      </div>

      {/* Ulasan */}
      <ReviewList
        reviews={product.reviews}
        avgRating={product.avgRating}
        reviewCount={product.reviewCount}
      />

      <div className="mx-auto mt-10 max-w-3xl">
        <ReviewForm productId={product.id} />
      </div>

      {/* Produk berkaitan */}
      <section className="border-t border-line py-16 md:py-24">
        <h2 className="font-serif text-3xl font-medium tracking-tight text-ink md:text-4xl">
          Anda Mungkin Suka
        </h2>

        {related.length === 0 ? (
          <p className="mt-8 text-ink-soft">
            Tiada produk berkaitan buat masa ini.
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.slug} product={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
