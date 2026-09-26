import type { Metadata } from "next";

import { KoleksiView, type KoleksiSearchParams } from "@/components/shop/koleksi-view";
import { getCategories } from "@/lib/categories";

interface KoleksiPageProps {
  searchParams: Promise<KoleksiSearchParams>;
}

/**
 * Metadata katalog. `?category=<slug>` memaparkan senarai yang sama seperti
 * `/koleksi/<slug>`, jadi canonical diarahkan ke bentuk path itu (URL yang
 * disenaraikan dalam sitemap) supaya dua URL dengan kandungan sama tidak
 * bersaing. Tanpa kategori, canonical ialah /koleksi - tapisan (warna, saiz,
 * harga, carian) ialah subset katalog yang sama.
 */
export async function generateMetadata({
  searchParams,
}: KoleksiPageProps): Promise<Metadata> {
  const params = await searchParams;
  const categorySlug =
    typeof params.category === "string" ? params.category : undefined;
  const categories = await getCategories();
  const category = categories.find((item) => item.slug === categorySlug);

  return {
    title: category ? `Koleksi ${category.name} | Maisara` : "Shop All | Maisara",
    description:
      "Koleksi Maisara untuk hari biasa, hari istimewa dan segala yang di antaranya. Tudung, baju kurung, dress, abaya dan aksesori untuk hari-hari sebenar.",
    alternates: { canonical: category ? `/koleksi/${category.slug}` : "/koleksi" },
  };
}

export default function KoleksiPage({ searchParams }: KoleksiPageProps) {
  return <KoleksiView searchParams={searchParams} />;
}
