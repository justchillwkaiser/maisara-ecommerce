import type { Metadata } from "next";

import { InfoPage } from "@/components/shared/info-page";
import { SHIPPING_METHODS } from "@/lib/shipping";

export const metadata: Metadata = {
  title: "Penghantaran | Maisara",
  description:
    "Maklumat penghantaran Maisara: J&T Express dan Pos Laju, kadar Semenanjung dan Timur Malaysia, anggaran 2-4 hari bekerja.",
};

/** Halaman info Penghantaran (backlog: footer link Bantuan). Kadar dari src/lib/shipping.ts. */
export default function PenghantaranPage() {
  return (
    <InfoPage
      eyebrow="Bantuan"
      title="Penghantaran"
      intro="Kami hantar pesanan anda dengan selamat ke seluruh Malaysia. Pilih kaedah yang sesuai semasa checkout."
      sections={[
        {
          heading: "Kaedah penghantaran",
          body: (
            <ul className="space-y-4">
              {SHIPPING_METHODS.map((method) => (
                <li
                  key={method.id}
                  className="rounded-2xl border border-line bg-card p-5"
                >
                  <p className="font-medium text-ink">{method.label}</p>
                  <p className="mt-1 text-sm text-ink-soft">
                    Semenanjung: RM{method.feeSemenanjung} · Timur: RM
                    {method.feeTimur}
                  </p>
                  <p className="mt-1 text-sm text-ink-soft">
                    Anggaran: {method.eta}
                  </p>
                </li>
              ))}
            </ul>
          ),
        },
        {
          heading: "Zon penghantaran",
          body: (
            <p>
              Semenanjung merangkumi 11 negeri serta Kuala Lumpur dan
              Putrajaya. Sabah, Sarawak dan Labuan dikira zon Timur dengan
              kadar berasingan. Kadar dikira mengikut negeri alamat semasa
              checkout.
            </p>
          ),
        },
        {
          heading: "Masa pemprosesan",
          body: (
            <p>
              Pesanan diproses dalam 1-2 hari bekerja selepas pembayaran
              disahkan. Anggaran penghantaran 2-4 hari bekerja selepas pesanan
              dihantar, tidak termasuk hari cuti dan hujung minggu.
            </p>
          ),
        },
      ]}
    />
  );
}
