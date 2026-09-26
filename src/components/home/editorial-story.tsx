import Link from "next/link";

import { Reveal } from "@/components/shop/reveal";
import { Button } from "@/components/ui/button";
import { WideImage } from "@/components/ui/image-frame";
import { EDITORIAL_IMAGES } from "@/lib/product-images";

/**
 * Blok editorial kain dan tekstur (spesifikasi 12).
 *
 * Belahan 50/50 sebenar: imej menyentuh tepi kiri viewport manakala teks
 * duduk dalam margin yang lega di kanan. Ini memberi halaman satu seksyen
 * yang benar-benar full-bleed tanpa perlu helah margin negatif.
 */
export function EditorialStory() {
  return (
    <section className="border-b border-line bg-paper">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <WideImage
          src={EDITORIAL_IMAGES.stitch}
          alt="Jahitan tangan pada linen semula jadi, dilihat dekat"
          frameClassName="order-2 rounded-none border-0 lg:order-1"
          className="h-full min-h-[280px] lg:min-h-[560px]"
          sizes="(min-width: 1024px) 50vw, 100vw"
        />

        <div className="order-1 flex items-center px-5 py-14 md:px-16 lg:order-2 lg:py-24">
          <Reveal>
            <div className="max-w-xl">
              <p className="meta-label text-cocoa">03 · Bahan</p>
              <h2 className="mt-6 text-display-m text-ink">
                Kain yang berubah dengan pemakainya.
              </h2>
              <div className="mt-7 space-y-4 text-body-lg text-cocoa">
                <p>
                  Linen dan cotton yang kami pilih berasa sedikit kaku ketika
                  baharu, kemudian melembut selepas beberapa kali dipakai. Itulah
                  tanda serat semula jadi, bukan kecacatan.
                </p>
                <p>
                  Kami biarkan tepi kain selesai dengan jahitan yang kemas supaya
                  ia tahan lama, tanpa lapisan yang membuatkan kain terasa berat.
                </p>
              </div>
              <Button asChild variant="outline" className="mt-9">
                <Link href="/journal">Baca catatan bahan</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
