import Link from "next/link";

import { AdminReviewActions } from "@/components/admin/admin-review-actions";
import { RatingStars } from "@/components/shop/rating-stars";
import { formatDate } from "@/lib/format";
import { listAdminReviews } from "@/server/services/review.service";
import { cn } from "@/lib/utils";

interface AdminReviewPageProps {
  searchParams: Promise<{ status?: string }>;
}

const TABS = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Diluluskan" },
  { value: "HIDDEN", label: "Disembunyikan" },
] as const;

/**
 * Moderasi review admin (UX.md section 4 - Review, API.md section 6).
 * Tab Pending/Approved/Hidden via query; aksi Approve / Sembunyikan.
 */
export default async function AdminReviewPage({ searchParams }: AdminReviewPageProps) {
  const { status } = await searchParams;
  const activeStatus = TABS.some((tab) => tab.value === status)
    ? (status as "PENDING" | "APPROVED" | "HIDDEN")
    : "PENDING";

  const reviews = await listAdminReviews(activeStatus);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-medium text-ink">Review</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Moderasi ulasan pelanggan sebelum dipaparkan di kedai.
        </p>
      </div>

      {/* Tab status */}
      <div className="flex gap-1 rounded-full border border-line bg-card p-1 w-fit">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/review?status=${tab.value}`}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              activeStatus === tab.value
                ? "bg-gold-tint text-gold-deep"
                : "text-ink-soft hover:text-ink",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card px-6 py-14 text-center text-sm text-ink-soft">
          Tiada ulasan dengan status ini.
        </div>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-2xl border border-line bg-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <RatingStars value={review.rating} />
                    <span className="text-sm text-ink-soft">
                      {review.user.name ?? "Pelanggan"} · {formatDate(review.createdAt)}
                    </span>
                  </div>
                  <Link
                    href={`/produk/${review.product.slug}`}
                    className="mt-2 block w-fit text-sm font-medium text-gold hover:text-gold-deep"
                  >
                    {review.product.name}
                  </Link>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink">
                    {review.comment}
                  </p>
                </div>
                <AdminReviewActions reviewId={review.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
