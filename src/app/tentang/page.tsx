import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Tentang | Maisara",
  description:
    "Tentang Maisara: apa yang kami buat, untuk siapa, cara helaian disiapkan dan bahan yang kami pilih. Butik modest fashion dari Johor Bahru.",
};

/**
 * Empat soalan yang pembaca baru mahu jawapannya, dalam bahasa yang konkrit.
 * Setiap jawapan ialah prosa, bukan senarai ciri, supaya halaman ini kekal
 * sebagai halaman editorial dan bukan kad pemasaran.
 */
const SECTIONS: { label: string; title: string; body: string[] }[] = [
  {
    label: "Apa yang kami buat",
    title: "Pakaian harian untuk wanita Malaysia",
    body: [
      "Koleksi kami merangkumi tudung, baju kurung, dress, abaya dan aksesori. Semuanya direka untuk dipakai berulang kali, bukan disimpan untuk majlis tertentu.",
      "Setiap helaian bermula daripada satu soalan yang sama: adakah ia selesa dipakai sepanjang hari di cuaca ini. Jika jawapannya tidak, ia tidak masuk ke koleksi.",
    ],
  },
  {
    label: "Untuk siapa",
    title: "Untuk hari yang panjang",
    body: [
      "Pakaian kami dipakai oleh wanita yang memandu, bekerja, mengurus keluarga dan bersolat dalam satu hari yang sama. Ruang untuk bergerak lebih penting daripada garis yang ketat.",
      "Kami tidak menyediakan satu saiz untuk semua orang. Saiz dan potongan berbeza mengikut bentuk baju, dan setiap kategori mempunyai ukuran yang dijelaskan pada halaman produk.",
    ],
  },
  {
    label: "Cara ia dibuat",
    title: "Fabrik dahulu, kemudian bentuk",
    body: [
      "Kami memilih fabrik sebelum melukis pola, kerana bahan menentukan jatuh, berat dan cara pakaian itu bergerak. Kapas dan voal untuk lapisan yang bernafas, satin untuk garis yang lurus, dan campuran yang mengandungi sedikit gentian anjal untuk pakaian yang perlu mengekalkan bentuk.",
      "Selepas dipotong dan dijahit, setiap helaian diperiksa pada bahagian dalam: tepi, kelim, butang dan zip. Bahagian yang tidak kelihatan ialah bahagian yang paling menentukan berapa lama sesuatu pakaian bertahan.",
    ],
  },
  {
    label: "Bahan dan penjagaan",
    title: "Belanja yang dipakai, bukan disimpan",
    body: [
      "Kebanyakan fabrik kami mudah dijaga: air sejuk, sabun lembut dan kering di tempat berlorek. Kami menulis langkah penjagaan untuk setiap bahan di dalam Journal supaya pakaian kekal elok lebih lama.",
      "Apabila sesuatu tidak sesuai selepas diterima, tukar dalam tujuh hari. Kami lebih suka pelanggan memakai helaian yang betul daripada menyimpan helaian yang tidak muat.",
    ],
  },
];

/**
 * Halaman Tentang (pautan navigasi utama). Ringkas dan editorial: satu lajur
 * label mono di kiri, prosa di kanan, kemudian pautan ke kisah jenama dan
 * Journal. Tiada dakwaan tentang anugerah, sejarah atau angka yang tidak
 * disahkan oleh rekod sebenar Maisara.
 */
export default function TentangPage() {
  return (
    <div className="pb-(--space-section-lg)">
      <header className="shell pt-(--space-section-lg) pb-(--space-section)">
        <p className="meta-label text-cocoa">Tentang</p>
        <h1 className="mt-6 max-w-[22ch] font-display text-display-l text-ink">
          Pakaian yang dibuat untuk dipakai
        </h1>
        <p className="mt-8 max-w-[58ch] text-body-lg text-cocoa">
          Maisara ialah butik modest fashion dari Johor Bahru. Kami menyediakan
          pakaian harian yang tenang pada pandangan dan selesa pada badan,
          dengan bahan yang dijelaskan secara terbuka.
        </p>
      </header>

      <div className="shell">
        {SECTIONS.map((section) => (
          <section
            key={section.label}
            className="grid-12 gap-y-4 border-t border-line py-(--space-section)"
          >
            <p className="meta-label col-span-12 text-cocoa md:col-span-3">
              {section.label}
            </p>
            <div className="col-span-12 md:col-span-9 md:col-start-4">
              <h2 className="max-w-[24ch] font-display text-h2 text-ink">
                {section.title}
              </h2>
              <div className="mt-6 max-w-[62ch] space-y-5 text-body text-cocoa">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </section>
        ))}

        <div className="border-t border-line pt-12">
          <div className="flex flex-wrap items-center gap-4">
            <Button asChild size="lg">
              <Link href="/kisah-kami">
                Baca Kisah Kami
                <ArrowRight size={16} weight="light" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/journal">Baca Journal</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}