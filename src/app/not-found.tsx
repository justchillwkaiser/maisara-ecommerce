import Link from "next/link";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Halaman tidak dijumpai",
  robots: { index: false, follow: true },
};

/**
 * 404 global. Nada tenang dan berguna: jelaskan keadaan dan tawarkan dua
 * langkah seterusnya yang benar-benar wujud, bukan mesej generik.
 */
export default function NotFound() {
  return (
    <div className="shell flex min-h-[70vh] flex-col items-center justify-center py-(--space-section) text-center">
      <p className="meta-label text-cocoa">Ralat 404</p>
      <h1 className="mt-6 text-display-m text-ink">Halaman ini tidak ada.</h1>
      <p className="mt-5 max-w-md text-body-lg text-cocoa">
        Pautan mungkin sudah berubah atau produk yang anda cari telah dikeluarkan
        daripada koleksi.
      </p>
      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/koleksi">Lihat koleksi</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Kembali ke utama</Link>
        </Button>
      </div>
    </div>
  );
}
