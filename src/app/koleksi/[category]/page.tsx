import type { Metadata } from "next";

import { KoleksiView, type KoleksiSearchParams } from "@/components/shop/koleksi-view";
import { getCategories } from "@/lib/categories";

interface KoleksiCategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<KoleksiSearchParams>;
}

export async function generateMetadata({
  params,
}: KoleksiCategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const categories = await getCategories();
  const categoryName = categories.find((item) => item.slug === category)?.name;

  return {
    title: categoryName ? `Koleksi ${categoryName} | Maisara` : "Koleksi | Maisara",
    description: `Terokai koleksi ${categoryName ?? "pilihan"} Maisara. Sentuhan warisan untuk fesyen harian.`,
  };
}

/**
 * /koleksi/[category] - render terus dengan kategori dari path (normalise
 * kepada /koleksi?category=<slug> oleh komponen view & sidebar).
 */
export default async function KoleksiCategoryPage({
  params,
  searchParams,
}: KoleksiCategoryPageProps) {
  const { category } = await params;
  return <KoleksiView searchParams={searchParams} categoryParam={category} />;
}
