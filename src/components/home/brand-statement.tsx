import { WideImage } from "@/components/ui/image-frame";
import { EDITORIAL_IMAGES } from "@/lib/product-images";

/**
 * Pernyataan jenama (spesifikasi 12). Satu ayat, ruang lega, tiada imej -
 * jeda yang disengajakan antara hero dan katalog supaya halaman tidak
 * bercakap tentang produk tanpa henti.
 */
export function BrandStatement() {
  return (
    <section className="border-b border-line bg-paper">
      <div className="shell pt-(--space-section) pb-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="meta-label text-cocoa">Falsafah kami</p>
          <p className="mt-7 text-display-m text-ink text-balance">
            Kami percaya pakaian yang baik tidak perlu terlalu bising.
          </p>
          <p className="mx-auto mt-7 max-w-xl text-body-lg text-cocoa">
            Setiap keping direka untuk dipakai berulang kali, bukan untuk satu
            majlis sahaja. Kami pilih kain yang jatuh dengan tenang, jahitan yang
            bertahan, dan siluet yang membenarkan anda bergerak seperti biasa.
          </p>
        </div>
      </div>

      {/* Jalur lookbook: tiga rupa dalam satu bingkai, sebagai jeda visual. */}
      <div className="shell pb-(--space-section)">
        <WideImage
          src={EDITORIAL_IMAGES.lookbook}
          alt="Tiga rupa baju kurung Maisara dalam warna mocha dan rosewood"
          sizes="(min-width: 1360px) 1360px, 100vw"
        />
      </div>
    </section>
  );
}
