import type { MetadataRoute } from "next";

import { getCategories } from "@/lib/categories";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://maisarabutik.vercel.app");

/** Sitemap: halaman statik + kategori dinamik. Produk (PDP) tidak di-index (see sitemap). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categories = await getCategories();
  const base = [
    { url: `${siteUrl}/`, changeFrequency: "weekly" as const, priority: 1 },
    { url: `${siteUrl}/koleksi`, changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${siteUrl}/kisah-kami`, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${siteUrl}/penghantaran`, changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${siteUrl}/pertukaran`, changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${siteUrl}/hubungi-kami`, changeFrequency: "monthly" as const, priority: 0.4 },
  ];

  const categoryUrls = categories.map((category) => ({
    url: `${siteUrl}/koleksi/${category.slug}`,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [...base, ...categoryUrls];
}
