import { MockPaymentProvider } from "./mock";
import type { PaymentProvider } from "./types";

/**
 * Factory payment provider (ARCHITECTURE.md section 6).
 * Pilih provider ikut env PAYMENT_PROVIDER; default mock.
 * Provider sebenar (billplz/toyyibpay) ditambah selepas SSM - buat class
 * baru dan daftar di sini, tiada perubahan pada service layer.
 */
export function getPaymentProvider(): PaymentProvider {
  switch (process.env.PAYMENT_PROVIDER ?? "mock") {
    case "billplz":
    case "toyyibpay":
      throw new Error(
        `Payment provider "${process.env.PAYMENT_PROVIDER}" belum disediakan. Guna PAYMENT_PROVIDER=mock untuk pembangunan.`,
      );
    default:
      return new MockPaymentProvider();
  }
}
