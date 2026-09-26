import { Plus } from "@phosphor-icons/react/dist/ssr";

import { cn } from "@/lib/utils";

export interface AccordionItem {
  /** Nama bahagian — dipapar sebagai label mono. */
  label: string;
  /** Kandungan; teks biasa atau nod. */
  content: React.ReactNode;
}

/**
 * Accordion MAISARA untuk bahagian maklumat produk (bahan, potongan, saiz,
 * penjagaan).
 *
 * Menggunakan <details>/<summary> asli: kekal boleh diakses dan boleh
 * dikendalikan papan kekunci tanpa JavaScript, jadi ia berfungsi pada
 * paparan pelayan dan tidak menambah berat kepada PDP.
 */
export function Accordion({
  items,
  defaultOpen = 0,
  className,
}: {
  items: AccordionItem[];
  /** Indeks bahagian yang terbuka secara lalai; null untuk semua tertutup. */
  defaultOpen?: number | null;
  className?: string;
}) {
  return (
    <div className={cn("border-t border-line", className)}>
      {items.map((item, index) => (
        <details
          key={item.label}
          open={defaultOpen === index}
          className="group border-b border-line"
        >
          <summary
            className={cn(
              "flex cursor-pointer list-none items-center justify-between gap-4 py-5",
              "meta-label text-ink transition-colors duration-(--dur-fast) hover:text-cocoa",
              "[&::-webkit-details-marker]:hidden",
            )}
          >
            {item.label}
            <Plus
              size={14}
              weight="light"
              aria-hidden="true"
              className="shrink-0 text-cocoa transition-transform duration-(--dur-base) ease-out group-open:rotate-45"
            />
          </summary>
          <div className="pb-6 text-body-sm text-cocoa [&_p+p]:mt-3">
            {item.content}
          </div>
        </details>
      ))}
    </div>
  );
}
