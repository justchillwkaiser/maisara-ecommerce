import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";

import { ProductCard, type ProductCardProduct } from "@/components/shop/product-card";
import { ProductGallery } from "@/components/shop/product-gallery";
import { PdpClient } from "@/components/shop/pdp-client";
import { RatingStars } from "@/components/shop/rating-stars";
import { ReviewList } from "@/components/shop/review-list";
import { ReviewForm } from "@/components/shop/review-form";
import { WishlistButton } from "@/components/shop/wishlist-button";
import { TRUST_POINTS } from "@/components/shared/trust-strip";
import { Accordion } from "@/components/ui/accordion";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { CriticalImagePreload } from "@/components/ui/critical-image-preload";
import { SectionHeading } from "@/components/ui/section-heading";
import { db } from "@/lib/db";
import { formatRM } from "@/lib/format";
import { PDP_MAIN_SIZES } from "@/lib/image-sizes";
import {
  fallbackGetProductDetail,
  fallbackRelatedProducts,
} from "@/lib/katalog-fallback";
import { primaryImageFor } from "@/lib/product-images";
import {
  getProductBySlug,
  type ProductDetail,
} from "@/server/services/product.service";

interface ProdukPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * URL awam laman - corak sama seperti metadataBase dalam app/layout.tsx.
 * Diperlukan untuk URL imej mutlak dalam data berstruktur.
 */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://maisarabutik.vercel.app");

const RELATED_SELECT = {
  name: true,
  slug: true,
  price: true,
  images: true,
  category: { select: { slug: true } },
  variants: { select: { color: true, stock: true } },
  reviews: { where: { status: "APPROVED" }, select: { rating: true } },
} satisfies Prisma.ProductSelect;

type RelatedRow = Prisma.ProductGetPayload<{ select: typeof RELATED_SELECT }>;

/**
 * Row produk berkaitan -> ProductCardProduct (corak featured-products.tsx).
 * Imej kad guna imej galeri sebenar; produk tanpa imej jatuh ke imej kategori
 * yang masih milik sistem visual Maisara - bukan imej stok rawak.
 */
function toCardProduct(product: RelatedRow): ProductCardProduct {
  const gallery = Array.isArray(product.images)
    ? product.images.filter((image): image is string => typeof image === "string")
    : [];

  const colors = [
    ...new Set(product.variants.map((v) => v.color).filter((c): c is string => Boolean(c))),
  ];
  const stocks = product.variants.map((variant) => variant.stock);
  const ratings = product.reviews.map((review) => review.rating);

  return {
    name: product.name,
    slug: product.slug,
    price: product.price.toString(),
    image: gallery[0] ?? primaryImageFor(product.slug, product.category.slug),
    hoverImage: gallery[1] ?? null,
    colors,
    minStock: stocks.length > 0 ? Math.min(...stocks) : 0,
    avgRating:
      ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : null,
    reviewCount: ratings.length,
  };
}

/**
 * Ayat pertama deskripsi sebenar sebagai cadangan ringkas PDP.
 * Tiada copy baru dicipta - hanya memendekkan teks yang sudah wujud supaya
 * hierarki maklumat kekal ringkas sebelum pilihan variant.
 */
function shortProposition(description: string): string {
  const trimmed = description.trim();
  const end = trimmed.search(/[.!?](\s|$)/);
  const sentence = end === -1 ? trimmed : trimmed.slice(0, end + 1);
  return sentence.length > 180 ? `${sentence.slice(0, 177).trimEnd()}...` : sentence;
}

/**
 * Service sebenar + fallback seed bila DB tidak dapat dicapai (corak koleksi).
 * Dibungkus `cache()`: generateMetadata dan komponen halaman memanggil slug
 * yang sama dalam request yang sama, jadi React menyimpan hasil sekali sahaja
 * dan produk hanya dibaca dari DB satu kali setiap request.
 */
const getProduct = cache(async (slug: string): Promise<ProductDetail | null> => {
  try {
    return await getProductBySlug(slug);
  } catch {
    return fallbackGetProductDetail(slug);
  }
});

export async function generateMetadata({ params }: ProdukPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    // `notFound()` di sini (bukan hanya dalam komponen halaman): halaman ini
    // berada dalam sempadan Suspense `produk/[slug]/loading.tsx`, jadi status
    // 200 dihantar bersama rangka skeleton sebelum notFound() sempat berjalan.
    // Metadata diselesaikan lebih awal, jadi slug yang tidak wujud memulangkan
    // 404 sebenar dan bukan soft-404 yang boleh diindeks.
    notFound();
  }

  const description =
    product.description.length > 160
      ? `${product.description.slice(0, 157)}...`
      : product.description;

  const heroImage = product.images[0];
  const path = `/produk/${product.slug}`;

  return {
    title: `${product.name} | Maisara`,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title: `${product.name} | Maisara`,
      description,
      url: path,
      images: heroImage
        ? [{ url: heroImage, width: 1200, height: 1500, alt: product.name }]
        : [{ url: "/og.png", width: 1200, height: 630, alt: "Maisara" }],
    },
  };
}

