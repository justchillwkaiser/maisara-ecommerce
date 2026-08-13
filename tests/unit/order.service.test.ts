import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cartItemFindMany: vi.fn(),
  variantFindUnique: vi.fn(),
  variantUpdateMany: vi.fn(),
  orderCreate: vi.fn(),
  orderFindMany: vi.fn(),
  orderFindUnique: vi.fn(),
  orderUpdate: vi.fn(),
  paymentCreate: vi.fn(),
  paymentUpsert: vi.fn(),
  paymentFindUnique: vi.fn(),
  paymentUpdate: vi.fn(),
  transaction: vi.fn(),
  providerCreatePayment: vi.fn(),
  providerHandleCallback: vi.fn(),
  providerVerify: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    cartItem: { findMany: mocks.cartItemFindMany },
    productVariant: { findUnique: mocks.variantFindUnique, updateMany: mocks.variantUpdateMany },
    order: {
      create: mocks.orderCreate,
      findMany: mocks.orderFindMany,
      findUnique: mocks.orderFindUnique,
      update: mocks.orderUpdate,
    },
    payment: {
      create: mocks.paymentCreate,
      upsert: mocks.paymentUpsert,
      findUnique: mocks.paymentFindUnique,
      update: mocks.paymentUpdate,
    },
    $transaction: mocks.transaction,
  },
}));

vi.mock("@/lib/payments", () => ({
  getPaymentProvider: () => ({
    createPayment: mocks.providerCreatePayment,
    handleCallback: mocks.providerHandleCallback,
    verify: mocks.providerVerify,
  }),
}));

import { ApiError } from "@/lib/errors";
import type { CheckoutInput } from "@/lib/validations/order";
import { createOrder } from "@/server/services/order.service";
import { handlePaymentCallback, initiatePayment } from "@/server/services/payment.service";

/** Row CartItem raw dari mock db (bentuk sama dengan include variant+product). */
function cartRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "ci1",
    userId: "user-1",
    sessionId: null,
    variantId: "v1",
    quantity: 2,
    variant: {
      id: "v1",
      color: "Sage",
      size: null,
      sku: "MAI-BELLA-SAGE",
      stock: 10,
      product: {
        id: "p1",
        name: "Tudung Bella Voal Premium",
        price: { toString: () => "39.90" },
      },
    },
    ...overrides,
  };
}

function price(amount: string) {
  return { toString: () => amount };
}

const validInput: CheckoutInput = {
  shippingAddress: {
    name: "Nurul Aisyah",
    phone: "0123456789",
    address: "No. 12, Jalan Mawar, Taman Mawar",
    state: "Selangor",
    postcode: "40000",
  },
  shippingMethod: "J&T Express",
};

beforeEach(() => {
  for (const fn of Object.values(mocks)) fn.mockReset();
  mocks.transaction.mockImplementation((fn: (tx: unknown) => Promise<unknown>) =>
    fn({
      productVariant: {
        findUnique: mocks.variantFindUnique,
        updateMany: mocks.variantUpdateMany,
      },
      order: { create: mocks.orderCreate },
    }),
  );
});

