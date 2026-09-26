import { db } from "@/lib/db";

/**
 * Service wishlist (API.md section 6/7, UX.md Flow D).
 * Layer bebas transport: dipanggil oleh route handler dan halaman akaun.
 */

export interface WishlistItemShape {
  id: string; // id WishlistItem (untuk remove)
  createdAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: string;
    /** Imej pertama galeri; null apabila produk tiada imej. */
    image: string | null;
    /** Imej kedua galeri untuk hover kad; null apabila hanya ada satu imej. */
    hoverImage: string | null;
    minStock: number;
    /** Variant pertama yang ada stok (untuk quick add ProductCard). */
    quickAddVariant: {
      id: string;
      color: string | null;
      size: string | null;
      stock: number;
    } | null;
    avgRating: number | null;
    reviewCount: number;
  };
}

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

const WISHLIST_INCLUDE = {
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      images: true,
      variants: { select: { id: true, color: true, size: true, stock: true } },
      reviews: { where: { status: "APPROVED" }, select: { rating: true } },
    },
  },
} as const;

type WishlistRow = (typeof WISHLIST_INCLUDE)["product"]["select"] extends never
  ? never
  : {
      id: string;
      userId: string;
      productId: string;
      createdAt: Date;
      product: {
        id: string;
        name: string;
        slug: string;
        price: { toString(): string };
        images: unknown;
        variants: Array<{
          id: string;
          color: string | null;
          size: string | null;
          stock: number;
        }>;
        reviews: Array<{ rating: number }>;
      };
    };

function toShape(item: WishlistRow): WishlistItemShape {
  const stocks = item.product.variants.map((variant) => variant.stock);
  const ratings = item.product.reviews.map((review) => review.rating);

  return {
    id: item.id,
    createdAt: item.createdAt.toISOString(),
    product: {
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      price: item.product.price.toString(),
      image: parseImages(item.product.images)[0] ?? null,
      hoverImage: parseImages(item.product.images)[1] ?? null,
      minStock: stocks.length > 0 ? Math.min(...stocks) : 0,
      quickAddVariant: item.product.variants.find((variant) => variant.stock > 0) ?? null,
      avgRating:
        ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
          : null,
      reviewCount: ratings.length,
    },
  };
}

/**
 * Tambah produk ke wishlist user. Idempotent: jika sudah wujud, tiada
 * perubahan (upsert no-op) - elak duplicate (unique [userId, productId]).
 */
export async function addToWishlist(userId: string, productId: string): Promise<void> {
  await db.wishlistItem.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId },
    update: {},
  });
}

/** Buang produk dari wishlist user (no-op jika tiada). */
export async function removeFromWishlist(userId: string, productId: string): Promise<void> {
  await db.wishlistItem.deleteMany({ where: { userId, productId } });
}

/**
 * Senarai wishlist user (produk aktif sahaja, terbaru dahulu).
 * Shape produk sedia untuk ProductCard: image pertama, price string,
 * minStock dari variants, rating dari review APPROVED.
 */
export async function getWishlist(userId: string): Promise<WishlistItemShape[]> {
  const items = await db.wishlistItem.findMany({
    where: { userId, product: { isActive: true } },
    include: WISHLIST_INCLUDE,
    orderBy: { createdAt: "desc" },
  });

  return items.map(toShape);
}
