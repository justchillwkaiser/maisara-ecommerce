import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Test untuk admin panel (Task 12):
 * - getDashboardStats() dari dashboard.service (stats, recentOrders, lowStockItems)
 * - updateOrderStatus() dari order.service (transition rules + pulang stok)
 * - createProduct() dari product.service (slug auto, SKU unik)
 */

const mocks = vi.hoisted(() => ({
  orderAggregate: vi.fn(),
  orderCount: vi.fn(),
  orderFindMany: vi.fn(),
  orderFindUnique: vi.fn(),
  orderUpdate: vi.fn(),
  variantCount: vi.fn(),
  variantFindMany: vi.fn(),
  variantUpdateMany: vi.fn(),
  productCreate: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    order: {
      aggregate: mocks.orderAggregate,
      count: mocks.orderCount,
      findMany: mocks.orderFindMany,
      findUnique: mocks.orderFindUnique,
      update: mocks.orderUpdate,
    },
    productVariant: {
      count: mocks.variantCount,
      findMany: mocks.variantFindMany,
      updateMany: mocks.variantUpdateMany,
    },
    product: { create: mocks.productCreate },
    $transaction: mocks.transaction,
  },
}));

vi.mock("@/lib/payments", () => ({
  getPaymentProvider: () => ({
    createPayment: vi.fn(),
    handleCallback: vi.fn(),
    verify: vi.fn(),
  }),
}));

import { Prisma } from "@/generated/prisma/client";
import { ApiError } from "@/lib/errors";
import { getDashboardStats } from "@/server/services/dashboard.service";
import { updateOrderStatus } from "@/server/services/order.service";
import { createProduct } from "@/server/services/product.service";

/** Decimal Prisma (mock): toString/toFixed sahaja yang digunakan service. */
function price(amount: string) {
  return { toString: () => amount, toFixed: () => amount };
}

function orderRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "order-1",
    status: "PENDING",
    paymentStatus: "PAID",
    total: price("87.80"),
    createdAt: new Date("2026-08-01T10:00:00.000Z"),
    user: { name: "Nurul Aisyah" },
    _count: { items: 2 },
    ...overrides,
  };
}

function variantRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "v1",
    color: "Mocha",
    size: null,
    sku: "MAI-BELLA-MOCHA",
    stock: 3,
    product: {
      name: "Tudung Bella Voal Premium",
      slug: "tudung-bella-voal",
      images: ["https://img.example/1.jpg"],
    },
    ...overrides,
  };
}

beforeEach(() => {
  for (const fn of Object.values(mocks)) fn.mockReset();
  mocks.transaction.mockImplementation((fn: (tx: unknown) => Promise<unknown>) =>
    fn({
      order: { findUnique: mocks.orderFindUnique, update: mocks.orderUpdate },
      productVariant: { updateMany: mocks.variantUpdateMany },
    }),
  );
});

