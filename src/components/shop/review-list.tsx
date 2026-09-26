import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatDate } from "@/lib/format";
import type { ProductReviewDetail } from "@/server/services/product.service";

import { RatingStars } from "./rating-stars";

interface ReviewListProps {
  reviews: ProductReviewDetail[];
  avgRating: number | null;
  reviewCount: number;
}

/**
 * Ulasan pelanggan (spesifikasi 15): ringkasan purata, kemudian senarai yang
 * dipisah garis halus. Metadata (nama, tarikh, nilai) memakai DM Mono supaya ia
 * kekal sebagai nota kecil, bukan tajuk. Hanya review APPROVED yang dihantar
 * oleh halaman dipaparkan - tiada ulasan atau nama rekaan.
 * (Kontena dan jarak luaran diurus oleh halaman PDP.)
 */
export function ReviewList({ reviews, avgRating, reviewCount }: ReviewListProps) {
  return (
    <section aria-label="Ulasan pelanggan">
      <SectionHeading as="h2" size="h2" title="Ulasan Pelanggan" />

      {reviewCount > 0 && avgRating != null ? (
        <div className="mt-8 flex items-center gap-5 border-t border-line pt-8">
          <p className="font-display text-display-m tabular-nums text-ink">
            {avgRating.toFixed(1)}
          </p>
          <div className="flex flex-col gap-2">
            <RatingStars value={avgRating} size={15} />
            <p className="meta-label text-cocoa">{reviewCount} ulasan</p>
          </div>
        </div>
      ) : null}

      {reviews.length === 0 ? (
        <EmptyState
          className="mt-10"
          density="panel"
          title="Belum ada ulasan"
          description="Jadilah yang pertama berkongsi pengalaman anda dengan produk ini."
        />
      ) : (
        <ul className="mt-10 divide-y divide-line border-t border-line">
          {reviews.map((review) => (
            <li key={review.id} className="py-7">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <p className="font-mono text-body-sm text-ink">
                  {review.user.name ?? "Pelanggan"}
                </p>
                <time
                  dateTime={review.createdAt.toISOString()}
                  className="meta-label text-cocoa"
                >
                  {formatDate(review.createdAt)}
                </time>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <RatingStars value={review.rating} size={13} />
                <span className="meta-label text-cocoa">{review.rating} / 5</span>
              </div>
              <p className="mt-3 max-w-[62ch] text-body text-cocoa">{review.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
