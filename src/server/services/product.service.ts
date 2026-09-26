import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/errors";
import type { ProductCreateInput, ProductQuery, ProductUpdateInput } from "@/lib/validations/product";

/**
 * Service katalog (API.md section 2 - GET /api/products).
 * Layer bebas transport: dipanggil oleh route handler dan halaman koleksi.
 */

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  price: string;
  /** Imej pertama galeri; null apabila produk tiada imej (placeholder sistem). */
  image: string | null;
  /** Imej kedua galeri untuk hover kad; null apabila hanya ada satu imej. */
  hoverImage: string | null;
  category: { name: string; slug: string };
  colors: string[];
  sizes: string[];
  minStock: number;
  /** Variant pertama yang ada stok (untuk quick add ke cart); null jika tiada. */
  quickAddVariant: {
    id: string;
    color: string | null;
    size: string | null;
    stock: number;
  } | null;
  avgRating: number | null;
  reviewCount: number;
}

export interface ProductListResult {
  items: ProductSummary[];
  total: number;
  page: number;
  pageSize: number;
}

/** Variant penuh untuk PDP (API.md section 2 - GET /api/products/[id]). */
export interface ProductVariantDetail {
  id: string;
  color: string | null;
  size: string | null;
  sku: string;
  stock: number;
}

/** Review APPROVED untuk PDP (API.md section 6). */
export interface ProductReviewDetail {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date;
  user: { name: string | null };
}

/** Detail produk penuh (PDP + API). */
export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  images: string[];
  category: { id: string; name: string; slug: string };
  variants: ProductVariantDetail[];
  reviews: ProductReviewDetail[];
  avgRating: number | null;
  reviewCount: number;
}

/**
 * Select penuh untuk detail produk (kategori, variants tersusun, review APPROVED).
 * Hanya medan yang dipaparkan dipilih: kolum yang tidak digunakan (description/
 * image/order kategori, categoryId/featured/createdAt/updatedAt produk, productId
 * pada variant, userId/productId/status pada review) tidak ditarik dari DB.
 */
export const PRODUCT_DETAIL_SELECT = {
  id: true,
  name: true,
  slug: true,
  description: true,
  price: true,
  images: true,
  isActive: true,
  category: { select: { id: true, name: true, slug: true } },
  variants: {
    select: { id: true, color: true, size: true, sku: true, stock: true },
    orderBy: { color: "asc" },
  },
  reviews: {
    where: { status: "APPROVED" },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      user: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  },
} satisfies Prisma.ProductSelect;

export type ProductDetailRow = Prisma.ProductGetPayload<{
  select: typeof PRODUCT_DETAIL_SELECT;
}>;

/**
 * Select ringkasan kad produk (katalog, homepage, produk berkaitan).
 * `description` sengaja tidak dipilih - medan teks panjang yang tidak
 * dipaparkan pada kad; kolum produk lain yang tidak dipakai turut dikecualikan.
 */
const PRODUCT_SUMMARY_SELECT = {
  id: true,
  name: true,
  slug: true,
  price: true,
  images: true,
  category: { select: { name: true, slug: true } },
  variants: { select: { id: true, color: true, size: true, stock: true } },
  reviews: { where: { status: "APPROVED" }, select: { rating: true } },
} satisfies Prisma.ProductSelect;
type ProductWithRelations = Prisma.ProductGetPayload<{
  select: typeof PRODUCT_SUMMARY_SELECT;
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
  const images = parseImages(product.images);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price.toString(),
    image: images[0] ?? null,
    hoverImage: images[1] ?? null,
    category: { name: product.category.name, slug: product.category.slug },
    colors,
    sizes,
    minStock: stocks.length > 0 ? Math.min(...stocks) : 0,
    quickAddVariant: product.variants.find((variant) => variant.stock > 0) ?? null,
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
      select: PRODUCT_SUMMARY_SELECT,
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
/**
 * Produk aktif terbaharu (homepage "Koleksi Baharu").
 * Satu query sahaja: tiada `count` kerana pemanggil tidak memaparkan jumlah,
 * dan tiada cache kerana harga/stok ialah data inventori yang mesti segar.
 */
export async function listRecentProducts(limit: number): Promise<ProductSummary[]> {
  const products = await db.product.findMany({
    where: { isActive: true },
    select: PRODUCT_SUMMARY_SELECT,
    orderBy: SORT_ORDER.newest,
    take: limit,
  });
  return products.map(toSummary);
}

/**
 * Transform row produk penuh -> ProductDetail (API.md section 2).
 * images di-parse ke string[], price -> string, avgRating dibulat 1 dp.
 */
export function toProductDetail(product: ProductDetailRow): ProductDetail {
  const ratings = product.reviews.map((review) => review.rating);
  const avgRating =
    ratings.length > 0
      ? Math.round((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 10) / 10
      : null;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price.toString(),
    images: parseImages(product.images),
    category: {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.slug,
    },
    variants: product.variants.map((variant) => ({
      id: variant.id,
      color: variant.color,
      size: variant.size,
      sku: variant.sku,
      stock: variant.stock,
    })),
    reviews: product.reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      user: { name: review.user.name },
    })),
    avgRating,
    reviewCount: ratings.length,
  };
}

