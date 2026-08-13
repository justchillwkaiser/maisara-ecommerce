import * as React from "react";
import { Amiri } from "next/font/google";

import { cn } from "@/lib/utils";

/**
 * Motif warisan Maisara (DESIGN.md section 5).
 * Guna dengan restraint: opacity rendah, jangan atas imej produk,
 * jangan dalam cart/checkout/form.
 */

const amiri = Amiri({
  subsets: ["arabic"],
  weight: "400",
});

/** SVG pattern batik geometri (bunga 8-kelopak) dari DESIGN.md 5.1, verbatim. */
const BATIK_SVG =
  '<svg width="120" height="120" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#A8824A" stroke-width="0.8" opacity="0.5"><path d="M60 30 a10 10 0 0 1 20 0 a10 10 0 0 1 -20 0Z"/><path d="M60 90 a10 10 0 0 1 20 0 a10 10 0 0 1 -20 0Z"/><path d="M30 60 a10 10 0 0 1 0 20 a10 10 0 0 1 0 -20Z"/><path d="M90 60 a10 10 0 0 1 0 20 a10 10 0 0 1 0 -20Z"/><path d="M60 60 m-14 0 a14 14 0 1 1 28 0 a14 14 0 1 1 -28 0"/></g></svg>';

const BATIK_DATA_URI = `url("data:image/svg+xml,${encodeURIComponent(BATIK_SVG)}")`;

export interface BatikPatternProps extends React.ComponentProps<"div"> {
  /** Opacity motif, default 0.05 (DESIGN.md: 3-6%). */
  opacity?: number;
}

/** Latar batik halus. Guna pada hero, footer, kad kategori, divider section. */
export function BatikPattern({
  opacity = 0.05,
  className,
  style,
  ...props
}: BatikPatternProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none", className)}
      style={{
        backgroundImage: BATIK_DATA_URI,
        backgroundSize: "120px",
        backgroundRepeat: "repeat",
        opacity,
        ...style,
      }}
      {...props}
    />
  );
}

/** Tekstur tenun/songket halus (DESIGN.md 5.2). Guna pada surface-alt dan kad featured. */
export function SongketTexture({
  className,
  style,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none", className)}
      style={{
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(42,38,34,0.025) 0 1px, transparent 1px 6px)",
        ...style,
      }}
      {...props}
    />
  );
}

/** "مياثرا" (Jawi) - elemen heritage kecil, cukup 1-2 tempat (footer, kisah kami). */
export function JawiText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span dir="rtl" lang="ar" className={cn(amiri.className, className)} {...props}>
      مياثرا
    </span>
  );
}
