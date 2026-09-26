import type { Metadata } from "next";
import Link from "next/link";

import { Accordion } from "@/components/ui/accordion";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { PRIMARY_CONTACT_EMAIL } from "@/lib/site";
import { SHIPPING_METHODS } from "@/lib/shipping";

export const metadata: Metadata = {
  title: "Soalan Lazim",
  description:
    "Jawapan ringkas tentang penghantaran, pertukaran, pembayaran, saiz dan penjagaan pakaian Maisara.",
  alternates: { canonical: "/soalan-lazim" },
};

const PENINSULAR_RATES = SHIPPING_METHODS.map(
  (method) => `${method.label} RM${method.feeSemenanjung}`,
).join(", ");

const EAST_RATES = SHIPPING_METHODS.map(
  (method) => `${method.label} RM${method.feeTimur}`,
).join(", ");

/** Masa anggaran kurier, dibaca daripada sumber yang sama dengan checkout. */
const SHIPPING_ETA = SHIPPING_METHODS[0].eta;

/**
 * Soalan lazim.
 *
 * Setiap jawapan merujuk dasar sebenar yang digunakan oleh sistem: kadar
 * penghantaran dibaca daripada `@/lib/shipping` (sumber yang sama dengan
 * checkout) dan tempoh pertukaran tujuh hari seperti yang dinyatakan di
 * halaman Pertukaran. Tiada kadar atau janji yang direka.
 */
const FAQ_GROUPS = [
  {
    heading: "Penghantaran",
    items: [
      {
        label: "Berapa kos penghantaran?",
        content: (
          <>
            <p>
              Semenanjung Malaysia: {PENINSULAR_RATES}. Sabah, Sarawak dan Labuan:{" "}
              {EAST_RATES}. Kos sebenar dipaparkan di halaman semakan sebelum anda
              membayar.
            </p>
            <p>
              Kos dikira berdasarkan negeri dalam alamat penghantaran anda, jadi
              ia berubah secara automatik apabila anda menukar negeri.
            </p>
          </>
        ),
      },
      {
        label: "Berapa lama pesanan sampai?",
        content: (
          <p>
            Pesanan diproses dalam satu hingga dua hari bekerja. Selepas itu
            penghantaran mengambil masa {SHIPPING_ETA} untuk kedua-dua kaedah
            kurier. Jangkaan ini bergantung pada kurier dan bukan janji
            bertarikh.
          </p>
        ),
      },
      {
        label: "Bolehkah saya menjejak pesanan saya?",
        content: (
          <p>
            Ya. Nombor pesanan anda dipaparkan selepas pembayaran dan boleh
            dilihat semula di{" "}
            <Link
              href="/akaun/order"
              className="text-ink underline decoration-line-strong underline-offset-4 transition-colors duration-(--dur-fast) hover:decoration-ink"
            >
              akaun anda
            </Link>{" "}
            di bawah Sejarah Pesanan.
          </p>
        ),
      },
    ],
  },
  {
    heading: "Pertukaran",
    items: [
      {
        label: "Berapa lama saya boleh membuat pertukaran?",
        content: (
          <p>
            Tujuh hari selepas anda menerima pesanan. Hubungi kami dalam tempoh
            itu dengan nombor pesanan anda, dan kami akan aturkan pertukaran.
          </p>
        ),
      },
      {
        label: "Apakah syarat pertukaran?",
        content: (
          <>
            <p>
              Kepingan mestilah belum dipakai, belum dibasuh dan masih dengan
              label asal. Kami periksa setiap pemulangan sebelum meluluskannya.
            </p>
            <p>
              Untuk sebab kebersihan, tudung dan aksesori yang telah dibuka
              pembungkusannya tidak boleh ditukar melainkan terdapat kecacatan
              pembuatan.
            </p>
          </>
        ),
      },
      {
        label: "Bolehkah saya tukar kepada saiz lain?",
        content: (
          <p>
            Boleh, selagi saiz yang anda mahu masih ada stok. Jika saiz itu sudah
            habis, kami akan tawarkan pilihan lain atau kredit kedai. Butiran
            penuh ada di{" "}
            <Link
              href="/pertukaran"
              className="text-ink underline decoration-line-strong underline-offset-4 transition-colors duration-(--dur-fast) hover:decoration-ink"
            >
              halaman Pertukaran
            </Link>
            .
          </p>
        ),
      },
    ],
  },
  {
    heading: "Pembayaran",
    items: [
      {
        label: "Kaedah pembayaran apa yang diterima?",
        content: (
          <p>
            Pembayaran dibuat melalui FPX, iaitu pemindahan terus daripada akaun
            bank anda semasa pembayaran. Kami tidak menyimpan butiran perbankan
            anda.
          </p>
        ),
      },
      {
        label: "Pesanan saya gagal dibayar. Apa perlu saya buat?",
        content: (
          <p>
            Pesanan anda disimpan dan statusnya ditandakan sebagai gagal
            dibayar. Buka semula pesanan itu dari akaun anda dan cuba bayar
            sekali lagi. Tiada caj dikenakan untuk percubaan yang gagal.
          </p>
        ),
      },
    ],
  },
  {
    heading: "Saiz dan bahan",
    items: [
      {
        label: "Bagaimana saya memilih saiz yang betul?",
        content: (
          <>
            <p>
              Pakaian kami menggunakan julat XS hingga XL, manakala tudung dan
              kebanyakan aksesori ialah satu saiz. Setiap halaman produk
              menyenaraikan saiz sebenar yang tersedia untuk kepingan itu.
            </p>
            <p>
              Jika anda antara dua saiz, pilih yang lebih besar untuk pakaian
              berpotongan lurus, dan yang lebih kecil untuk potongan A-line.
            </p>
          </>
        ),
      },
      {
        label: "Bagaimana cara menjaga kain?",
        content: (
          <>
            <p>
              Basuh dengan air sejuk dan detergen lembut, kemudian keringkan di
              tempat berlindung daripada matahari langsung. Elakkan pengering
              mesin kerana haba mengecutkan serat semula jadi.
            </p>
            <p>
              Linen akan berasa sedikit kaku selepas dibasuh kali pertama. Ia
              melembut semula selepas dipakai atau diseterika pada suhu rendah.
            </p>
          </>
        ),
      },
      {
        label: "Adakah warna dalam gambar tepat?",
        content: (
          <p>
            Kami memotret setiap kepingan di bawah cahaya semula jadi tanpa
            penapisan warna yang kuat. Warna masih boleh kelihatan sedikit
            berbeza mengikut skrin peranti anda.
          </p>
        ),
      },
    ],
  },
] as const;

