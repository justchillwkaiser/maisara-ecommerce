import { formatDate } from "@/lib/format";
import type { ProductReviewDetail } from "@/server/services/product.service";

import { RatingStars } from "./rating-stars";

interface ReviewListProps {
  reviews: ProductReviewDetail[];
  avgRating: number | null;
  reviewCount: number;
}

/**
 * Ulasan pelanggan (DESIGN.md 8 - PDP): purata besar serif + bintang +
 * senarai review APPROVED (nama, tarikh, rating, komen).
 * Form submit review di Task 11 - paparan sahaja buat masa ini.
 * (Kontena luaran diurus oleh halaman PDP.)
 */
export function ReviewList({ reviews, avgRating, reviewCount }: ReviewListProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-[760px]">
        <h2 className="font-serif text-3xl font-medium tracking-tight text-ink md:text-4xl">
          Ulasan Pelanggan
        </h2>

        {reviewCount > 0 && avgRating != null && (
          <div className="mt-5 flex items-center gap-4">
            <span className="font-serif text-6xl leading-none font-medium tabular-nums text-ink">
              {avgRating.toFixed(1)}
            </span>
            <div>
              <RatingStars value={avgRating} size={16} />
              <p className="mt-1 text-xs text-ink-soft">
                {reviewCount} ulasan
              </p>
            </div>
          </div>
        )}

        {reviews.length === 0 ? (
          <p className="mt-8 border-t border-line pt-8 text-ink-soft">
            Belum ada ulasan. Jadilah yang pertama.
          </p>
        ) : (
          <ul className="mt-4">
            {reviews.map((review) => (
              <li key={review.id} className="border-t border-line py-6">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <span className="font-medium text-ink">
                    {review.user.name ?? "Pelanggan"}
                  </span>
                  <time className="text-xs text-ink-soft">
                    {formatDate(review.createdAt)}
                  </time>
                </div>
                <RatingStars value={review.rating} size={14} className="mt-2" />
                <p className="mt-2 max-w-[65ch] leading-relaxed text-ink-soft">
                  {review.comment}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