describe("getDashboardStats", () => {
  it("stats: totalOrders, totalRevenue (PAID sahaja), pendingOrders, lowStockCount", async () => {
    mocks.orderAggregate.mockResolvedValue({ _sum: { total: price("184.50") } });
    mocks.orderCount.mockResolvedValueOnce(10).mockResolvedValueOnce(3);
    mocks.variantCount.mockResolvedValue(4);
    mocks.orderFindMany.mockResolvedValue([]);
    mocks.variantFindMany.mockResolvedValue([]);

    const result = await getDashboardStats();

    expect(result.stats).toEqual({
      totalOrders: 10,
      totalRevenue: "184.50",
      pendingOrders: 3,
      lowStockCount: 4,
    });
    expect(mocks.orderAggregate).toHaveBeenCalledWith({
      where: { paymentStatus: "PAID" },
      _sum: { total: true },
    });
    expect(mocks.orderCount).toHaveBeenCalledWith({ where: { status: "PENDING" } });
    expect(mocks.variantCount).toHaveBeenCalledWith({ where: { stock: { lte: 5 } } });
  });

  it("revenue tiada order PAID -> '0.00'", async () => {
    mocks.orderAggregate.mockResolvedValue({ _sum: { total: null } });
    mocks.orderCount.mockResolvedValue(0);
    mocks.variantCount.mockResolvedValue(0);
    mocks.orderFindMany.mockResolvedValue([]);
    mocks.variantFindMany.mockResolvedValue([]);

    const result = await getDashboardStats();
    expect(result.stats.totalRevenue).toBe("0.00");
  });

  it("recentOrders: 5 terkini + itemCount + user name", async () => {
    mocks.orderAggregate.mockResolvedValue({ _sum: { total: null } });
    mocks.orderCount.mockResolvedValue(0);
    mocks.variantCount.mockResolvedValue(0);
    mocks.orderFindMany.mockResolvedValue([
      orderRow({ id: "o1", total: price("10.00"), user: { name: "Aina Sofea" }, _count: { items: 3 } }),
      orderRow({ id: "o2", status: "PROCESSING", paymentStatus: "PENDING", total: price("20.00") }),
      orderRow({ id: "o3" }),
      orderRow({ id: "o4" }),
      orderRow({ id: "o5" }),
    ]);
    mocks.variantFindMany.mockResolvedValue([]);

    const { recentOrders } = await getDashboardStats();

    expect(recentOrders).toHaveLength(5);
    expect(recentOrders[0]).toEqual({
      id: "o1",
      status: "PENDING",
      paymentStatus: "PAID",
      total: "10.00",
      createdAt: "2026-08-01T10:00:00.000Z",
      itemCount: 3,
      user: { name: "Aina Sofea" },
    });
    expect(recentOrders[1].status).toBe("PROCESSING");
    expect(mocks.orderFindMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { name: true } },
        _count: { select: { items: true } },
      },
    });
  });

  it("lowStockItems: variants stok <= 5 dengan nama produk", async () => {
    mocks.orderAggregate.mockResolvedValue({ _sum: { total: null } });
    mocks.orderCount.mockResolvedValue(0);
    mocks.variantCount.mockResolvedValue(1);
    mocks.orderFindMany.mockResolvedValue([]);
    mocks.variantFindMany.mockResolvedValue([
      variantRow(),
      variantRow({ id: "v2", sku: "MAI-SATIN-TAUPE", stock: 0, color: "Taupe" }),
    ]);

    const { lowStockItems } = await getDashboardStats();

    expect(lowStockItems).toHaveLength(2);
    expect(lowStockItems[0]).toEqual({
      id: "v1",
      color: "Mocha",
      size: null,
      sku: "MAI-BELLA-MOCHA",
      stock: 3,
      product: { name: "Tudung Bella Voal Premium", slug: "tudung-bella-voal", image: "https://img.example/1.jpg" },
    });
    expect(lowStockItems[1].stock).toBe(0);
    expect(mocks.variantFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { stock: { lte: 5 } },
        include: { product: { select: { name: true, slug: true, images: true } } },
      }),
    );
  });
});

describe("updateOrderStatus", () => {
  const orderWithItems = (status: string) => ({
    id: "order-1",
    status,
    items: [
      { variantId: "v1", quantity: 2 },
      { variantId: "v2", quantity: 1 },
    ],
  });

  it("PENDING -> PROCESSING: update status sahaja, tiada sentuh stok", async () => {
    mocks.orderFindUnique.mockResolvedValue(orderWithItems("PENDING"));
    mocks.orderUpdate.mockResolvedValue({});

    await updateOrderStatus("order-1", "PROCESSING");

    expect(mocks.orderUpdate).toHaveBeenCalledWith({
      where: { id: "order-1" },
      data: { status: "PROCESSING" },
    });
    expect(mocks.variantUpdateMany).not.toHaveBeenCalled();
  });

  it("rantai sah: PROCESSING -> SHIPPED -> COMPLETED", async () => {
    mocks.orderUpdate.mockResolvedValue({});
    mocks.orderFindUnique.mockResolvedValueOnce(orderWithItems("PROCESSING"));
    await updateOrderStatus("order-1", "SHIPPED");
    expect(mocks.orderUpdate).toHaveBeenCalledWith({
      where: { id: "order-1" },
      data: { status: "SHIPPED" },
    });

    mocks.orderFindUnique.mockResolvedValueOnce(orderWithItems("SHIPPED"));
    await updateOrderStatus("order-1", "COMPLETED");
    expect(mocks.orderUpdate).toHaveBeenCalledWith({
      where: { id: "order-1" },
      data: { status: "COMPLETED" },
    });
  });

  it("transition tak sah PENDING -> COMPLETED -> INVALID_TRANSITION 400", async () => {
    mocks.orderFindUnique.mockResolvedValue(orderWithItems("PENDING"));

    await expect(updateOrderStatus("order-1", "COMPLETED")).rejects.toMatchObject({
      code: "INVALID_TRANSITION",
      status: 400,
    });
    expect(mocks.orderUpdate).not.toHaveBeenCalled();
    expect(mocks.variantUpdateMany).not.toHaveBeenCalled();
  });

  it("transition tak sah COMPLETED -> SHIPPED -> INVALID_TRANSITION 400", async () => {
    mocks.orderFindUnique.mockResolvedValue(orderWithItems("COMPLETED"));

    await expect(updateOrderStatus("order-1", "SHIPPED")).rejects.toMatchObject({
      code: "INVALID_TRANSITION",
      status: 400,
    });
    expect(mocks.orderUpdate).not.toHaveBeenCalled();
  });

  it("CANCELLED dari PENDING -> pulangkan stok ikut quantity setiap item", async () => {
    mocks.orderFindUnique.mockResolvedValue(orderWithItems("PENDING"));
    mocks.orderUpdate.mockResolvedValue({});

    await updateOrderStatus("order-1", "CANCELLED");

    expect(mocks.variantUpdateMany).toHaveBeenCalledWith({
      where: { id: "v1" },
      data: { stock: { increment: 2 } },
    });
    expect(mocks.variantUpdateMany).toHaveBeenCalledWith({
      where: { id: "v2" },
      data: { stock: { increment: 1 } },
    });
    expect(mocks.orderUpdate).toHaveBeenCalledWith({
      where: { id: "order-1" },
      data: { status: "CANCELLED" },
    });
  });

  it("CANCELLED dari PROCESSING juga pulangkan stok", async () => {
    mocks.orderFindUnique.mockResolvedValue(orderWithItems("PROCESSING"));
    mocks.orderUpdate.mockResolvedValue({});

    await updateOrderStatus("order-1", "CANCELLED");

    expect(mocks.variantUpdateMany).toHaveBeenCalledWith({
      where: { id: "v1" },
      data: { stock: { increment: 2 } },
    });
    expect(mocks.orderUpdate).toHaveBeenCalledWith({
      where: { id: "order-1" },
      data: { status: "CANCELLED" },
    });
  });

  it("CANCELLED dari SHIPPED/COMPLETED -> INVALID_TRANSITION, tiada stok dikembalikan", async () => {
    mocks.orderFindUnique.mockResolvedValue(orderWithItems("SHIPPED"));

    await expect(updateOrderStatus("order-1", "CANCELLED")).rejects.toMatchObject({
      code: "INVALID_TRANSITION",
      status: 400,
    });
    expect(mocks.variantUpdateMany).not.toHaveBeenCalled();
    expect(mocks.orderUpdate).not.toHaveBeenCalled();
  });

  it("order tiada -> NOT_FOUND 404", async () => {
    mocks.orderFindUnique.mockResolvedValue(null);

    await expect(updateOrderStatus("order-1", "PROCESSING")).rejects.toMatchObject({
      code: "NOT_FOUND",
      status: 404,
    });
    expect(mocks.orderUpdate).not.toHaveBeenCalled();
  });
});

