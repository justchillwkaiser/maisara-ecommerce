import { ApiError } from "@/lib/errors";
import type { PaymentProvider, PaymentResult, PaymentStatusValue } from "./types";

/**
 * MockPaymentProvider (API.md section 5, ARCHITECTURE.md section 6).
 * Simulasi gerbang FPX: state disimpan dalam Map module-level supaya
 * testable (reference -> status). Dalam production sebenar, provider
 * sebenar (BillPlz/ToyyibPay) menggantikan class ini via getPaymentProvider().
 */

const paymentStore = new Map<string, PaymentStatusValue>();

function randomReference(): string {
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  return `MOCK-${suffix}`;
}

export class MockPaymentProvider implements PaymentProvider {
  async createPayment(input: { orderId: string; amount: number }): Promise<PaymentResult> {
    const reference = randomReference();
    paymentStore.set(reference, "pending");
    return { redirectUrl: `/pembayaran/${input.orderId}`, reference };
  }

  async handleCallback(payload: {
    reference: string;
    status: "paid" | "failed";
  }): Promise<{ status: "paid" | "failed"; reference: string }> {
    if (!paymentStore.has(payload.reference)) {
      throw new ApiError("PAYMENT_INVALID", "Rujukan pembayaran tidak sah.", 422);
    }
    paymentStore.set(payload.reference, payload.status);
    return { status: payload.status, reference: payload.reference };
  }

  async verify(reference: string): Promise<PaymentStatusValue> {
    return paymentStore.get(reference) ?? "pending";
  }
}