export default function SoalanLazimPage() {
  return (
    <div className="bg-paper">
      <div className="shell py-(--space-section)">
        <div className="mx-auto max-w-[65ch]">
          <Breadcrumb
            items={[{ label: "Utama", href: "/" }, { label: "Soalan Lazim" }]}
          />

          <p className="meta-label mt-8 text-cocoa">Bantuan</p>
          <h1 className="mt-5 text-h1 text-ink">Soalan lazim</h1>
          <p className="mt-6 text-body-lg text-cocoa">
            Jawapan ringkas untuk perkara yang paling kerap ditanya. Jika soalan
            anda tidak ada di sini, tulis kepada kami dan kami akan jawab sendiri.
          </p>

          <div className="mt-16 space-y-12 md:mt-20">
            {FAQ_GROUPS.map((group) => (
              <section key={group.heading}>
                <h2 className="text-h3 text-ink">{group.heading}</h2>
                <Accordion
                  className="mt-5"
                  defaultOpen={null}
                  items={group.items.map((item) => ({
                    label: item.label,
                    content: item.content,
                  }))}
                />
              </section>
            ))}
          </div>

          <div className="mt-16 border-t border-line pt-10">
            <h2 className="text-h3 text-ink">Masih ada soalan?</h2>
            <p className="mt-4 text-body text-cocoa">
              E-mel kami di{" "}
              <a
                href={`mailto:${PRIMARY_CONTACT_EMAIL}`}
                className="text-ink underline decoration-line-strong underline-offset-4 transition-colors duration-(--dur-fast) hover:decoration-ink"
              >
                {PRIMARY_CONTACT_EMAIL}
              </a>{" "}
              atau gunakan borang di halaman Hubungi Kami.
            </p>
            <Button asChild variant="outline" className="mt-7">
              <Link href="/hubungi-kami">Hubungi kami</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
