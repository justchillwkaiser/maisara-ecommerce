import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/errors";
import type { ReviewInput } from "@/lib/validations/review";

/**
 * Service review (API.md section 6, UX.md Flow D).
 * Layer bebas transport: dipanggil oleh route handler.
 */

export interface ReviewListItem {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date;
  user: { name: string | null };
}

/** Review APPROVED untuk produk (public, terbaru dahulu). */
export async function listProductReviews(productId: string): Promise<ReviewListItem[]> {
  const reviews = await db.review.findMany({
    where: { productId, status: "APPROVED" },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return reviews.map((review) => ({
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    user: { name: review.user.name },
  }));
}

/**
 * Hantar review (POST /api/reviews).
 * Syarat: user telah beli produk DAN order COMPLETED (semak OrderItem join
 * variant productId) -> 403 ORDER_NOT_COMPLETED.
 * Satu review per produk per user (unique) -> 409 ALREADY_REVIEWED.
 * Status awal PENDING (menunggu moderasi admin).
 */
export async function submitReview(
  userId: string,
  input: ReviewInput,
): Promise<{ id: string; status: string }> {
  const completed = await db.order.findFirst({
    where: {
      userId,
      status: "COMPLETED",
      items: { some: { variant: { productId: input.productId } } },
    },
    select: { id: true },
  });

  if (!completed) {
    throw new ApiError(
      "ORDER_NOT_COMPLETED",
      "Anda perlu melengkapkan pembelian produk ini sebelum menulis ulasan.",
      403,
    );
  }

  try {
    const review = await db.review.create({
      data: {
        userId,
        productId: input.productId,
        rating: input.rating,
        comment: input.comment,
        status: "PENDING",
      },
      select: { id: true, status: true },
    });
    return review;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ApiError("ALREADY_REVIEWED", "Anda sudah menghantar ulasan untuk produk ini.", 409);
    }
    throw error;
  }
}

/** Moderasi admin (PATCH /api/reviews/[id]) - APPROVED | HIDDEN. */
export async function updateReviewStatus(
  reviewId: string,
  status: "APPROVED" | "HIDDEN",
): Promise<void> {
  const result = await db.review.updateMany({
    where: { id: reviewId },
    data: { status },
  });
  if (result.count === 0) {
    throw new ApiError("NOT_FOUND", "Ulasan tidak ditemui.", 404);
  }
}

export interface AdminReviewItem {
  id: string;
  rating: number;
  comment: string;
  status: string;
  createdAt: string;
  product: { name: string; slug: string };
  user: { name: string | null };
}

/** Senarai review untuk moderasi admin (API.md section 6, tab status). */
export async function listAdminReviews(
  status?: "PENDING" | "APPROVED" | "HIDDEN",
): Promise<AdminReviewItem[]> {
  const reviews = await db.review.findMany({
    where: status ? { status } : {},
    include: {
      product: { select: { name: true, slug: true } },
      user: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return reviews.map((review) => ({
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    status: review.status,
    createdAt: review.createdAt.toISOString(),
    product: { name: review.product.name, slug: review.product.slug },
    user: { name: review.user.name },
  }));
}
