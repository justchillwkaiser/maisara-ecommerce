import { Star, StarHalf } from "@phosphor-icons/react/dist/ssr";

import { cn } from "@/lib/utils";

interface RatingStarsProps {
  /** Purata (cth. 4.7) atau rating individu (integer 1-5). */
  value: number;
  size?: number;
  className?: string;
}

/**
 * Bintang statik gold (Phosphor Star/StarHalf) - dikongsi oleh ringkasan
 * rating PDP dan setiap review. Separuh bintang untuk nilai .5 (DESIGN.md 7.3).
 */
export function RatingStars({ value, size = 14, className }: RatingStarsProps) {
  const rounded = Math.round(value * 2) / 2;
  const fullStars = Math.floor(rounded);
  const hasHalf = rounded % 1 !== 0;

  return (
    <span className={cn("flex items-center gap-0.5 text-gold", className)} aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => {
        if (i < fullStars) {
          return <Star key={i} size={size} weight="fill" />;
        }
        if (i === fullStars && hasHalf) {
          return <StarHalf key={i} size={size} weight="fill" />;
        }
        return <Star key={i} size={size} className="opacity-30" />;
      })}
    </span>
  );
}
