import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import type { ProductQuery } from "@/lib/validations/product";

/**
 * Service katalog (API.md section 2 - GET /api/products).
 * Layer bebas transport: dipanggil oleh route handler dan halaman koleksi.
 */

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  price: string;
  image: string;
  category: { name: string; slug: string };
  colors: string[];
  sizes: string[];
  minStock: number;
  avgRating: number | null;
  reviewCount: number;
}

export interface ProductListResult {
  items: ProductSummary[];
  total: number;
  page: number;
  pageSize: number;
}

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: { select: { name: true; slug: true } };
    variants: { select: { id: true; color: true; size: true; stock: true } };
    reviews: { where: { status: "APPROVED" }; select: { rating: true } };
  };
}>;

const SORT_ORDER: Record<
  NonNullable<ProductQuery["sort"]>,
  Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[]
> = {
  popular: [{ reviews: { _count: "desc" } }, { createdAt: "desc" }],
  "price-asc": { price: "asc" },
  "price-desc": { price: "desc" },
  newest: { createdAt: "desc" },
};

/** Images disimpan sebagai Json (array URL, kadang-kala string JSON). */
function parseImages(images: unknown): string[] {
  const raw = Array.isArray(images) ? images : typeof images === "string" ? tryParse(images) : [];
  return raw.filter((item): item is string => typeof item === "string");

  function tryParse(value: string): unknown[] {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}

function toSummary(product: ProductWithRelations): ProductSummary {
  const colors = [...new Set(product.variants.map((variant) => variant.color).filter(Boolean))] as string[];
  const sizes = [...new Set(product.variants.map((variant) => variant.size).filter(Boolean))] as string[];
  const stocks = product.variants.map((variant) => variant.stock);
  const ratings = product.reviews.map((review) => review.rating);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price.toString(),
    image: parseImages(product.images)[0] ?? "",
    category: { name: product.category.name, slug: product.category.slug },
    colors,
    sizes,
    minStock: stocks.length > 0 ? Math.min(...stocks) : 0,
    avgRating:
      ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : null,
    reviewCount: ratings.length,
  };
}

/**
 * Senarai produk aktif dengan filter, susun & pagination.
 * Setiap query merangkumi kategori, variants dan review APPROVED.
 */
export async function listProducts(query: ProductQuery): Promise<ProductListResult> {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 12;

  const variantFilter: Prisma.ProductVariantWhereInput = {};
  if (query.color) variantFilter.color = query.color;
  if (query.size) variantFilter.size = query.size;

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(query.category ? { category: { slug: query.category } } : {}),
    ...(query.search ? { name: { contains: query.search, mode: "insensitive" } } : {}),
    ...(query.minPrice != null || query.maxPrice != null
      ? {
          price: {
            ...(query.minPrice != null ? { gte: new Prisma.Decimal(query.minPrice) } : {}),
            ...(query.maxPrice != null ? { lte: new Prisma.Decimal(query.maxPrice) } : {}),
          },
        }
      : {}),
    ...(Object.keys(variantFilter).length > 0 ? { variants: { some: variantFilter } } : {}),
  };

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true } },
        variants: { select: { id: true, color: true, size: true, stock: true } },
        reviews: { where: { status: "APPROVED" }, select: { rating: true } },
      },
      orderBy: SORT_ORDER[query.sort ?? "popular"],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.product.count({ where }),
  ]);

  return {
    items: products.map(toSummary),
    total,
    page,
    pageSize,
  };
}
