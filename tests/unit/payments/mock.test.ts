import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/errors";
import { MockPaymentProvider } from "@/lib/payments/mock";

/**
 * MockPaymentProvider (ARCHITECTURE.md section 6, API.md section 5).
 * State disimpan dalam Map module-level (testable); createPayment menjana
 * reference unik "MOCK-*", handleCallback mengemas kini state.
 */
describe("MockPaymentProvider", () => {
  const provider = new MockPaymentProvider();

  it("createPayment -> redirectUrl /pembayaran/<orderId> + reference MOCK-*", async () => {
    const result = await provider.createPayment({ orderId: "order-1", amount: 87.8 });

    expect(result.redirectUrl).toBe("/pembayaran/order-1");
    expect(result.reference).toMatch(/^MOCK-/);
  });

  it("reference unik untuk setiap createPayment", async () => {
    const a = await provider.createPayment({ orderId: "order-1", amount: 10 });
    const b = await provider.createPayment({ orderId: "order-1", amount: 10 });

    expect(a.reference).not.toBe(b.reference);
  });

  it("handleCallback paid -> { status: paid, reference } dan verify = paid", async () => {
    const created = await provider.createPayment({ orderId: "order-2", amount: 50 });

    expect(await provider.verify(created.reference)).toBe("pending");

    const result = await provider.handleCallback({ reference: created.reference, status: "paid" });

    expect(result).toEqual({ status: "paid", reference: created.reference });
    expect(await provider.verify(created.reference)).toBe("paid");
  });

  it("handleCallback failed -> verify = failed", async () => {
    const created = await provider.createPayment({ orderId: "order-3", amount: 50 });

    await provider.handleCallback({ reference: created.reference, status: "failed" });

    expect(await provider.verify(created.reference)).toBe("failed");
  });

  it("handleCallback reference tidak dikenali -> ApiError PAYMENT_INVALID 422", async () => {
    await expect(
      provider.handleCallback({ reference: "MOCK-tiada", status: "paid" }),
    ).rejects.toMatchObject({ code: "PAYMENT_INVALID", status: 422 });
  });

  it("verify reference tidak dikenali -> pending (bukan throw)", async () => {
    expect(await provider.verify("MOCK-tiada")).toBe("pending");
  });
});
