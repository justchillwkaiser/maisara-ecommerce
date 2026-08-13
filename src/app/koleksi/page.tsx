import type { Metadata } from "next";

import { KoleksiView, type KoleksiSearchParams } from "@/components/shop/koleksi-view";
import { getCategories } from "@/lib/categories";

interface KoleksiPageProps {
  searchParams: Promise<KoleksiSearchParams>;
}

export async function generateMetadata({
  searchParams,
}: KoleksiPageProps): Promise<Metadata> {
  const params = await searchParams;
  const categorySlug =
    typeof params.category === "string" ? params.category : undefined;
  const categories = await getCategories();
  const categoryName = categories.find((category) => category.slug === categorySlug)?.name;

  return {
    title: categoryName ? `Koleksi ${categoryName} | Maisara` : "Koleksi | Maisara",
    description:
      "Terokai koleksi Maisara: tudung, baju kurung, dress, abaya dan aksesori. Sentuhan warisan untuk fesyen harian.",
  };
}

export default function KoleksiPage({ searchParams }: KoleksiPageProps) {
  return <KoleksiView searchParams={searchParams} />;
}
