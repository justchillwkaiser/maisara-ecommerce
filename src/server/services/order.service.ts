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

/** Status order yang sah (API.md section 4 - PATCH /api/orders/[id]/status). */
export type OrderStatusValue = "PENDING" | "PROCESSING" | "SHIPPED" | "COMPLETED" | "CANCELLED";

/**
 * Transition order yang dibenarkan (API.md section 4):
 * PENDING -> PROCESSING -> SHIPPED -> COMPLETED;
 * CANCELLED hanya dari PENDING/PROCESSING. Tiada rollback selepas SHIPPED.
 */
const ORDER_STATUS_TRANSITIONS: Record<OrderStatusValue, OrderStatusValue[]> = {
  PENDING: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

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

/**
 * Cipta order dari cart user (API.md section 4 - POST /api/orders).
 * 1. Ambil cart user (hanya produk aktif).
 * 2. Kira subtotal/shipping/total DARI DB.
 * 3. Initiate payment DENGAN orderId pra-jana (provider tidak menyentuh DB;
 *    gagal di sini bermakna tiada apa dikomit dan retry selamat kerana
 *    cart masih utuh).
 * 4. Transaction tunggal: klaim + padam baris cart (beg dikosongkan), semak
 *    stok, kurangkan stok (updateMany stock >= qty - elak race), cipta Order
 *    (id pra-jana) + OrderItem snapshot + Payment PENDING. Padam-dahulu
 *    menjadikan checkout idempotent: permintaan kedua yang serentak tidak
 *    mencipta order kedua. Selepas komit tiada operasi yang boleh gagal,
 *    jadi order tidak pernah wujud tanpa payment row (order yatim) dan
 *    retry selepas 500 tidak tersangkut.
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

  // Initiate payment SEBELUM transaction dengan orderId pra-jana. Provider
  // tidak menyentuh DB; jika ini gagal, tiada apa dikomit dan cart masih
  // utuh, jadi retry selamat. Reference + redirectUrl sebenar dibawa masuk
  // ke dalam transaction supaya order tidak pernah komit tanpa payment row.
  const orderId = crypto.randomUUID();
  const provider = getPaymentProvider();
  const payment = await provider.createPayment({ orderId, amount: total.toNumber() });

  await db.$transaction(async (tx) => {
    // Klaim baris cart: padam dahulu, iaitu compare-and-swap. Checkout
    // serentak kedua (double-click / dua tab) padam 0 baris dan dibatalkan,
    // jadi tiada order kedua dan stok tidak ditolak dua kali. Rollback
    // memulihkan baris cart jika langkah berikutnya gagal.
    const claimed = await tx.cartItem.deleteMany({
      where: { userId, id: { in: items.map((item) => item.id) } },
    });
    if (claimed.count !== items.length) {
      throw new ApiError(
        "CART_CHANGED",
        "Cart anda telah berubah. Sila semak beg anda dan cuba lagi.",
        409,
      );
    }
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

    await tx.order.create({
      data: {
        id: orderId,
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
        payment: {
          create: {
            provider: "mock",
            reference: payment.reference,
            status: "PENDING",
            amount: total.toFixed(2),
            url: payment.redirectUrl,
          },
        },
      },
    });
  });

  // Komit berjaya: order + payment row PENDING sentiasa wujud bersama.
  // Tiada operasi fallible selepas titik ini, jadi 500 selepas komit
  // mustahil dari fungsi ini dan retry selepas 500 tidak tersangkut.
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
    /** Imej pertama produk (untuk paparan detail order); null jika tiada. */
    image: string | null;
  }>;
  payment: {
    provider: string;
    reference: string;
    status: string;
    amount: string;
    url: string | null;
  } | null;
}

/** Images disimpan sebagai Json (array URL, kadang-kala string JSON). */
function parseImages(images: unknown): string[] {
  const raw = Array.isArray(images) ? images : typeof images === "string" ? tryParse(images) : [];
  return raw.filter((item): item is string => typeof item === "string");

  function tryParse(value: string): unknown[] {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}

/**
 * Detail order (API.md section 4 - GET /api/orders/[id]).
 * Customer hanya order sendiri; admin boleh semua.
 */
export async function getOrderDetail(orderId: string, user: { id: string; role: string }): Promise<OrderDetail> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: { select: { images: true, name: true } },
            },
          },
        },
      },
      payment: true,
    },
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
      image: parseImages(item.variant?.product?.images)[0] ?? null,
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

export interface AdminOrderListItem {
  id: string;
  status: string;
  paymentStatus: string;
  total: string;
  createdAt: string;
  itemCount: number;
  user: { name: string | null; email: string | null };
}

/** Senarai semua order untuk admin (API.md section 7 - jadual order). */
export async function listAllOrders(): Promise<AdminOrderListItem[]> {
  const orders = await db.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return orders.map((order) => ({
    id: order.id,
    status: order.status,
    paymentStatus: order.paymentStatus,
    total: order.total.toString(),
    createdAt: order.createdAt.toISOString(),
    itemCount: order._count.items,
    user: { name: order.user.name, email: order.user.email },
  }));
}

/**
 * Kemaskini status order (API.md section 4 - PATCH /api/orders/[id]/status).
 * Transaction: semak order + items, validasi transition, pulangkan stok jika
 * CANCELLED dari PENDING/PROCESSING, kemudian update status.
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatusValue,
): Promise<void> {
  await db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: { select: { variantId: true, quantity: true } } },
    });

    if (!order) {
      throw new ApiError("NOT_FOUND", "Order tidak ditemui.", 404);
    }

    const allowed = ORDER_STATUS_TRANSITIONS[order.status as OrderStatusValue] ?? [];
    if (!allowed.includes(status)) {
      throw new ApiError(
        "INVALID_TRANSITION",
        "Perubahan status order tidak sah. Semak aliran status yang dibenarkan.",
        400,
      );
    }

    // CANCELLED: pulangkan stok variants ikut kuantiti setiap item (order
    // asalnya telah tolak stok semasa checkout).
    if (status === "CANCELLED") {
      for (const item of order.items) {
        await tx.productVariant.updateMany({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    await tx.order.update({
      where: { id: orderId },
      data: { status },
    });
  });
}
