import Link from "next/link";

import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  /** Item terakhir biasanya tiada href (halaman semasa). */
  href?: string;
}

/**
 * Breadcrumb editorial (spesifikasi 15): mono kecil, dipisah garis miring,
 * item terakhir tidak boleh diklik dan ditanda aria-current.
 */
export function Breadcrumb({
  items,
  className,
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  return (
    <nav aria-label="Jejak navigasi" className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="meta-label text-cocoa transition-colors duration-(--dur-fast) hover:text-ink"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn("meta-label", isLast ? "text-ink" : "text-cocoa")}
                >
                  {item.label}
                </span>
              )}
              {!isLast ? (
                <span aria-hidden="true" className="text-line-strong">
                  /
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
