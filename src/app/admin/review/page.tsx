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
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-h3 text-ink">Review</h2>
        <p className="mt-2 text-body-sm text-cocoa">
          Moderasi ulasan pelanggan sebelum dipaparkan di kedai.
        </p>
      </div>

      {/* Tab status: rel garis halus, bukan pill. */}
      <div className="flex w-fit gap-6 border-b border-line">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/review?status=${tab.value}`}
            aria-current={activeStatus === tab.value ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-1 pb-3 text-body-sm transition-colors duration-(--dur-fast)",
              activeStatus === tab.value
                ? "border-ink font-medium text-ink"
                : "border-transparent text-cocoa hover:border-line-strong hover:text-ink",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {reviews.length === 0 ? (
        <p className="border border-line bg-paper-lift px-5 py-12 text-center text-body-sm text-cocoa">
          Tiada ulasan dengan status ini.
        </p>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {reviews.map((review) => (
            <li key={review.id} className="py-6">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <RatingStars value={review.rating} />
                    <span className="font-mono text-meta text-cocoa">
                      {review.user.name ?? "Pelanggan"} · {formatDate(review.createdAt)}
                    </span>
                  </div>
                  <Link
                    href={`/produk/${review.product.slug}`}
                    className="mt-3 block w-fit text-body-sm text-ink underline underline-offset-4 transition-colors duration-(--dur-fast) hover:text-cocoa"
                  >
                    {review.product.name}
                  </Link>
                  <p className="mt-3 max-w-2xl text-body-sm leading-relaxed text-ink">
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
