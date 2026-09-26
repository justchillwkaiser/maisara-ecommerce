import { getImageProps } from "next/image";

/**
 * Preload imej LCP daripada KOMPONEN PELAYAN.
 *
 * Mengapa ini wujud: `loading.tsx` pada satu laluan mencipta sempadan Suspense,
 * jadi Next.js menghantar `<head>` sebelum kandungan halaman dirender. `<link
 * rel="preload">` yang dijana oleh `preload` pada <Image> di dalam sempadan itu
 * kemudiannya jatuh ~60KB ke dalam <body> — terlalu lewat untuk membantu LCP.
 * Diukur pada /produk/[slug]: permintaan imej LCP bermula pada 488ms (FCP 76ms).
 * Bila pautan yang sama dirender oleh komponen pelayan di awal pokok, ia
 * dihantar pada ~2KB dan perayau menemui imej LCP hampir serta-merta.
 *
 * `getImageProps` digunakan supaya srcSet/sizes yang di-preload SAMA PERSIS
 * dengan yang dirender oleh <Image> — jika berbeza, pelayar akan memuat turun
 * dua varian imej yang sama.
 */
export function CriticalImagePreload({
  src,
  sizes,
}: {
  /** Imej LCP; `null`/kosong tidak menghasilkan apa-apa. */
  src: string | null | undefined;
  /** Mesti sama dengan `sizes` pada <Image> yang merender imej ini. */
  sizes: string;
}) {
  if (!src) return null;
  const { props } = getImageProps({
    src,
    alt: "",
    fill: true,
    sizes,
  });
  return (
    <link
      rel="preload"
      as="image"
      imageSrcSet={props.srcSet}
      imageSizes={props.sizes}
      fetchPriority="high"
    />
  );
}
