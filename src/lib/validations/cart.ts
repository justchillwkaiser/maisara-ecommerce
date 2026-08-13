import { z } from "zod";

/**
 * Validasi cart (API.md section 3).
 * Semua input disahkan di sempadan API sebelum sampai ke service.
 */

/** POST /api/cart - tambah item. */
export const cartItemSchema = z.object({
  variantId: z.string().min(1, "Variant diperlukan."),
  quantity: z.number().int().min(1, "Kuantiti sekurang-kurangnya 1.").max(99, "Kuantiti maksimum 99.").default(1),
});

export type CartItemInput = z.infer<typeof cartItemSchema>;

/** PATCH /api/cart/[itemId] - kemas kini kuantiti (1-99). */
export const cartQuantitySchema = z.object({
  quantity: z.number().int().min(1, "Kuantiti sekurang-kurangnya 1.").max(99, "Kuantiti maksimum 99."),
});

export type CartQuantityInput = z.infer<typeof cartQuantitySchema>;
