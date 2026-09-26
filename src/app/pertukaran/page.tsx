import type { Metadata } from "next";
import Link from "next/link";

import { InfoPage } from "@/components/shared/info-page";

export const metadata: Metadata = {
  title: "Pertukaran | Maisara",
  description:
    "Dasar pertukaran Maisara: tukar saiz atau warna dalam 7 hari selepas pesanan diterima, item belum dipakai dengan label utuh, dan cara memohon pertukaran.",
};

/** Halaman info Pertukaran (spesifikasi 22). Tetingkap 7 hari, telus dan mudah. */
export default function PertukaranPage() {
  return (
    <InfoPage
      eyebrow="Bantuan"
      title="Pertukaran"
      intro="Kami mahu anda selesa dengan setiap helaian Maisara. Jika saiz atau warna tidak sesuai, proses pertukaran mudah dan telus."
      sections={[
        {
          heading: "Syarat pertukaran",
          body: (
            <ul className="list-disc space-y-2 pl-5">
              <li>Permohonan dalam 7 hari selepas pesanan diterima.</li>
              <li>Item belum dipakai, belum dicuci dan label masih utuh.</li>
              <li>Resit atau nombor pesanan asal diperlukan.</li>
              <li>
                Item diskaun akhir dan aksesori intim tidak layak ditukar.
              </li>
              <li>
                Pertukaran tertakluk kepada stok pengganti yang masih
                tersedia.
              </li>
            </ul>
          ),
        },
        {
          heading: "Cara memohon",
          body: (
            <>
              <p>
                Hubungi kami melalui halaman{" "}
                <Link
                  href="/hubungi-kami"
                  className="text-ink underline underline-offset-4"
                >
                  Hubungi Kami
                </Link>{" "}
                dengan memilih topik Bantuan Pesanan, sertakan nombor pesanan
                dan sebab pertukaran.
              </p>
              <p>
                Kami akan sahkan stok pengganti dan berikan panduan
                penghantaran balik sebelum anda menghantar apa-apa. Jangan
                hantar item sebelum kami sahkan, supaya parcel itu tidak
                tersalah urus.
              </p>
              <p>
                Pertukaran saiz atau warna tidak dikenakan bayaran tambahan.
              </p>
            </>
          ),
        },
        {
          heading: "Masa pemprosesan",
          body: (
            <p>
              Pertukaran diproses dalam 3-5 hari bekerja selepas item sampai
              kepada kami. Item pengganti dihantar selepas semakan selesai, dan
              anda akan menerima pengesahan apabila ia keluar dari studio.
            </p>
          ),
        },
        {
          heading: "Item rosak atau tidak sepadan",
          body: (
            <p>
              Jika item yang diterima rosak atau berbeza daripada pesanan,
              hubungi kami dalam 7 hari dengan nombor pesanan dan gambar item
              tersebut. Kami akan semak dengan rekod pesanan sebelum menentukan
              langkah seterusnya.
            </p>
          ),
        },
        {
          heading: "Sebelum menghantar balik",
          body: (
            <p>
              Bungkus item dengan kemas dan sertakan nota ringkas berisi nombor
              pesanan. Simpan nombor penjejakan penghantaran balik sehingga
              pertukaran selesai, kerana kami memerlukannya jika parcel
              tersalah tempat.
            </p>
          ),
        },
      ]}
    />
  );
}