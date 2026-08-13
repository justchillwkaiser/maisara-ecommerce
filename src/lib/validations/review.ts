import { z } from "zod";

/**
 * Validasi review (API.md section 6).
 * Rating integer 1-5; comment 10-1000 aksara.
 */
export const reviewSchema = z.object({
  productId: z.string().min(1, "Produk diperlukan."),
  rating: z
    .number({ message: "Sila pilih bintang." })
    .int("Rating mesti nombor bulat.")
    .min(1, "Rating minimum 1 bintang.")
    .max(5, "Rating maksimum 5 bintang."),
  comment: z
    .string()
    .min(10, "Ulasan sekurang-kurangnya 10 aksara.")
    .max(1000, "Ulasan maksimum 1000 aksara."),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

/** PATCH /api/reviews/[id] - moderasi admin (API.md section 6). */
export const reviewStatusSchema = z.object({
  status: z.enum(["APPROVED", "HIDDEN"], { message: "Status ulasan tidak sah." }),
});

export type ReviewStatusInput = z.infer<typeof reviewStatusSchema>;
