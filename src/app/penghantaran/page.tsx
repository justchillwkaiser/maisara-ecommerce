import type { Metadata } from "next";
import Link from "next/link";

import { InfoPage } from "@/components/shared/info-page";
import { formatRM } from "@/lib/format";
import { SHIPPING_METHODS } from "@/lib/shipping";

export const metadata: Metadata = {
  title: "Penghantaran | Maisara",
  description:
    "Maklumat penghantaran Maisara: kaedah J&T Express dan Pos Laju, kadar Semenanjung dan Timur Malaysia, masa pemprosesan dan cara menyemak status pesanan.",
};

/**
 * Halaman info Penghantaran (spesifikasi 22). Kadar datang daripada
 * `SHIPPING_METHODS` supaya paparan dan pengiraan checkout sentiasa sepadan;
 * tiada angka ditulis semula di dalam halaman.
 */
export default function PenghantaranPage() {
  return (
    <InfoPage
      eyebrow="Bantuan"
      title="Penghantaran"
      intro="Kami menghantar pesanan ke seluruh Malaysia dan mengira kadar mengikut negeri alamat anda. Pilih kaedah penghantaran semasa checkout."
      sections={[
        {
          heading: "Kaedah dan kadar",
          body: (
            <ul className="border-t border-line">
              {SHIPPING_METHODS.map((method) => (
                <li key={method.id} className="border-b border-line py-6">
                  <p className="font-display text-h3 text-ink">{method.label}</p>
                  <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="meta-label text-cocoa">Semenanjung</dt>
                      <dd className="font-mono text-body-sm text-ink">
                        {formatRM(method.feeSemenanjung)}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="meta-label text-cocoa">Sabah, Sarawak, Labuan</dt>
                      <dd className="font-mono text-body-sm text-ink">
                        {formatRM(method.feeTimur)}
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-body-sm text-cocoa">
                    Anggaran sampai: {method.eta} selepas pesanan dihantar.
                  </p>
                </li>
              ))}
            </ul>
          ),
        },
        {
          heading: "Zon penghantaran",
          body: (
            <>
              <p>
                Semenanjung merangkumi Johor, Kedah, Kelantan, Melaka, Negeri
                Sembilan, Pahang, Perak, Perlis, Pulau Pinang, Selangor,
                Terengganu, Kuala Lumpur dan Putrajaya. Sabah, Sarawak dan
                Labuan dikira zon Timur.
              </p>
              <p>
                Kadar dikira daripada negeri yang anda pilih pada alamat
                penghantaran. Jika negeri tersalah pilih, kadar yang dipaparkan
                juga akan tersalah, jadi semak alamat sebelum membayar.
              </p>
            </>
          ),
        },
        {
          heading: "Masa pemprosesan dan penghantaran",
          body: (
            <>
              <p>
                Pesanan diproses dalam 1-2 hari bekerja selepas pembayaran
                disahkan. Selepas pesanan diserahkan kepada kurier, anggaran
                sampai ialah 2-4 hari bekerja.
              </p>
              <p>
                Hujung minggu dan cuti umum tidak dikira dalam anggaran ini.
                Tempoh kurier boleh berubah semasa musim perayaan.
              </p>
            </>
          ),
        },
        {
          heading: "Menyemak status pesanan",
          body: (
            <>
              <p>
                Status dan sejarah pesanan boleh dilihat dalam akaun anda di
                halaman Order selepas log masuk. Setiap pesanan melalui
                langkah yang sama: menunggu bayaran, diproses, kemudian
                dihantar.
              </p>
              <p>
                Jika pesanan anda belum bergerak selepas tempoh anggaran,
                hubungi kami di{" "}
                <Link
                  href="/hubungi-kami"
                  className="text-ink underline underline-offset-4"
                >
                  Hubungi Kami
                </Link>{" "}
                dengan nombor pesanan supaya kami boleh semak dengan kurier.
              </p>
            </>
          ),
        },
        {
          heading: "Sebelum menghantar",
          body: (
            <p>
              Pastikan alamat lengkap dengan nama jalan, poskod dan nombor
              telefon yang boleh dihubungi. Parcel yang tidak dapat dihantar
              kerana alamat tidak lengkap akan dipulangkan kepada kami, dan
              penghantaran semula mengambil masa tambahan.
            </p>
          ),
        },
      ]}
    />
  );
}