import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { RatingStars } from "@/components/shop/rating-stars";
import { SectionHeading } from "@/components/ui/section-heading";
import type { HomepageReview } from "@/lib/homepage";

/**
 * Suara pelanggan (spesifikasi 12).
 *
 * Hanya ulasan APPROVED sebenar dipaparkan, dengan nama sebenar pemberi
 * ulasan dan nama produk yang benar-benar diulas. Apabila tiada ulasan,
 * seksyen memaparkan keadaan kosong — identiti dan ulasan pelanggan tidak
 * pernah direka untuk mengisi ruang.
 */
export function CustomerVoice({ reviews }: { reviews: HomepageReview[] }) {
  return (
    <section className="border-b border-line bg-paper">
      <div className="shell py-(--space-section)">
        <SectionHeading
          eyebrow="07 · Suara pelanggan"
          title="Apa yang mereka kata"
          description="Ulasan yang disiarkan selepas pesanan selesai."
          size="display-m"
        />

        {reviews.length === 0 ? (
          <EmptyState
            className="mt-12"
            eyebrow="Belum ada ulasan"
            title="Ulasan pertama akan datang tidak lama lagi."
            description="Kami hanya menyiarkan ulasan daripada pelanggan yang sudah menerima pesanan."
            action={{ label: "Lihat koleksi", href: "/koleksi" }}
          />
        ) : (
          <ul className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-(--gutter)">
            {reviews.map((review) => (
              <li key={review.id} className="flex flex-col border-t border-line pt-7">
                <RatingStars value={review.rating} />

                <blockquote className="mt-5 flex-1 font-display text-xl leading-snug text-ink">
                  {review.comment}
                </blockquote>

                <div className="mt-6">
                  <p className="text-body-sm text-ink">{review.author}</p>
                  <Link
                    href={`/produk/${review.productSlug}`}
                    className="meta-label mt-1 inline-block text-cocoa underline-offset-4 transition-colors duration-(--dur-fast) hover:text-ink hover:underline"
                  >
                    {review.productName}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
