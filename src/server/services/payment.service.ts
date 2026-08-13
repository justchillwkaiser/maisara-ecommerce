import { db } from "@/lib/db";
import { ApiError } from "@/lib/errors";
import { getPaymentProvider } from "@/lib/payments";

/**
 * Service payment (API.md section 5).
 * Initiate semula + callback dari provider mock FPX. Idempotent: callback
 * dengan status yang sama tidak mengubah payment yang sudah selesai.
 */

/**
 * Initiate semula payment untuk order (API.md section 5 - POST /api/payments/[orderId]).
 * - Order mesti kepunyaan user (atau admin).
 * - PENDING dengan url sedia ada -> return url tersebut (tiada create baru).
 * - FAILED -> reference baru, reset Payment + Order ke PENDING.
 * - PAID -> tidak boleh initiate semula (PAYMENT_INVALID 422).
 */
export async function initiatePayment(
  orderId: string,
  userId: string,
): Promise<{ redirectUrl: string }> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });

  if (!order || order.userId !== userId) {
    throw new ApiError("NOT_FOUND", "Order tidak ditemui.", 404);
  }
  if (order.paymentStatus === "PAID") {
    throw new ApiError("PAYMENT_INVALID", "Pembayaran order ini telah selesai.", 422);
  }

  // Masih PENDING dengan url sah -> teruskan ke halaman pembayaran sedia ada.
  if (order.paymentStatus === "PENDING" && order.payment?.url) {
    return { redirectUrl: order.payment.url };
  }

  // FAILED (atau PENDING tanpa url): create payment baru.
  const provider = getPaymentProvider();
  const amount = Number(order.total.toString());
  const payment = await provider.createPayment({ orderId, amount });

  await db.payment.upsert({
    where: { orderId },
    create: {
      orderId,
      provider: "mock",
      reference: payment.reference,
      status: "PENDING",
      amount: order.total.toString(),
      url: payment.redirectUrl,
    },
    update: {
      reference: payment.reference,
      status: "PENDING",
      url: payment.redirectUrl,
    },
  });
  await db.order.update({
    where: { id: orderId },
    data: { paymentStatus: "PENDING" },
  });

  return { redirectUrl: payment.redirectUrl };
}

/**
 * Callback dari provider (API.md section 5 - POST /api/payments/callback).
 * 1. Verify reference dengan provider (unknown -> PAYMENT_INVALID 422).
 * 2. Cari Payment row ikut reference; tiada -> PAYMENT_INVALID 422.
 * 3. Jika Payment masih PENDING -> update Payment + Order.paymentStatus.
 *    Jika sudah selesai -> idempotent (tiada perubahan).
 */
export async function handlePaymentCallback(payload: {
  reference: string;
  status: "paid" | "failed";
}): Promise<{ status: "paid" | "failed"; reference: string }> {
  const provider = getPaymentProvider();
  const verified = await provider.handleCallback(payload);

  const payment = await db.payment.findUnique({
    where: { reference: verified.reference },
  });
  if (!payment) {
    throw new ApiError("PAYMENT_INVALID", "Rujukan pembayaran tidak sah.", 422);
  }

  if (payment.status === "PENDING") {
    const newStatus = verified.status === "paid" ? "PAID" : "FAILED";
    await db.payment.update({
      where: { id: payment.id },
      data: { status: newStatus },
    });
    await db.order.update({
      where: { id: payment.orderId },
      data: { paymentStatus: newStatus },
    });
  }

  return verified;
}
