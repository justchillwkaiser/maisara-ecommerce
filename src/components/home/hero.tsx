import Link from "next/link";

import { Button } from "@/components/ui/button";
import { FramedImage } from "@/components/ui/image-frame";
import { EDITORIAL_IMAGES } from "@/lib/product-images";

/**
 * Fakta ringkas yang benar-benar disokong oleh katalog dan dasar kedai:
 * bahan yang memang ada, julat saiz sebenar, dan liputan penghantaran.
 * Tiada angka atau jaminan yang direka.
 */
const HERO_FACTS = [
  { term: "Bahan", detail: "Voal, cotton, linen, satin" },
  { term: "Saiz", detail: "Satu saiz dan XS–XL" },
  { term: "Penghantaran", detail: "Seluruh Malaysia" },
] as const;

/**
 * Hero homepage (spesifikasi 12).
 *
 * Komposisi editorial dua kolum pada permukaan PAPER: tipografi di kiri,
 * fotografi sebenar di kanan. Hero ini sengaja bukan seksyen gelap kerana
 * reka bentuk menetapkan SIGNATURE sahaja yang gelap, dan permukaan paper
 * memastikan tipografi kekal boleh dibaca pada setiap saiz skrin.
 */
export function Hero() {
  return (
    <section className="border-b border-line bg-paper">
      <div className="shell grid grid-cols-1 items-center gap-10 py-12 lg:grid-cols-12 lg:gap-(--gutter) lg:py-16">
        <div className="flex flex-col justify-center lg:col-span-5">
          <p className="meta-label text-cocoa">Koleksi 2026 · Dijahit di Malaysia</p>

          <h1 className="mt-6 text-display-xl text-ink">
            Warisan, <em>dibentuk semula.</em>
          </h1>

          <p className="mt-7 max-w-md text-body-lg text-cocoa">
            Siluet moden, tekstur yang terasa dekat dan pakaian yang direka untuk
            kehidupan sebenar.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg">
              <Link href="/koleksi">Shop New Arrivals</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/kisah-kami">Discover Maisara</Link>
            </Button>
          </div>

          <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-6">
            {HERO_FACTS.map((fact) => (
              <div key={fact.term}>
                <dt className="meta-label text-cocoa">{fact.term}</dt>
                <dd className="mt-2 text-body-sm text-ink">{fact.detail}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:col-span-7">
          <FramedImage
            src={EDITORIAL_IMAGES.signature}
            alt="Model memakai set berlapis warna coklat Maisara di ruang yang terang"
            ratio="16 / 9"
            preload
            className="lg:max-h-[74vh]"
            sizes="(min-width: 1024px) 58vw, 100vw"
          />
        </div>
      </div>
    </section>
  );
}
