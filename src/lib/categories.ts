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

/** Kategori untuk nav header/footer, diurutkan ikut `order` naik. */
export async function getCategories(): Promise<NavCategory[]> {
  try {
    const categories = await db.category.findMany({
      orderBy: { order: "asc" },
      select: { name: true, slug: true },
    });
    return categories.length > 0 ? categories : FALLBACK_CATEGORIES;
  } catch {
    return FALLBACK_CATEGORIES;
  }
}
