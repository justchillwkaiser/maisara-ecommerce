import { z } from "zod";

/** POST /api/wishlist - tambah produk ke wishlist. */
export const wishlistAddSchema = z.object({
  productId: z.string().min(1, "Produk diperlukan."),
});

export type WishlistAddInput = z.infer<typeof wishlistAddSchema>;
