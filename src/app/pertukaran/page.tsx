import type { Metadata } from "next";

import { InfoPage } from "@/components/shared/info-page";

export const metadata: Metadata = {
  title: "Pertukaran | Maisara",
  description:
    "Dasar pertukaran Maisara: tukar saiz atau warna dalam 7 hari, item belum dipakai, dengan resit asal. Tiada em-dash dalam copy (AGENTS.md).",
};

/** Halaman info Pertukaran (backlog: footer link Bantuan). */
export default function PertukaranPage() {
  return (
    <InfoPage
      eyebrow="Bantuan"
      title="Pertukaran"
      intro="Kami mahu anda selesa dengan setiap helaian Maisara. Jika tidak sesuai, proses pertukaran mudah dan telus."
      sections={[
        {
          heading: "Syarat pertukaran",
          body: (
            <ul className="list-disc space-y-2 pl-5">
              <li>Permohonan dalam 7 hari selepas pesanan diterima.</li>
              <li>Item belum dipakai, belum dicuci dan label masih utuh.</li>
              <li>Resit atau nombor pesanan asal diperlukan.</li>
              <li>Item diskaun akhir dan aksesori intim tidak layak ditukar.</li>
            </ul>
          ),
        },
        {
          heading: "Cara memohon",
          body: (
            <p>
              Hubungi kami melalui halaman Hubungi Kami dengan nombor pesanan
              dan sebab pertukaran. Kami akan sahkan stok pengganti dan beri
              panduan penghantaran balik. Pertukaran saiz atau warna tidak
              dikenakan bayaran tambahan.
            </p>
          ),
        },
        {
          heading: "Masa pemprosesan",
          body: (
            <p>
              Pertukaran diproses dalam 3-5 hari bekerja selepas item sampai
              kepada kami. Item pengganti dihantar selepas semakan selesai.
            </p>
          ),
        },
      ]}
    />
  );
}