describe("createOrder", () => {
  it("cipta Order + OrderItem + Payment, kurangkan stok, initiate payment, return redirectUrl", async () => {
    mocks.cartItemFindMany.mockResolvedValue([cartRow()]);
    mocks.variantFindUnique.mockResolvedValue({ id: "v1", stock: 10 });
    mocks.variantUpdateMany.mockResolvedValue({ count: 1 });
    mocks.orderCreate.mockResolvedValue({ id: "order-1" });
    mocks.providerCreatePayment.mockResolvedValue({
      redirectUrl: "/pembayaran/order-1",
      reference: "MOCK-abc123",
    });
    mocks.paymentCreate.mockResolvedValue({ id: "pay-1" });

    const result = await createOrder("user-1", validInput);

    expect(result).toEqual({
      orderId: "order-1",
      paymentReference: "MOCK-abc123",
      redirectUrl: "/pembayaran/order-1",
    });

    // Stok dikurangkan via updateMany (race-safe, stock >= qty)
    expect(mocks.variantUpdateMany).toHaveBeenCalledWith({
      where: { id: "v1", stock: { gte: 2 } },
      data: { stock: { decrement: 2 } },
    });

    // Order + OrderItem snapshot (harga dari DB, bukan client)
    expect(mocks.orderCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user-1",
          status: "PENDING",
          subtotal: "79.80",
          shippingFee: "8.00",
          total: "87.80",
          shippingMethod: "J&T Express",
          shippingAddress: validInput.shippingAddress,
          items: {
            create: [
              expect.objectContaining({
                variantId: "v1",
                productName: "Tudung Bella Voal Premium",
                color: "Sage",
                size: null,
                quantity: 2,
                unitPrice: "39.90",
              }),
            ],
          },
        }),
      }),
    );

    // Payment PENDING dengan reference dari provider
    expect(mocks.paymentCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        orderId: "order-1",
        provider: "mock",
        reference: "MOCK-abc123",
        status: "PENDING",
        amount: "87.80",
        url: "/pembayaran/order-1",
      }),
    });
  });

  it("dua item + Pos Laju ke Sabah -> subtotal/shipping/total betul", async () => {
    mocks.cartItemFindMany.mockResolvedValue([
      cartRow(),
      cartRow({
        id: "ci2",
        variantId: "v2",
        quantity: 1,
        variant: {
          ...cartRow().variant,
          id: "v2",
          color: "Ivory",
          product: {
            ...cartRow().variant.product,
            name: "Shawl Silk Premium",
            price: price("89.00"),
          },
        },
      }),
    ]);
    mocks.variantFindUnique
      .mockResolvedValueOnce({ id: "v1", stock: 10 })
      .mockResolvedValueOnce({ id: "v2", stock: 8 });
    mocks.variantUpdateMany.mockResolvedValue({ count: 1 });
    mocks.orderCreate.mockResolvedValue({ id: "order-1" });
    mocks.providerCreatePayment.mockResolvedValue({
      redirectUrl: "/pembayaran/order-1",
      reference: "MOCK-xyz",
    });
    mocks.paymentCreate.mockResolvedValue({});

    await createOrder("user-1", {
      ...validInput,
      shippingMethod: "Pos Laju",
      shippingAddress: { ...validInput.shippingAddress, state: "Sabah" },
    });

    // 39.90*2 + 89.00 = 168.80; Pos Laju Sabah = 11.00; total 179.80
    expect(mocks.orderCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          subtotal: "168.80",
          shippingFee: "11.00",
          total: "179.80",
        }),
      }),
    );
    expect(mocks.orderCreate.mock.calls[0][0].data.items.create).toHaveLength(2);
  });

  it("cart kosong -> ApiError EMPTY_CART 400, tiada transaction", async () => {
    mocks.cartItemFindMany.mockResolvedValue([]);

    await expect(createOrder("user-1", validInput)).rejects.toMatchObject({
      code: "EMPTY_CART",
      status: 400,
    });
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.paymentCreate).not.toHaveBeenCalled();
  });

  it("stok tak cukup -> INSUFFICIENT_STOCK 409, tiada order, stok tak berubah", async () => {
    mocks.cartItemFindMany.mockResolvedValue([cartRow({ quantity: 5 })]);
    mocks.variantFindUnique.mockResolvedValue({ id: "v1", stock: 3 });

    await expect(createOrder("user-1", validInput)).rejects.toMatchObject({
      code: "INSUFFICIENT_STOCK",
      status: 409,
    });
    expect(mocks.variantUpdateMany).not.toHaveBeenCalled();
    expect(mocks.orderCreate).not.toHaveBeenCalled();
    expect(mocks.paymentCreate).not.toHaveBeenCalled();
  });

  it("race: updateMany count 0 -> INSUFFICIENT_STOCK, tiada order", async () => {
    mocks.cartItemFindMany.mockResolvedValue([cartRow()]);
    mocks.variantFindUnique.mockResolvedValue({ id: "v1", stock: 10 });
    mocks.variantUpdateMany.mockResolvedValue({ count: 0 });

    await expect(createOrder("user-1", validInput)).rejects.toMatchObject({
      code: "INSUFFICIENT_STOCK",
      status: 409,
    });
    expect(mocks.orderCreate).not.toHaveBeenCalled();
    expect(mocks.paymentCreate).not.toHaveBeenCalled();
  });

  it("runtuhkan stok sebelum payment (payment gagal) -> order kekal tanpa payment row", async () => {
    mocks.cartItemFindMany.mockResolvedValue([cartRow()]);
    mocks.variantFindUnique.mockResolvedValue({ id: "v1", stock: 10 });
    mocks.variantUpdateMany.mockResolvedValue({ count: 1 });
    mocks.orderCreate.mockResolvedValue({ id: "order-1" });
    mocks.providerCreatePayment.mockRejectedValue(new Error("provider down"));

    await expect(createOrder("user-1", validInput)).rejects.toThrow("provider down");
    expect(mocks.orderCreate).toHaveBeenCalledTimes(1);
    expect(mocks.paymentCreate).not.toHaveBeenCalled();
  });
});

