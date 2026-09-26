import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { FramedImage } from "@/components/ui/image-frame";
import { EDITORIAL_IMAGES } from "@/lib/product-images";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Kisah Kami | Maisara",
  description:
    "Kisah Maisara: bermula dari sebuah mesin jahit di Johor, dan cara kami memilih fabrik, potongan serta penjagaan untuk pemakaian harian.",
};

/**
 * Satu babak kisah jenama: numeral mono, tajuk serif, badan prosa dan satu imej
 * editorial. Komposisi berselang-seli (imej kiri / kanan) supaya halaman
 * bergerak seperti majalah, bukan senarai kad.
 *
 * Susunan DOM sentiasa teks dahulu, imej kemudian. Kedudukan visual diatur oleh
 * `col-start` pada grid 12 lajur, jadi pengguna pembaca skrin mendengar naratif
 * sebelum imej tanpa mengira sebelah mana imej diletakkan.
 */
function Chapter({
  numeral,
  label,
  title,
  image,
  imageAlt,
  reverse = false,
  children,
}: {
  numeral: string;
  label: string;
  title: string;
  image: string;
  imageAlt: string;
  reverse?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="shell py-(--space-section-lg)">
      <div className="grid-12 items-center gap-y-10">
        <div
          className={cn(
            "col-span-12 lg:col-span-5 lg:row-start-1",
            reverse ? "lg:col-start-8" : "lg:col-start-1",
          )}
        >
          <p className="meta-label text-cocoa">
            {numeral} {label}
          </p>
          <h2 className="mt-6 max-w-[18ch] font-display text-h1 text-ink">
            {title}
          </h2>
          <div className="mt-6 space-y-5 text-body text-cocoa">{children}</div>
        </div>

        <div
          className={cn(
            "col-span-12 lg:col-span-6 lg:row-start-1",
            reverse ? "lg:col-start-1" : "lg:col-start-7",
          )}
        >
          <FramedImage
            src={image}
            alt={imageAlt}
            ratio="4 / 3"
            rounded="sm"
            sizes="(min-width: 1024px) 46vw, 92vw"
          />
        </div>
      </div>
    </section>
  );
}

/**
 * Kisah Kami (spesifikasi 19). Halaman ini ialah naratif editorial, bukan
 * kad About Us: empat babak bernombor, imej sebenar penuh lebar dan komposisi
 * berselang-seli. Semua imej ialah gambar produk sebenar yang dikomposisi
 * secara editorial, kerana tiada fotografi butik dalam repo ini.
 */
