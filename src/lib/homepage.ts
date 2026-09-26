import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { fallbackListProducts } from "@/lib/katalog-fallback";
import type { ProductQuery } from "@/lib/validations/product";
import type { ProductSummary } from "@/server/services/product.service";
import { listRecentProducts } from "@/server/services/product.service";
/** Kategori seperti yang dipaparkan di homepage: nama, slug, imej wira, bilangan produk. */
export interface HomepageCategory {
  name: string;
  slug: string;
  image: string | null;
  productCount: number;
}
/** Ulasan sebenar pelanggan (status APPROVED sahaja). */
export interface HomepageReview {
  id: string;
  rating: number;
  comment: string;
  author: string;
  productName: string;
  productSlug: string;
}
/** Fallback kategori = data seed supaya render kekal hijau tanpa DB. */
const FALLBACK_CATEGORIES: HomepageCategory[] = [
  { name: "Tudung", slug: "tudung", image: null, productCount: 5 },
  { name: "Baju Kurung", slug: "baju-kurung", image: null, productCount: 5 },
  { name: "Dress", slug: "dress", image: null, productCount: 4 },
  { name: "Abaya", slug: "abaya", image: null, productCount: 4 },
  { name: "Aksesori", slug: "aksesori", image: null, productCount: 4 },
];
/** Query fallback seed mesti sepadan dengan query DB (susunan terbaharu). */
const HOMEPAGE_PRODUCT_QUERY: ProductQuery = { page: 1, pageSize: 4, sort: "newest" };
/**
 * Empat produk terbaharu untuk seksyen "Koleksi Baharu".
 *
 * `listRecentProducts` menjalankan SATU query pada kolum ringkasan sahaja
 * (tanpa `count`, kerana homepage tidak memaparkan jumlah).
 *
 * SENGAJA TIDAK DI-CACHE: harga dan stok ialah data inventori. Halaman ini
 * di-render dinamik (header membaca sesi), jadi cache TTL di sini akan
 * memaparkan harga/stok lapuk kepada pembeli. Setiap request membaca semula.
 * Fallback seed hanya digunakan bila DB tidak dapat dicapai atau kosong.
 */
export async function getHomepageProducts(): Promise<ProductSummary[]> {
  try {
    const items = await listRecentProducts(4);
    if (items.length > 0) return items;
    return fallbackListProducts(HOMEPAGE_PRODUCT_QUERY).items;
  } catch {
    return fallbackListProducts(HOMEPAGE_PRODUCT_QUERY).items;
  }
}
/**
 * Kategori homepage (nama, slug, imej wira, bilangan produk aktif).
 *
 * SEMI-STATIK: kategori jarang berubah, jadi query di-cache 5 minit supaya
 * header, footer dan homepage tidak mengulang query kategori yang sama pada
 * setiap request. `productCount` hanya kiraan paparan - bukan data transaksi.
 */
const getCategoriesCached = unstable_cache(
  async (): Promise<HomepageCategory[]> => {
    const categories = await db.category.findMany({
      orderBy: { order: "asc" },
      select: {
        name: true,
        slug: true,
        image: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
    });
    return categories.map((category) => ({
      name: category.name,
      slug: category.slug,
      image: category.image,
      productCount: category._count.products,
    }));
  },
  ["homepage-categories"],
  { revalidate: 300 },
);
export async function getHomepageCategories(): Promise<HomepageCategory[]> {
  try {
    const categories = await getCategoriesCached();
    return categories.length > 0 ? categories : FALLBACK_CATEGORIES;
  } catch {
    return FALLBACK_CATEGORIES;
  }
}
/**
 * Ulasan sebenar untuk seksyen suara pelanggan.
 *
 * Hanya ulasan APPROVED dipaparkan, dengan nama sebenar pemberi ulasan. Bila
 * tiada ulasan, pulangkan array kosong dan halaman memaparkan keadaan kosong —
 * nama dan ulasan pelanggan tidak pernah direka.
 *
 * SEMI-STATIK (kandungan awam, bukan data pengguna): tiga ulasan terbaru
 * di-cache 5 minit supaya setiap request homepage tidak menyentuh jadual
 * review. Ulasan khusus pengguna (borang, moderasi) tidak melalui laluan ini.
 */
const getReviewsCached = unstable_cache(
  async (): Promise<HomepageReview[]> => {
    const reviews = await db.review.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        rating: true,
        comment: true,
        user: { select: { name: true } },
        product: { select: { name: true, slug: true } },
      },
    });
    return reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      author: review.user.name?.trim() ? review.user.name : "Pelanggan Maisara",
      productName: review.product.name,
      productSlug: review.product.slug,
    }));
  },
  ["homepage-reviews"],
  { revalidate: 300 },
);
export async function getHomepageReviews(): Promise<HomepageReview[]> {
  try {
    return await getReviewsCached();
  } catch {
    return [];
  }
}