describe("initiatePayment", () => {
  it("order milik user PENDING -> return redirectUrl sedia ada (tiada create baru)", async () => {
    mocks.orderFindUnique.mockResolvedValue({
      id: "order-1",
      userId: "user-1",
      total: price("87.80"),
      paymentStatus: "PENDING",
      payment: { url: "/pembayaran/order-1" },
    });

    const result = await initiatePayment("order-1", "user-1");

    expect(result).toEqual({ redirectUrl: "/pembayaran/order-1" });
    expect(mocks.providerCreatePayment).not.toHaveBeenCalled();
  });

  it("payment FAILED -> create reference baru, reset Payment + Order ke PENDING", async () => {
    mocks.orderFindUnique.mockResolvedValue({
      id: "order-1",
      userId: "user-1",
      total: price("87.80"),
      paymentStatus: "FAILED",
      payment: { url: "/pembayaran/order-1", reference: "MOCK-lama" },
    });
    mocks.providerCreatePayment.mockResolvedValue({
      redirectUrl: "/pembayaran/order-1",
      reference: "MOCK-baru",
    });
    mocks.paymentUpsert.mockResolvedValue({});
    mocks.orderUpdate.mockResolvedValue({});

    const result = await initiatePayment("order-1", "user-1");

    expect(result).toEqual({ redirectUrl: "/pembayaran/order-1" });
    expect(mocks.paymentUpsert).toHaveBeenCalledWith({
      where: { orderId: "order-1" },
      create: expect.objectContaining({
        orderId: "order-1",
        reference: "MOCK-baru",
        status: "PENDING",
        amount: "87.80",
        url: "/pembayaran/order-1",
      }),
      update: expect.objectContaining({
        reference: "MOCK-baru",
        status: "PENDING",
        url: "/pembayaran/order-1",
      }),
    });
    expect(mocks.orderUpdate).toHaveBeenCalledWith({
      where: { id: "order-1" },
      data: { paymentStatus: "PENDING" },
    });
  });

  it("order bukan milik user -> NOT_FOUND 404", async () => {
    mocks.orderFindUnique.mockResolvedValue({
      id: "order-1",
      userId: "user-lain",
      paymentStatus: "PENDING",
      payment: { url: "/pembayaran/order-1" },
    });

    await expect(initiatePayment("order-1", "user-1")).rejects.toMatchObject({
      code: "NOT_FOUND",
      status: 404,
    });
  });

  it("order tiada -> NOT_FOUND 404", async () => {
    mocks.orderFindUnique.mockResolvedValue(null);

    await expect(initiatePayment("order-1", "user-1")).rejects.toMatchObject({
      code: "NOT_FOUND",
      status: 404,
    });
  });

  it("paymentStatus PAID -> PAYMENT_INVALID 422 (elak bayar dua kali)", async () => {
    mocks.orderFindUnique.mockResolvedValue({
      id: "order-1",
      userId: "user-1",
      total: price("87.80"),
      paymentStatus: "PAID",
      payment: { url: "/pembayaran/order-1", reference: "MOCK-siap" },
    });

    await expect(initiatePayment("order-1", "user-1")).rejects.toMatchObject({
      code: "PAYMENT_INVALID",
      status: 422,
    });
  });
});