export default function KisahKamiPage() {
  return (
    <div>
      <header className="shell pt-(--space-section-lg) pb-(--space-section)">
        <p className="meta-label text-cocoa">Our Story</p>
        <h1 className="mt-6 max-w-[24ch] font-display text-display-l text-ink">
          It started with a sewing machine.
        </h1>
        <p className="mt-8 max-w-[58ch] text-body-lg text-cocoa">
          Bermula daripada satu mesin jahit di Johor, Maisara menyediakan
          pakaian yang dibuat untuk dipakai berulang kali: tenang pada
          pandangan, selesa pada badan, dan cukup tahan untuk hari yang
          panjang.
        </p>
      </header>

      <div className="shell">
        <div className="bleed">
          <FramedImage
            src={EDITORIAL_IMAGES.atelier}
            alt="Imej editorial koleksi baju kurung Maisara"
            ratio="3 / 2"
            rounded="none"
            preload
            sizes="100vw"
          />
        </div>
        <p className="meta-label mt-4 text-cocoa">
          Johor, tempat kerja ini bermula
        </p>
      </div>

      <Chapter
        numeral="01"
        label="The Beginning"
        title="Sebuah mesin jahit, satu meja, dan kain yang tidak dibuang"
        image={EDITORIAL_IMAGES.atelier}
        imageAlt="Imej editorial baju kurung Maisara pada penyangkut"
      >
        <p>
          Maisara bermula di Johor dengan kerja yang kecil: menjahit untuk
          keluarga sendiri. Ukuran diambil dengan pita, pola dilukis di atas
          kertas, dan percubaan yang tidak menjadi tetap disimpan.
        </p>
        <p>
          Daripada kerja itu datang satu tabiat yang masih kekal: memeriksa
          bahagian dalam pakaian sebelum apa-apa yang lain. Tepi yang kemas
          menentukan berapa lama sehelai pakaian bertahan.
        </p>
        <p>
          Kami tidak bermula dengan rancangan besar. Kami bermula dengan soalan
          yang mudah: bolehkah kami membuat pakaian yang benar-benar selesa
          dipakai di cuaca ini.
        </p>
      </Chapter>

      <Chapter
        numeral="02"
        label="The Craft"
        title="Kerja yang tidak tergesa-gesa"
        image={EDITORIAL_IMAGES.everyday}
        imageAlt="Imej editorial dress Maisara"
        reverse
      >
        <p>
          Setiap helaian melalui urutan yang sama: pilih fabrik, uji jatuhnya,
          potong mengikut pola, jahit, kemudian periksa semula bahagian dalam.
        </p>
        <p>
          Fabrik dipilih mengikut tujuan. Kapas dan voal untuk lapisan yang
          bernafas, satin untuk garis yang lurus, dan campuran yang mengandungi
          sedikit gentian anjal untuk pakaian yang perlu mengekalkan bentuk
          sepanjang hari.
        </p>
        <p>
          Sebahagian corak kami meminjam bahasa kain warisan: satu jalur halus,
          satu motif kecil di hujung kain. Ia hadir sebagai butiran, bukan
          sebagai pameran.
        </p>
        <p>
          Tiada jalan pintas pada bahagian yang tidak kelihatan. Butang, zip dan
          kelim dibuat untuk bertahan lebih lama daripada musim pertama.
        </p>
      </Chapter>

      <div className="shell">
        <div className="bleed">
          <FramedImage
            src={EDITORIAL_IMAGES.stitch}
            alt="Imej editorial koleksi tudung Maisara"
            ratio="3 / 2"
            rounded="none"
            sizes="100vw"
          />
        </div>
        <p className="meta-label mt-4 text-cocoa">
          Voal, kapas dan satin menentukan jatuh sesuatu pakaian
        </p>
      </div>

      <Chapter
        numeral="03"
        label="The Everyday"
        title="Pakaian yang tidak perlu difikirkan"
        image={EDITORIAL_IMAGES.heritage}
        imageAlt="Imej editorial abaya Maisara"
      >
        <p>
          Pelanggan kami memakai pakaian ini untuk bekerja, memandu, menghantar
          anak ke sekolah dan bersolat. Semua itu berlaku dalam satu hari yang
          sama.
        </p>
        <p>
          Sebab itu keselesaan diuji pada jam yang paling lewat, bukan hanya
          semasa kali pertama dipakai. Lengan yang betul ketika memandu, bahu
          yang tidak menekan, dan leher yang tidak perlu ditarik sepanjang
          masa.
        </p>
        <p>
          Warna dipilih supaya mudah dipadankan antara satu sama lain dan mudah
          dijaga. Warna gelap bertahan lebih lama, warna cerah simpan untuk hari
          yang lebih lapang.
        </p>
        <p>
          Jika sesuatu tidak sesuai selepas dipakai, tukar dalam tujuh hari.
          Saiz yang betul lebih berharga daripada koleksi yang banyak.
        </p>
      </Chapter>

      <Chapter
        numeral="04"
        label="Maisara Today"
        title="Kerja yang sama, dengan lebih ramai orang"
        image={EDITORIAL_IMAGES.drape}
        imageAlt="Imej editorial aksesori Maisara"
        reverse
      >
        <p>
          Hari ini Maisara beroperasi dari studio di Johor Bahru. Koleksi kami
          merangkumi tudung, baju kurung, dress, abaya dan aksesori.
        </p>
        <p>
          Yang tidak berubah ialah cara kami memutuskan: fabrik dahulu, kemudian
          bentuk. Harga mengikut bahan dan kerja yang terlibat.
        </p>
        <p>
          Kami juga menulis tentang bahan, penjagaan dan potongan di dalam
          Journal, supaya anda boleh membuat pilihan dengan yakin walaupun
          sebelum kain itu berada di tangan anda.
        </p>
      </Chapter>

      <section className="shell pb-(--space-section-lg)">
        <div className="border-t border-line pt-12">
          <p className="max-w-[30ch] font-display text-h2 text-ink">
            Lihat apa yang kami jahit setakat ini.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button asChild size="lg">
              <Link href="/koleksi">
                Terokai Koleksi
                <ArrowRight size={16} weight="light" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="link" size="lg">
              <Link href="/journal">Baca Journal</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}