/**
 * Detail produk aktif oleh slug (PDP). Termasuk kategori, variants (tersusun
 * ikut warna) dan review APPROVED (terbaru dahulu). Return null jika slug
 * tidak wujud atau produk tidak aktif.
 */
export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const product = await db.product.findUnique({
    where: { slug },
    select: PRODUCT_DETAIL_SELECT,
  });

  if (!product || !product.isActive) {
    return null;
  }

  return toProductDetail(product);
}
/**
 * Detail produk aktif oleh id (GET /api/products/[id]). Select yang sama
 * seperti getProductBySlug supaya route API tidak menyimpan bentuk select
 * sendiri. Return null jika id tidak wujud atau produk tidak aktif.
 */
export async function getProductById(id: string): Promise<ProductDetail | null> {
  const product = await db.product.findUnique({
    where: { id },
    select: PRODUCT_DETAIL_SELECT,
  });
  if (!product || !product.isActive) {
    return null;
  }
  return toProductDetail(product);
}

// ---------------------------------------------------------------------------
// Admin (API.md section 7 - Produk CRUD)
// ---------------------------------------------------------------------------

/** Slug auto-generate: lowercase, ganti bukan alphanumeric dengan hyphen. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isUniqueError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function uniqueTarget(error: Prisma.PrismaClientKnownRequestError): string {
  const meta = error.meta as Record<string, unknown> | undefined;
  const target = meta?.target;
  if (Array.isArray(target)) return target.join(",");
  if (typeof target === "string") return target;
  // Prisma 7 + driver adapter: constraint fields dalam meta.driverAdapterError
  // (cth. { cause: { constraint: { fields: ["sku"] } } }), bukan meta.target.
  const adapter = meta?.driverAdapterError as
    | { cause?: { constraint?: { fields?: string[] } } }
    | undefined;
  const fields = adapter?.cause?.constraint?.fields;
  return Array.isArray(fields) ? fields.join(",") : String(target ?? "");
}

/**
 * Cipta produk + variants (POST /api/products).
 * Slug auto dari name jika kosong (normalize lowercase-hyphen).
 * SKU duplicate -> 409 SKU_EXISTS; slug duplicate -> 409 SLUG_EXISTS.
 */
export async function createProduct(
  input: ProductCreateInput,
): Promise<{ id: string; slug: string }> {
  const slug = input.slug?.trim() ? input.slug.trim() : slugify(input.name);

  try {
    const product = await db.product.create({
      data: {
        name: input.name,
        slug,
        description: input.description,
        price: new Prisma.Decimal(input.price).toFixed(2),
        categoryId: input.categoryId,
        featured: input.featured ?? false,
        images: input.images ?? [],
        variants: {
          create: (input.variants ?? []).map((variant) => ({
            color: variant.color?.trim() ? variant.color.trim() : null,
            size: variant.size?.trim() ? variant.size.trim() : null,
            sku: variant.sku,
            stock: variant.stock ?? 0,
          })),
        },
      },
      select: { id: true, slug: true },
    });

    return product;
  } catch (error) {
    if (isUniqueError(error)) {
      const target = uniqueTarget(error);
      if (/sku/i.test(target)) {
        throw new ApiError("SKU_EXISTS", "SKU sudah wujud. Sila guna SKU lain.", 409);
      }
      throw new ApiError("SLUG_EXISTS", "Slug sudah wujud. Sila guna slug lain.", 409);
    }
    throw error;
  }
}

/**
 * Kemaskini produk admin (PATCH /api/products/[id]).
 * Update asas + variants (replace list). Variants diselaraskan ikut SKU:
 * SKU sedia ada dikemaskini in-place, SKU baru dicipta, SKU dibuang hanya
 * jika tiada rujukan OrderItem (OrderItem guna onDelete Restrict - jangan
 * hard delete variant yang pernah diorder).
 */
