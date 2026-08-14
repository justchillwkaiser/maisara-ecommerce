import type { Metadata } from "next";
import Link from "next/link";
import { Envelope, MapPin } from "@phosphor-icons/react/dist/ssr";

import { InfoPage } from "@/components/shared/info-page";

export const metadata: Metadata = {
  title: "Hubungi Kami | Maisara",
  description:
    "Hubungi Maisara untuk sebarang pertanyaan: email, lokasi butik, atau waktu operasi. Kami balas dalam 1-2 hari bekerja.",
};

/** Halaman info Hubungi Kami (backlog: footer link Bantuan). */
export default function HubungiKamiPage() {
  return (
    <InfoPage
      eyebrow="Bantuan"
      title="Hubungi Kami"
      intro="Ada soalan tentang pesanan, produk atau pertukaran? Kami sedia membantu. Balasan dalam 1-2 hari bekerja."
      sections={[
        {
          heading: "Emel",
          body: (
            <p className="flex items-center gap-2">
              <Envelope size={18} className="text-gold-deep" />
              <Link
                href="mailto:salam@maisara.my"
                className="text-gold-deep underline-offset-4 transition-colors hover:underline"
              >
                salam@maisara.my
              </Link>
            </p>
          ),
        },
        {
          heading: "Butik",
          body: (
            <p className="flex items-start gap-2">
              <MapPin size={18} className="mt-1 shrink-0 text-gold-deep" />
              <span>
                Maisara Studio
                <br />
                No. 21, Jalan Tan Hiok Nee,
                <br />
                80000 Johor Bahru, Johor
              </span>
            </p>
          ),
        },
        {
          heading: "Waktu operasi",
          body: (
            <p>
              Isnin hingga Sabtu, 10 pagi hingga 6 petang. Tutup pada hari
              Ahad dan cuti umum. Pertanyaan emel dijawab mengikut urutan
              diterima.
            </p>
          ),
        },
      ]}
    />
  );
}
