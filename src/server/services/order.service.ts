import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/errors";
import { getPaymentProvider } from "@/lib/payments";
import { shippingRates } from "@/lib/shipping";
import type { CheckoutInput } from "@/lib/validations/order";

/**
 * Service order & checkout (API.md section 4).
 * Layer bebas transport: kira harga dari DB sahaja, semak + kurangkan stok
 * dalam transaction, cipta Order + OrderItem + Payment, initiate payment.
 */

export interface CreateOrderResult {
  orderId: string;
  paymentReference: string;
  redirectUrl: string;
}

/** Include penuh untuk baris cart semasa checkout (harga & snapshot dari DB). */
const CHECKOUT_CART_INCLUDE = {
  variant: {
    include: {
      product: {
        select: { id: true, name: true, price: true },
      },
    },
  },
} satisfies Prisma.CartItemInclude;

type CheckoutCartRow = Prisma.CartItemGetPayload<{ include: typeof CHECKOUT_CART_INCLUDE }>;

/**
 * Cipta order dari cart user (API.md section 4 - POST /api/orders).
 * 1. Ambil cart user (hanya produk aktif).
 * 2. Kira subtotal/shipping/total DARI DB.
 * 3. Transaction: semak stok, kurangkan stok (updateMany stock >= qty -
 *    elak race), cipta Order + OrderItem snapshot.
 * 4. Initiate payment (provider) + cipta Payment row PENDING.
 */
export async function createOrder(
  userId: string,
  input: CheckoutInput,
): Promise<CreateOrderResult> {
  const items = await db.cartItem.findMany({
    where: { userId, variant: { product: { isActive: true } } },
    include: CHECKOUT_CART_INCLUDE,
  });

  if (items.length === 0) {
    throw new ApiError("EMPTY_CART", "Cart anda kosong. Tambah item dahulu sebelum checkout.", 400);
  }

  const shippingFee = shippingRates(input.shippingMethod, input.shippingAddress.state);
  const subtotal = items.reduce(
    (sum, item) =>
      sum.add(new Prisma.Decimal(item.variant.product.price.toString()).mul(item.quantity)),
    new Prisma.Decimal(0),
  );
  const total = subtotal.add(new Prisma.Decimal(shippingFee));

  const orderId = await db.$transaction(async (tx) => {
    // Semak stok setiap variant (mesej jelas dengan nama produk).
    for (const item of items) {
      const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
      if (!variant || variant.stock < item.quantity) {
        const label = item.variant.color ? ` (${item.variant.color})` : "";
        throw new ApiError(
          "INSUFFICIENT_STOCK",
          `Stok tidak mencukupi untuk ${item.variant.product.name}${label}.`,
          409,
        );
      }
    }

    // Kurangkan stok secara race-safe: updateMany hanya jika stok masih cukup.
    for (const item of items) {
      const updated = await tx.productVariant.updateMany({
        where: { id: item.variantId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (updated.count === 0) {
        throw new ApiError(
          "INSUFFICIENT_STOCK",
          `Stok tidak mencukupi untuk ${item.variant.product.name}.`,
          409,
        );
      }
    }

    const order = await tx.order.create({
      data: {
        userId,
        status: "PENDING",
        subtotal: subtotal.toFixed(2),
        shippingFee: shippingFee.toFixed(2),
        total: total.toFixed(2),
        shippingMethod: input.shippingMethod,
        shippingAddress: input.shippingAddress,
        items: {
          create: items.map((item) => ({
            variantId: item.variantId,
            productName: item.variant.product.name,
            color: item.variant.color,
            size: item.variant.size,
            quantity: item.quantity,
            unitPrice: item.variant.product.price.toString(),
          })),
        },
      },
      select: { id: true },
    });

    return order.id;
  });

  // Initiate payment di luar transaction (call provider berbeza-beza;
  // mock: dalam memory). Kegagalan di sini tidak membatalkan order - admin
  // boleh initiate semula melalui POST /api/payments/[orderId].
  const provider = getPaymentProvider();
  const payment = await provider.createPayment({ orderId, amount: total.toNumber() });

  await db.payment.create({
    data: {
      orderId,
      provider: "mock",
      reference: payment.reference,
      status: "PENDING",
      amount: total.toFixed(2),
      url: payment.redirectUrl,
    },
  });

  return { orderId, paymentReference: payment.reference, redirectUrl: payment.redirectUrl };
}

export interface OrderListItem {
  id: string;
  status: string;
  total: string;
  createdAt: string;
  itemCount: number;
  paymentStatus: string;
}

/** Sejarah order user (API.md section 4 - GET /api/orders). */
export async function listUserOrders(userId: string): Promise<OrderListItem[]> {
  const orders = await db.order.findMany({
    where: { userId },
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: "desc" },
  });

  return orders.map((order) => ({
    id: order.id,
    status: order.status,
    total: order.total.toString(),
    createdAt: order.createdAt.toISOString(),
    itemCount: order._count.items,
    paymentStatus: order.paymentStatus,
  }));
}

export interface OrderDetail {
  id: string;
  status: string;
  paymentStatus: string;
  subtotal: string;
  shippingFee: string;
  total: string;
  shippingMethod: string;
  shippingAddress: unknown;
  createdAt: string;
  items: Array<{
    id: string;
    productName: string;
    color: string | null;
    size: string | null;
    quantity: number;
    unitPrice: string;
  }>;
  payment: {
    provider: string;
    reference: string;
    status: string;
    amount: string;
    url: string | null;
  } | null;
}

/**
 * Detail order (API.md section 4 - GET /api/orders/[id]).
 * Customer hanya order sendiri; admin boleh semua.
 */
export async function getOrderDetail(orderId: string, user: { id: string; role: string }): Promise<OrderDetail> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true, payment: true },
  });

  if (!order || (order.userId !== user.id && user.role !== "ADMIN")) {
    throw new ApiError("NOT_FOUND", "Order tidak ditemui.", 404);
  }

  return {
    id: order.id,
    status: order.status,
    paymentStatus: order.paymentStatus,
    subtotal: order.subtotal.toString(),
    shippingFee: order.shippingFee.toString(),
    total: order.total.toString(),
    shippingMethod: order.shippingMethod,
    shippingAddress: order.shippingAddress,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      color: item.color,
      size: item.size,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toString(),
    })),
    payment: order.payment
      ? {
          provider: order.payment.provider,
          reference: order.payment.reference,
          status: order.payment.status,
          amount: order.payment.amount.toString(),
          url: order.payment.url,
        }
      : null,
  };
}
