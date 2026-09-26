import type { MetadataRoute } from "next";

import { getCategories } from "@/lib/categories";
import { fallbackListProducts } from "@/lib/katalog-fallback";
import { JOURNAL_ENTRIES } from "@/lib/journal";
import { listProductSlugs } from "@/server/services/product.service";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://maisarabutik.vercel.app");

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
  { url: `${siteUrl}/koleksi`, changeFrequency: "daily", priority: 0.9 },
  { url: `${siteUrl}/journal`, changeFrequency: "weekly", priority: 0.7 },
  { url: `${siteUrl}/kisah-kami`, changeFrequency: "monthly", priority: 0.6 },
  { url: `${siteUrl}/tentang`, changeFrequency: "monthly", priority: 0.6 },
  { url: `${siteUrl}/hubungi-kami`, changeFrequency: "monthly", priority: 0.5 },
  { url: `${siteUrl}/soalan-lazim`, changeFrequency: "monthly", priority: 0.4 },
  { url: `${siteUrl}/penghantaran`, changeFrequency: "monthly", priority: 0.4 },
  { url: `${siteUrl}/pertukaran`, changeFrequency: "monthly", priority: 0.4 },
];

/**
 * Sitemap: halaman statik, kategori, SETIAP produk aktif dan setiap entri
 * journal.
 *
 * PDP kini di-index (spesifikasi 28 - kandungan produk mesti boleh di-crawl).
 * Senarai produk dibaca dengan `listProductSlugs()` - query dua kolum tanpa
 * pagination - supaya sitemap tidak pernah terpotong (sebelum ini pageSize 100
 * membuang produk ke-101 dan seterusnya) dan tidak menarik variants/reviews
 * yang tidak digunakan. Fallback katalog digunakan apabila DB tidak dapat
 * dicapai supaya sitemap tidak pernah kosong.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Kategori dan produk tidak bergantung antara satu sama lain.
  const [categories, products] = await Promise.all([getCategories(), getProductEntries()]);

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${siteUrl}/koleksi/${category.slug}`,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${siteUrl}/produk/${product.slug}`,
    ...(product.lastModified ? { lastModified: product.lastModified } : {}),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const journalRoutes: MetadataRoute.Sitemap = JOURNAL_ENTRIES.map((entry) => ({
    url: `${siteUrl}/journal/${entry.slug}`,
    lastModified: entry.publishedAt,
    changeFrequency: "yearly",
    priority: 0.5,
  }));

  return [...STATIC_ROUTES, ...categoryRoutes, ...productRoutes, ...journalRoutes];
}

interface SitemapProductEntry {
  slug: string;
  /** Tarikh kemas kini produk; fallback seed tiada tarikh. */
  lastModified?: Date;
}

async function getProductEntries(): Promise<SitemapProductEntry[]> {
  try {
    const rows = await listProductSlugs();
    return rows.map((row) => ({ slug: row.slug, lastModified: row.updatedAt }));
  } catch {
    return fallbackListProducts({ page: 1, pageSize: 100 }).items.map((item) => ({
      slug: item.slug,
    }));
  }
}
