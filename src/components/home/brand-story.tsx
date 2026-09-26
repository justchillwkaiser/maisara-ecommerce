import Link from "next/link";

import { Reveal } from "@/components/shop/reveal";
import { Button } from "@/components/ui/button";
import { WideImage } from "@/components/ui/image-frame";
import { EDITORIAL_IMAGES } from "@/lib/product-images";

/**
 * Kisah jenama (spesifikasi 12). Nada kisah, bukan jualan: imej atelier
 * dengan teks pendek yang mengajak ke halaman cerita penuh.
 */
export function BrandStory() {
  return (
    <section className="border-b border-line bg-paper">
      <div className="shell grid grid-cols-1 items-center gap-12 py-(--space-section) lg:grid-cols-12 lg:gap-(--gutter)">
        <div className="lg:col-span-6">
          <WideImage
            src={EDITORIAL_IMAGES.atelier}
            alt="Dua tukang jahit bekerja di meja dengan kain linen dan mesin jahit"
            sizes="(min-width: 1024px) 48vw, 100vw"
          />
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          <Reveal>
            <p className="meta-label text-cocoa">06 · Cerita kami</p>
            <h2 className="mt-6 text-display-m text-ink">
              Bermula dengan sebuah mesin jahit.
            </h2>
            <div className="mt-7 space-y-4 text-body-lg text-cocoa">
              <p>
                Maisara bermula sebagai kerja dari rumah: satu mesin jahit, satu
                meja potong, dan pesanan daripada kawan kepada kawan.
              </p>
              <p>
                Cara kerja itu masih sama. Kami masih memotong dalam kumpulan
                kecil, menyemak setiap kepingan dengan tangan, dan menghantar
                sendiri pesanan yang keluar.
              </p>
            </div>
            <Button asChild variant="outline" className="mt-9">
              <Link href="/kisah-kami">Baca cerita penuh</Link>
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