describe("handlePaymentCallback", () => {
  it("paid -> Payment PAID + Order.paymentStatus PAID, return { status, reference }", async () => {
    mocks.providerHandleCallback.mockResolvedValue({ status: "paid", reference: "MOCK-abc" });
    mocks.paymentFindUnique.mockResolvedValue({
      id: "pay-1",
      orderId: "order-1",
      reference: "MOCK-abc",
      status: "PENDING",
    });
    mocks.paymentUpdate.mockResolvedValue({});
    mocks.orderUpdate.mockResolvedValue({});

    const result = await handlePaymentCallback({ reference: "MOCK-abc", status: "paid" });

    expect(result).toEqual({ status: "paid", reference: "MOCK-abc" });
    expect(mocks.paymentUpdate).toHaveBeenCalledWith({
      where: { id: "pay-1" },
      data: { status: "PAID" },
    });
    expect(mocks.orderUpdate).toHaveBeenCalledWith({
      where: { id: "order-1" },
      data: { paymentStatus: "PAID" },
    });
  });

  it("failed -> Payment FAILED + Order.paymentStatus FAILED", async () => {
    mocks.providerHandleCallback.mockResolvedValue({ status: "failed", reference: "MOCK-abc" });
    mocks.paymentFindUnique.mockResolvedValue({
      id: "pay-1",
      orderId: "order-1",
      status: "PENDING",
    });
    mocks.paymentUpdate.mockResolvedValue({});
    mocks.orderUpdate.mockResolvedValue({});

    await handlePaymentCallback({ reference: "MOCK-abc", status: "failed" });

    expect(mocks.paymentUpdate).toHaveBeenCalledWith({
      where: { id: "pay-1" },
      data: { status: "FAILED" },
    });
    expect(mocks.orderUpdate).toHaveBeenCalledWith({
      where: { id: "order-1" },
      data: { paymentStatus: "FAILED" },
    });
  });

  it("idempotent: panggilan kedua dengan status sama -> tiada update kedua", async () => {
    mocks.providerHandleCallback.mockResolvedValue({ status: "paid", reference: "MOCK-abc" });
    mocks.paymentFindUnique
      .mockResolvedValueOnce({ id: "pay-1", orderId: "order-1", status: "PENDING" })
      .mockResolvedValueOnce({ id: "pay-1", orderId: "order-1", status: "PAID" });
    mocks.paymentUpdate.mockResolvedValue({});
    mocks.orderUpdate.mockResolvedValue({});

    await handlePaymentCallback({ reference: "MOCK-abc", status: "paid" });
    await handlePaymentCallback({ reference: "MOCK-abc", status: "paid" });

    expect(mocks.paymentUpdate).toHaveBeenCalledTimes(1);
    expect(mocks.orderUpdate).toHaveBeenCalledTimes(1);
  });

  it("status berbeza pada payment selesai -> tidak mengubah status asal (first-wins)", async () => {
    mocks.providerHandleCallback.mockResolvedValue({ status: "failed", reference: "MOCK-abc" });
    mocks.paymentFindUnique.mockResolvedValue({
      id: "pay-1",
      orderId: "order-1",
      status: "PAID",
    });

    await handlePaymentCallback({ reference: "MOCK-abc", status: "failed" });

    expect(mocks.paymentUpdate).not.toHaveBeenCalled();
    expect(mocks.orderUpdate).not.toHaveBeenCalled();
  });

  it("reference tidak dikenali oleh provider -> PAYMENT_INVALID 422, tiada update", async () => {
    mocks.providerHandleCallback.mockRejectedValue(
      new ApiError("PAYMENT_INVALID", "Rujukan pembayaran tidak sah.", 422),
    );

    await expect(
      handlePaymentCallback({ reference: "MOCK-nope", status: "paid" }),
    ).rejects.toMatchObject({ code: "PAYMENT_INVALID", status: 422 });
    expect(mocks.paymentUpdate).not.toHaveBeenCalled();
    expect(mocks.orderUpdate).not.toHaveBeenCalled();
  });

  it("reference sah di provider tapi tiada Payment row -> PAYMENT_INVALID 422", async () => {
    mocks.providerHandleCallback.mockResolvedValue({ status: "paid", reference: "MOCK-abc" });
    mocks.paymentFindUnique.mockResolvedValue(null);

    await expect(
      handlePaymentCallback({ reference: "MOCK-abc", status: "paid" }),
    ).rejects.toMatchObject({ code: "PAYMENT_INVALID", status: 422 });
    expect(mocks.paymentUpdate).not.toHaveBeenCalled();
  });
});
