import Link from "next/link";

import { Button } from "@/components/ui/button";
import { FramedImage } from "@/components/ui/image-frame";
import { EDITORIAL_IMAGES } from "@/lib/product-images";

/**
 * Seksyen SIGNATURE (spesifikasi 12).
 *
 * Satu-satunya seksyen gelap pada halaman, dan sebab itu ia menjadi sauh
 * visual: permukaan MAISARA INK penuh dengan tipografi PAPER. Kontras kuat
 * ini sengaja tidak diulang di tempat lain.
 */
export function Signature() {
  return (
    <section className="border-b border-line bg-ink text-paper">
      <div className="shell grid grid-cols-1 items-center gap-12 py-(--space-section) lg:grid-cols-12 lg:gap-(--gutter)">
        <div className="lg:col-span-5">
          <p className="meta-label text-brass">04 · Signature</p>

          <h2 className="mt-6 text-display-l text-paper">
            Dipotong sekali, dipakai bertahun.
          </h2>

          <p className="mt-7 max-w-md text-body-lg text-paper/75">
            Siri Signature ialah kepingan yang kami ulang setiap tahun tanpa
            mengubah potongan asasnya. Bahan mungkin berbeza sedikit mengikut
            bekalan, tetapi jatuhan dan kemasannya kekal sama.
          </p>

          <ul className="mt-10 space-y-3 border-t border-paper/20 pt-7">
            {[
              "Potongan yang tidak berubah mengikut musim",
              "Kemasan dalam yang rapi dan tidak mengganggu",
              "Saiz disemak pada tubuh sebenar, bukan hanya pada pola",
            ].map((item) => (
              <li key={item} className="flex gap-3 text-body-sm text-paper/75">
                <span aria-hidden="true" className="mt-2 h-px w-4 shrink-0 bg-brass" />
                {item}
              </li>
            ))}
          </ul>

          <Button
            asChild
            size="lg"
            className="mt-10 border border-paper/30 bg-transparent text-paper hover:border-paper hover:bg-paper hover:text-ink"
          >
            <Link href="/koleksi">Lihat siri Signature</Link>
          </Button>
        </div>

        <div className="lg:col-span-7">
          <FramedImage
            src={EDITORIAL_IMAGES.heritage}
            alt="Model memakai kebaya hijau dalam ruang kayu berukir tradisional"
            ratio="16 / 9"
            sizes="(min-width: 1024px) 58vw, 100vw"
            frameClassName="border border-paper/15"
          />
        </div>
      </div>
    </section>
  );
}