describe("createProduct", () => {
  const validInput = {
    name: "Tudung Bawal Premium",
    description: "Kain cotton lembut dan sejuk untuk kegunaan harian.",
    price: 49.9,
    categoryId: "cat-1",
    images: [] as string[],
    featured: false,
    variants: [{ color: "Sage", size: "", sku: "TB-SAGE", stock: 10 }],
  };

  it("slug auto-generate dari name (lowercase-hyphen) + variants nested", async () => {
    mocks.productCreate.mockResolvedValue({ id: "p9", slug: "tudung-bawal-premium" });

    const result = await createProduct(validInput);

    expect(result).toEqual({ id: "p9", slug: "tudung-bawal-premium" });
    expect(mocks.productCreate).toHaveBeenCalledWith({
      data: {
        name: "Tudung Bawal Premium",
        slug: "tudung-bawal-premium",
        description: validInput.description,
        price: "49.90",
        categoryId: "cat-1",
        featured: false,
        images: [],
        variants: {
          create: [{ color: "Sage", size: null, sku: "TB-SAGE", stock: 10 }],
        },
      },
      select: { id: true, slug: true },
    });
  });

  it("slug custom dikekalkan jika diberi", async () => {
    mocks.productCreate.mockResolvedValue({ id: "p9", slug: "bawal-istimewa" });

    await createProduct({ ...validInput, slug: "bawal-istimewa" });

    expect(mocks.productCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ slug: "bawal-istimewa" }) }),
    );
  });

  it("SKU duplicate (P2002) -> SKU_EXISTS 409", async () => {
    mocks.productCreate.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "test",
        meta: { target: ["ProductVariant_sku_key"] },
      }),
    );

    await expect(createProduct(validInput)).rejects.toMatchObject({
      code: "SKU_EXISTS",
      status: 409,
    });
  });

  it("slug duplicate (P2002) -> SLUG_EXISTS 409", async () => {
    mocks.productCreate.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "test",
        meta: { target: ["slug"] },
      }),
    );

    await expect(createProduct(validInput)).rejects.toMatchObject({
      code: "SLUG_EXISTS",
      status: 409,
    });
  });

  it("kesalahan lain -> rethrow (bukan ApiError)", async () => {
    mocks.productCreate.mockRejectedValue(new Error("db down"));

    await expect(createProduct(validInput)).rejects.toThrow("db down");
    await expect(createProduct(validInput)).rejects.not.toBeInstanceOf(ApiError);
  });
});
