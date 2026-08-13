import { z } from "zod";

import { states } from "@/lib/format";

/**
 * Validasi checkout & payment (API.md section 4 & 5).
 * Semua input disahkan di sempadan API sebelum sampai ke service.
 */

/** Alamat penghantaran (API.md section 4). */
export const shippingAddressSchema = z.object({
  name: z
    .string()
    .min(3, "Nama sekurang-kurangnya 3 aksara.")
    .max(100, "Nama maksimum 100 aksara."),
  phone: z.string().regex(/^01[0-9]{7,9}$/, "Nombor telefon tidak sah."),
  address: z
    .string()
    .min(5, "Alamat sekurang-kurangnya 5 aksara.")
    .max(200, "Alamat maksimum 200 aksara."),
  state: z.enum(states, { message: "Sila pilih negeri." }),
  postcode: z.string().regex(/^[0-9]{5}$/, "Poskod mesti 5 digit."),
});

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

/** POST /api/orders - checkout penuh. */
export const checkoutSchema = z.object({
  shippingAddress: shippingAddressSchema,
  shippingMethod: z.enum(["J&T Express", "Pos Laju"], {
    message: "Sila pilih kaedah penghantaran.",
  }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

/** POST /api/payments/callback - callback dari provider (mock FPX). */
export const paymentCallbackSchema = z.object({
  reference: z.string().min(1, "Rujukan pembayaran diperlukan."),
  status: z.enum(["paid", "failed"], { message: "Status pembayaran tidak sah." }),
});

export type PaymentCallbackInput = z.infer<typeof paymentCallbackSchema>;