export async function updateProduct(id: string, input: ProductUpdateInput): Promise<void> {
  await db.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!product) {
      throw new ApiError("NOT_FOUND", "Produk tidak ditemui.", 404);
    }

    const slug =
      input.slug?.trim() ? input.slug.trim()
      : input.name ? slugify(input.name)
      : undefined;

    await tx.product.update({
      where: { id },
      data: {
        ...(input.name != null ? { name: input.name } : {}),
        ...(slug != null ? { slug } : {}),
        ...(input.description != null ? { description: input.description } : {}),
        ...(input.price != null ? { price: new Prisma.Decimal(input.price).toFixed(2) } : {}),
        ...(input.categoryId != null ? { categoryId: input.categoryId } : {}),
        ...(input.images != null ? { images: input.images } : {}),
        ...(input.featured != null ? { featured: input.featured } : {}),
        ...(input.isActive != null ? { isActive: input.isActive } : {}),
      },
    });

    if (input.variants != null && input.variants.length > 0) {
      const existing = await tx.productVariant.findMany({
        where: { productId: id },
        select: { id: true, sku: true },
      });
      const existingBySku = new Map(existing.map((variant) => [variant.sku, variant.id]));
      const inputSkus = new Set(input.variants!.map((variant) => variant.sku));

      for (const variant of input.variants) {
        const existingId = existingBySku.get(variant.sku);
        const data = {
          color: variant.color?.trim() ? variant.color.trim() : null,
          size: variant.size?.trim() ? variant.size.trim() : null,
          stock: variant.stock ?? 0,
        };
        if (existingId) {
          await tx.productVariant.update({ where: { id: existingId }, data });
        } else {
          await tx.productVariant.create({
            data: { productId: id, sku: variant.sku, ...data },
          });
        }
      }

      // Variant dibuang dari senarai: delete hanya jika tiada rujukan order.
      // Satu query untuk semua variant yang dibuang + satu deleteMany, bukan
      // count() + delete() setiap variant (N+1).
      const removed = existing.filter((variant) => !inputSkus.has(variant.sku));
      if (removed.length > 0) {
        const referenced = await tx.orderItem.findMany({
          where: { variantId: { in: removed.map((variant) => variant.id) } },
          select: { variantId: true },
          distinct: ["variantId"],
        });
        const referencedIds = new Set(referenced.map((row) => row.variantId));
        const deletableIds = removed
          .filter((variant) => !referencedIds.has(variant.id))
          .map((variant) => variant.id);
        if (deletableIds.length > 0) {
          await tx.productVariant.deleteMany({ where: { id: { in: deletableIds } } });
        }
      }
    }
  });
}

/**
 * Soft delete produk (DELETE /api/products/[id]): set isActive=false.
 * JANGAN hard delete - produk mungkin dirujuk OrderItem (Restrict).
 * Idempotent: produk yang sudah tidak aktif kekal tanpa error.
 */
export async function deactivateProduct(id: string): Promise<void> {
  const result = await db.product.updateMany({
    where: { id, isActive: true },
    data: { isActive: false },
  });

  if (result.count === 0) {
    const exists = await db.product.findUnique({ where: { id }, select: { id: true } });
    if (!exists) {
      throw new ApiError("NOT_FOUND", "Produk tidak ditemui.", 404);
    }
  }
}

export interface AdminProductListItem {
  id: string;
  name: string;
  slug: string;
  price: string;
  image: string;
  category: string;
  minStock: number;
  variantCount: number;
  isActive: boolean;
  featured: boolean;
}

/** Senarai SEMUA produk (aktif + tidak aktif) untuk jadual admin. */
export async function listAdminProducts(): Promise<AdminProductListItem[]> {
  const products = await db.product.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      images: true,
      isActive: true,
      featured: true,
      category: { select: { name: true } },
      variants: { select: { stock: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price.toString(),
    image: parseImages(product.images)[0] ?? "",
    category: product.category.name,
    minStock:
      product.variants.length > 0
        ? Math.min(...product.variants.map((variant) => variant.stock))
        : 0,
    variantCount: product.variants.length,
    isActive: product.isActive,
    featured: product.featured,
  }));
}

export interface AdminProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  images: string[];
  categoryId: string;
  featured: boolean;
  isActive: boolean;
  variants: Array<{
    id: string;
    color: string | null;
    size: string | null;
    sku: string;
    stock: number;
  }>;
}

/** Detail produk untuk form admin (termasuk featured/isActive). */
export async function getAdminProduct(id: string): Promise<AdminProductDetail> {
  const product = await db.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      price: true,
      images: true,
      categoryId: true,
      featured: true,
      isActive: true,
      variants: {
        select: { id: true, color: true, size: true, sku: true, stock: true },
        orderBy: { color: "asc" },
      },
    },
  });

  if (!product) {
    throw new ApiError("NOT_FOUND", "Produk tidak ditemui.", 404);
  }

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price.toString(),
    images: parseImages(product.images),
    categoryId: product.categoryId,
    featured: product.featured,
    isActive: product.isActive,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      color: variant.color,
      size: variant.size,
      sku: variant.sku,
      stock: variant.stock,
    })),
  };
}

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

/** Senarai kategori untuk dropdown form admin (API.md section 2 - GET /api/categories). */
export async function listCategories(): Promise<CategoryOption[]> {
  const categories = await db.category.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true },
  });
  return categories;
}
export interface ProductSlugEntry {
  slug: string;
  updatedAt: Date;
}
/**
 * Semua slug produk aktif + tarikh kemas kini untuk sitemap.
 * Dua kolum sahaja dan TIADA pagination: senarai penuh diambil dalam satu
 * query supaya sitemap tidak terpotong (sitemap lama guna listProducts dengan
 * pageSize 100, jadi produk ke-101 dan seterusnya tercicir).
 */
export async function listProductSlugs(): Promise<ProductSlugEntry[]> {
  return db.product.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
    orderBy: { createdAt: "desc" },
  });
}
