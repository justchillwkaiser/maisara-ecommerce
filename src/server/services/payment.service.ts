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
 * - CANCELLED -> tidak boleh bayar order yang sudah dibatalkan.
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
  if (order.status === "CANCELLED") {
    throw new ApiError("PAYMENT_INVALID", "Order ini telah dibatalkan.", 422);
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
 * 3. Update bersyarat PENDING -> PAID/FAILED (compare-and-swap dalam
 *    transaction): callback pendua atau dua callback serentak tidak boleh
 *    menulis dua kali dan tidak boleh menukar keputusan yang sudah selesai.
 * 4. Pulangkan status SEBENAR dari DB, bukan status yang diminta, supaya
 *    URL callback yang dimainkan semula (refresh / bookmark) tidak
 *    melaporkan status berbeza daripada order sebenar.
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
  const stored = await db.$transaction(async (tx) => {
    const target = verified.status === "paid" ? "PAID" : "FAILED";
    // Hanya callback yang menemui baris masih PENDING boleh menulis.
    const updated = await tx.payment.updateMany({
      where: { id: payment.id, status: "PENDING" },
      data: { status: target },
    });
    if (updated.count > 0) {
      await tx.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: target },
      });
      return target;
    }
    // Sudah selesai (callback pendua / kalah race): keputusan pertama kekal.
    const current = await tx.payment.findUnique({
      where: { id: payment.id },
      select: { status: true },
    });
    return current?.status ?? payment.status;
  });
  return {
    status: stored === "PAID" ? "paid" : "failed",
    reference: verified.reference,
  };
}
