"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

/**
 * Sempadan ralat peringkat route. Memaparkan keadaan yang tenang dan satu
 * tindakan pemulihan sebenar (cuba lagi), serta laluan keluar ke katalog.
 *
 * Ralat di-log ke console pelayar supaya ia kelihatan semasa pembangunan;
 * butiran teknikal tidak pernah dipaparkan kepada pelanggan.
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="shell flex min-h-[70vh] flex-col items-center justify-center py-(--space-section) text-center">
      <p className="meta-label text-cocoa">Sesuatu tidak kena</p>
      <h1 className="mt-6 text-display-m text-ink">
        Kami tidak dapat memuatkan halaman ini.
      </h1>
      <p className="mt-5 max-w-md text-body-lg text-cocoa">
        Cuba muat semula sebentar lagi. Jika masalah berterusan, hubungi kami dan
        kami akan bantu.
      </p>
      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <Button type="button" onClick={reset}>
          Cuba lagi
        </Button>
        <Button asChild variant="outline">
          <Link href="/koleksi">Lihat koleksi</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/hubungi-kami">Hubungi kami</Link>
        </Button>
      </div>
      {error.digest ? (
        <p className="meta-label mt-8 text-cocoa">Rujukan: {error.digest}</p>
      ) : null}
    </div>
  );
}
