import { cn } from "@/lib/utils";

/**
 * Trust strip MAISARA (spesifikasi 21).
 *
 * Sengaja halus: satu baris teks mono yang dipisah garis, bukan empat kad
 * ikon besar. Maklumatnya sama, tetapi ia kekal sebagai nota kecil dalam
 * halaman dan bukan seksyen yang bersaing dengan produk.
 */
export const TRUST_POINTS = [
  { label: "Pembayaran selamat", detail: "FPX dan kad melalui saluran disulitkan" },
  { label: "Pertukaran mudah", detail: "7 hari selepas terima" },
  { label: "Penghantaran seluruh Malaysia", detail: "J&T Express dan Pos Laju" },
  { label: "Dibungkus dengan teliti", detail: "Setiap pesanan disemak sebelum dihantar" },
] as const;

export function TrustStrip({
  points = TRUST_POINTS,
  className,
}: {
  points?: readonly { label: string; detail?: string }[];
  className?: string;
}) {
  return (
    <section
      aria-label="Jaminan Maisara"
      className={cn("border-y border-line", className)}
    >
      <ul className="shell grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {points.map((point, index) => (
          <li
            key={point.label}
            className={cn(
              "flex flex-col gap-1.5 py-7 lg:py-9",
              "border-line",
              index > 0 && "border-t sm:border-t-0",
              index % 2 === 1 && "sm:border-l",
              index >= 2 && "lg:border-t-0 lg:border-l",
              index === 2 && "sm:border-l-0 lg:border-l",
              "sm:pl-6 lg:pl-8",
              index % 2 === 0 && "sm:pl-0",
              index === 0 && "lg:pl-0",
            )}
          >
            <span className="meta-label text-ink">{point.label}</span>
            {point.detail ? (
              <span className="text-body-sm text-cocoa">{point.detail}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
