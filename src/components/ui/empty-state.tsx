import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps extends React.ComponentProps<"div"> {
  /** Label mono kecil di atas tajuk. */
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  /** Tindakan tersuai menggantikan `action`. */
  children?: React.ReactNode;
  /** Ketat untuk panel kecil (drawer, kad), lapang untuk halaman penuh. */
  density?: "page" | "panel";
}

/**
 * Keadaan kosong yang dikongsi semua permukaan (spesifikasi 30).
 * Nada tenang dan berguna: terangkan keadaan, tawarkan langkah seterusnya.
 */
export function EmptyState({
  eyebrow,
  title,
  description,
  action,
  children,
  density = "page",
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center border border-line bg-paper-lift text-center",
        density === "page" ? "gap-4 px-6 py-20 md:py-28" : "gap-3 px-6 py-12",
        className,
      )}
      {...props}
    >
      {eyebrow ? <p className="meta-label text-cocoa">{eyebrow}</p> : null}
      <p
        className={cn(
          "font-display text-ink",
          density === "page" ? "text-h3" : "text-xl",
        )}
      >
        {title}
      </p>
      {description ? (
        <p className="max-w-md text-body-sm text-cocoa">{description}</p>
      ) : null}
      {action ? (
        <Button asChild className="mt-2">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      ) : null}
      {children}
    </div>
  );
}
