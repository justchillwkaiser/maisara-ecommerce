import { unstable_cache } from "next/cache";

import { db } from "@/lib/db";

export interface NavCategory {
  name: string;
  slug: string;
}

/**
 * Fallback = data seed (prisma/seed.ts) supaya render/build kekal hijau
 * walaupun DATABASE_URL tidak boleh dicapai (cth. dev machine offline).
 * Bila DB hidup, kategori sebenar dari DB digunakan.
 */
const FALLBACK_CATEGORIES: NavCategory[] = [
  { name: "Tudung", slug: "tudung" },
  { name: "Baju Kurung", slug: "baju-kurung" },
  { name: "Dress", slug: "dress" },
  { name: "Abaya", slug: "abaya" },
  { name: "Aksesori", slug: "aksesori" },
];

/**
 * Query DB yang di-cache (5 minit). Kategori jarang berubah - header,
 * footer, koleksi dan metadata memanggil fungsi ini pada setiap request;
 * cache mengelakkan query berulang untuk data yang sama.
 * NOTA: unstable_cache hanya mengunci hasil BERJAYA. Jika query throw
 * (DB offline), panggilan seterusnya cuba lagi - fallback kekal di luar.
 */
const getCategoriesCached = unstable_cache(
  async (): Promise<NavCategory[]> => {
    const categories = await db.category.findMany({
      orderBy: { order: "asc" },
      select: { name: true, slug: true },
    });
    return categories.length > 0 ? categories : FALLBACK_CATEGORIES;
  },
  ["kategori-nav"],
  { revalidate: 300 },
);

/** Kategori untuk nav header/footer, diurutkan ikut `order` naik. */
export async function getCategories(): Promise<NavCategory[]> {
  try {
    return await getCategoriesCached();
  } catch {
    return FALLBACK_CATEGORIES;
  }
}
