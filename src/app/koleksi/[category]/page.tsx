import type { Metadata } from "next";
import { notFound } from "next/navigation";

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
  // `notFound()` mesti dipanggil di sini, bukan hanya dalam komponen halaman:
  // `koleksi/loading.tsx` ialah sempadan Suspense, jadi Next.js menghantar
  // status 200 bersama rangka skeleton SEBELUM halaman sempat memanggil
  // notFound() - slug tidak sah memulangkan 200 + `index, follow`. Metadata
  // diselesaikan sebelum cangkerang dihantar, jadi ini memberi 404 sebenar.
  if (!categoryName) notFound();
  return {
    title: `Koleksi ${categoryName} | Maisara`,
    description: `Koleksi ${categoryName} untuk hari biasa dan hari istimewa. Sentuhan warisan untuk fesyen harian.`,
    alternates: { canonical: `/koleksi/${category}` },
  };
}

/**
 * /koleksi/[category] - render terus dengan kategori dari path (normalise
 * kepada /koleksi?category=<slug> oleh komponen view & sidebar).
 *
 * Slug kategori yang tidak dikenali -> 404. Sebelum ini sebarang slug (cth.
 * /koleksi/tidak-wujud) memaparkan katalog penuh dengan status 200 dan boleh
 * diindeks, iaitu kandungan pendua untuk URL sampah. Hanya kategori sebenar
 * yang wujud dalam DB (atau fallback seed bila DB tidak dapat dicapai)
 * diterima; URL kategori yang sah tidak terjejas.
 */
export default async function KoleksiCategoryPage({
  params,
  searchParams,
}: KoleksiCategoryPageProps) {
  const { category } = await params;
  const categories = await getCategories();
  if (!categories.some((item) => item.slug === category)) {
    notFound();
  }
  return <KoleksiView searchParams={searchParams} categoryParam={category} />;
}
