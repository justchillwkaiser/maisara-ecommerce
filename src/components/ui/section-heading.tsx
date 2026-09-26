import { cn } from "@/lib/utils";

export interface SectionHeadingProps extends React.ComponentProps<"div"> {
  /** Label mono kecil di atas tajuk — "01 / KOLEKSI BAHARU". */
  eyebrow?: string;
  title: string;
  /** Ayat pengiring di bawah tajuk. */
  description?: string;
  /** Tindakan di hujung kanan (desktop) / bawah (mobile). */
  action?: React.ReactNode;
  align?: "start" | "center";
  as?: "h1" | "h2" | "h3";
  size?: "display-m" | "display-l" | "h1" | "h2";
  className?: string;
}

const SIZE: Record<NonNullable<SectionHeadingProps["size"]>, string> = {
  "display-l": "text-display-l",
  "display-m": "text-display-m",
  h1: "text-h1",
  h2: "text-h2",
};

/**
 * Tajuk seksyen editorial: eyebrow mono + tajuk serif + ayat pengiring.
 * Satu komponen untuk semua seksyen supaya irama tipografi konsisten dan
 * tiada tajuk yang direka semula pada setiap halaman.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "start",
  as: Heading = "h2",
  size = "h2",
  className,
  ...props
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "flex gap-6",
        centered
          ? "flex-col items-center text-center"
          : "flex-col md:flex-row md:items-end md:justify-between",
        className,
      )}
      {...props}
    >
      <div className={cn("max-w-2xl", centered && "mx-auto")}>
        {eyebrow ? (
          <p className="meta-label mb-4 text-cocoa">{eyebrow}</p>
        ) : null}
        <Heading className={cn(SIZE[size], "text-ink")}>{title}</Heading>
        {description ? (
          <p className="mt-5 max-w-xl text-body-lg text-cocoa">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
