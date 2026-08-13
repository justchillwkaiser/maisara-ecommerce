/**
 * Abstraksi payment (ARCHITECTURE.md section 6).
 * Business logic (order.service) bergantung pada interface ini, bukan
 * implementasi provider tertentu. Tambah provider sebenar = class baru +
 * tukar env PAYMENT_PROVIDER. Tiada perubahan pada service.
 */

export type PaymentStatusValue = "pending" | "paid" | "failed";

export interface PaymentResult {
  redirectUrl: string;
  reference: string;
}

export interface PaymentProvider {
  /** Initiate payment untuk order; return redirect URL + reference unik. */
  createPayment(input: { orderId: string; amount: number }): Promise<PaymentResult>;
  /** Callback dari provider (mock: halaman simulasi FPX). Unknown reference -> ApiError PAYMENT_INVALID 422. */
  handleCallback(payload: {
    reference: string;
    status: "paid" | "failed";
  }): Promise<{ status: "paid" | "failed"; reference: string }>;
  /** Semak status payment ikut reference. */
  verify(reference: string): Promise<PaymentStatusValue>;
}