/**
 * PDP (spesifikasi 15): galeri 7 kolum + maklumat 5 kolum. Hierarki maklumat
 * mengikut urutan kategori, nama, harga, cadangan ringkas, warna, saiz,
 * kuantiti, tambah ke cart, kemudian maklumat kepercayaan dan butiran produk.
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
      select: RELATED_SELECT,
      take: 4,
    });
    related = rows.map(toCardProduct);
  } catch {
    related = fallbackRelatedProducts(product.slug, product.category.slug);
  }

  const proposition = shortProposition(product.description);
  const rating =
    product.reviewCount > 0 && product.avgRating != null
      ? { value: product.avgRating, count: product.reviewCount }
      : null;
  const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
  const firstVariant = product.variants[0];

  // Data berstruktur (spesifikasi 28): hanya medan sebenar daripada
  // ProductDetail. aggregateRating hanya wujud bila ada ulasan sebenar.
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    ...(product.images.length > 0
      ? { image: product.images.map((image) => new URL(image, siteUrl).toString()) }
      : {}),
    ...(firstVariant ? { sku: firstVariant.sku } : {}),
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "MYR",
      availability:
        totalStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    ...(rating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating.value,
            reviewCount: rating.count,
          },
        }
      : {}),
  };

  // Butiran produk: hanya bahagian yang benar-benar disokong data. Skema tidak
  // menyimpan bahan, potongan atau penjagaan, jadi bahagian itu tidak dicipta.
  const details = [
    ...(product.description.trim().length > 0
      ? [{ label: "Keterangan", content: <p>{product.description}</p> }]
      : []),
    {
      label: "Penghantaran",
      content: (
        <>
          <p>
            Dihantar dengan J&amp;T Express atau Pos Laju ke seluruh Malaysia.
            Pesanan diproses dalam 1-2 hari bekerja dan tiba dalam 2-4 hari
            bekerja selepas dihantar.
          </p>
          <Link
            href="/penghantaran"
            className="mt-3 inline-block text-ink underline underline-offset-4 transition-colors duration-(--dur-fast) hover:text-cocoa"
          >
            Butiran penghantaran
          </Link>
        </>
      ),
    },
    {
      label: "Pertukaran",
      content: (
        <>
          <p>
            Pertukaran dalam 7 hari selepas pesanan diterima. Item perlu belum
            dipakai, label masih utuh dan disertakan resit atau nombor pesanan.
          </p>
          <Link
            href="/pertukaran"
            className="mt-3 inline-block text-ink underline underline-offset-4 transition-colors duration-(--dur-fast) hover:text-cocoa"
          >
            Dasar pertukaran
          </Link>
        </>
      ),
    },
  ];

  return (
    <div className="shell">
      {/* Preload imej LCP daripada komponen pelayan. `loading.tsx` menjadikan
          laluan ini sempadan Suspense, jadi pautan preload yang dijana di dalam
          galeri (komponen klien) jatuh ~60KB ke dalam <body>. Diukur: permintaan
          imej LCP bermula pada 488ms; pautan ini mengalihkannya ke awal stream. */}
      <CriticalImagePreload src={product.images[0] ?? null} sizes={PDP_MAIN_SIZES} />
      <script
        type="application/ld+json"
        // "<" di-escape supaya teks produk tidak boleh menutup tag script.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      <Breadcrumb
        className="py-6"
        items={[
          { label: "Utama", href: "/" },
          { label: "Koleksi", href: "/koleksi" },
          {
            label: product.category.name,
            href: `/koleksi/${product.category.slug}`,
          },
          { label: product.name },
        ]}
      />

      <div className="grid-12 items-start gap-y-12 pt-6 pb-(--space-section)">
        {/* Galeri (7 kolum) */}
        <div className="col-span-12 lg:col-span-7">
          <ProductGallery images={product.images} alt={product.name} />
        </div>

        {/* Maklumat (5 kolum) */}
        <div className="col-span-12 lg:col-span-5">
          <Link
            href={`/koleksi/${product.category.slug}`}
            className="meta-label text-cocoa transition-colors duration-(--dur-fast) hover:text-ink"
          >
            {product.category.name}
          </Link>

          <h1 className="mt-4 font-display text-h1 text-ink">{product.name}</h1>

          <p className="mt-5 font-mono text-body-lg tabular-nums text-ink">
            {formatRM(product.price)}
          </p>

          {rating ? (
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
              <RatingStars value={rating.value} size={13} />
              <span className="meta-label text-cocoa">
                {rating.value.toFixed(1)} / 5 · {rating.count} ulasan
              </span>
            </div>
          ) : null}

          {proposition ? (
            <p className="mt-6 max-w-[46ch] text-body-lg text-cocoa">{proposition}</p>
          ) : null}

          <div className="mt-9">
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

          <div className="mt-9 flex items-center gap-4 border-t border-line pt-6">
            <WishlistButton productId={product.id} />
            <p className="text-body-sm text-cocoa">
              Penghantaran dalam 2-4 hari bekerja
            </p>
          </div>

          <ul
            aria-label="Jaminan Maisara"
            className="mt-9 divide-y divide-line border-t border-line"
          >
            {TRUST_POINTS.map((point) => (
              <li key={point.label} className="flex flex-col gap-1 py-4">
                <span className="meta-label text-ink">{point.label}</span>
                <span className="text-body-sm text-cocoa">{point.detail}</span>
              </li>
            ))}
          </ul>

          <Accordion className="mt-9" items={details} />
        </div>
      </div>

      {/* Ulasan + borang */}
      <div className="grid-12 gap-y-14 border-t border-line pt-(--space-section)">
        <div className="col-span-12 lg:col-span-7">
          <ReviewList
            reviews={product.reviews}
            avgRating={product.avgRating}
            reviewCount={product.reviewCount}
          />
        </div>
        <div className="col-span-12 lg:col-span-5">
          <ReviewForm productId={product.id} />
        </div>
      </div>

      {/* Produk berkaitan */}
      <section className="mt-(--space-section) border-t border-line pt-(--space-section) pb-(--space-section)">
        <SectionHeading
          as="h2"
          size="h2"
          eyebrow="Produk berkaitan"
          title="Anda Mungkin Suka"
        />

        {related.length === 0 ? (
          <p className="mt-10 text-body text-cocoa">
            Tiada produk berkaitan buat masa ini.
          </p>
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-x-(--gutter) gap-y-12 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.slug} product={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
