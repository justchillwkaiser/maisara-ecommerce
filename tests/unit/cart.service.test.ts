import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cartItemFindMany: vi.fn(),
  cartItemFindUnique: vi.fn(),
  cartItemUpsert: vi.fn(),
  cartItemUpdateMany: vi.fn(),
  cartItemDeleteMany: vi.fn(),
  variantFindUnique: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    cartItem: {
      findMany: mocks.cartItemFindMany,
      findUnique: mocks.cartItemFindUnique,
      upsert: mocks.cartItemUpsert,
      updateMany: mocks.cartItemUpdateMany,
      deleteMany: mocks.cartItemDeleteMany,
    },
    productVariant: { findUnique: mocks.variantFindUnique },
    $transaction: mocks.transaction,
  },
}));

import {
  addToCart,
  getCart,
  mergeCart,
  removeCartItem,
  updateCartItem,
} from "@/server/services/cart.service";

const ctxGuest = { sessionId: "sess-1", userId: null };
const ctxUser = { sessionId: null, userId: "user-1" };

/** Row CartItem raw dari mock db - bentuk sama dengan hasil db.cartItem.findMany include variant+product. */
function cartRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "ci1",
    sessionId: "sess-1",
    userId: null,
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
        slug: "tudung-bella-voal",
        price: { toString: () => "39.90" },
        images: ["https://cdn.example.com/1.jpg"],
        isActive: true,
      },
    },
    ...overrides,
  };
}

function price(amount: string) {
  return { toString: () => amount };
}

beforeEach(() => {
  mocks.cartItemFindMany.mockReset();
  mocks.cartItemFindUnique.mockReset();
  mocks.cartItemUpsert.mockReset();
  mocks.cartItemUpdateMany.mockReset();
  mocks.cartItemDeleteMany.mockReset();
  mocks.variantFindUnique.mockReset();
  mocks.transaction.mockReset();
  mocks.transaction.mockImplementation(
    (fn: (tx: unknown) => Promise<unknown>) =>
      fn({
        cartItem: {
          upsert: mocks.cartItemUpsert,
          updateMany: mocks.cartItemUpdateMany,
          deleteMany: mocks.cartItemDeleteMany,
        },
      }),
  );
});

describe("getCart", () => {
  it("transform items, kira unitPrice/lineTotal/subtotal/itemCount (jumlah kuantiti)", async () => {
    mocks.cartItemFindMany.mockResolvedValue([
      cartRow(),
      cartRow({
        id: "ci2",
        variantId: "v2",
        quantity: 1,
        variant: {
          id: "v2",
          color: "Ivory",
          size: "M",
          sku: "MAI-BELLA-IVORY",
          stock: 8,
          product: {
            id: "p2",
            name: "Shawl Silk Premium",
            slug: "shawl-silk-premium",
            price: price("89.00"),
            images: ["https://cdn.example.com/2.jpg"],
            isActive: true,
          },
        },
      }),
    ]);

    const result = await getCart(ctxGuest);

    expect(result).toEqual({
      items: [
        {
          id: "ci1",
          variantId: "v1",
          quantity: 2,
          product: { id: "p1", name: "Tudung Bella Voal Premium", slug: "tudung-bella-voal" },
          variant: { color: "Sage", size: null, sku: "MAI-BELLA-SAGE", stock: 10 },
          unitPrice: "39.90",
          lineTotal: "79.80",
          image: "https://cdn.example.com/1.jpg",
        },
        {
          id: "ci2",
          variantId: "v2",
          quantity: 1,
          product: { id: "p2", name: "Shawl Silk Premium", slug: "shawl-silk-premium" },
          variant: { color: "Ivory", size: "M", sku: "MAI-BELLA-IVORY", stock: 8 },
          unitPrice: "89.00",
          lineTotal: "89.00",
          image: "https://cdn.example.com/2.jpg",
        },
      ],
      subtotal: "168.80",
      itemCount: 3,
    });

    expect(mocks.cartItemFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ sessionId: "sess-1" }),
        orderBy: { id: "desc" },
      }),
    );
  });

  it("cart user guna userId; item produk tak aktif ditapis", async () => {
    mocks.cartItemFindMany.mockResolvedValue([]);

    await getCart(ctxUser);

    expect(mocks.cartItemFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: "user-1",
          variant: { product: { isActive: true } },
        }),
      }),
    );
  });

  it("images sebagai string JSON -> image pertama", async () => {
    mocks.cartItemFindMany.mockResolvedValue([
      cartRow({
        variant: {
          ...cartRow().variant,
          product: {
            ...cartRow().variant.product,
            images: '["https://cdn.example.com/parsed.jpg"]',
          },
        },
      }),
    ]);

    const result = await getCart(ctxGuest);

    expect(result.items[0].image).toBe("https://cdn.example.com/parsed.jpg");
  });

  it("cart kosong -> items [], subtotal 0.00, itemCount 0", async () => {
    mocks.cartItemFindMany.mockResolvedValue([]);

    const result = await getCart(ctxGuest);

    expect(result).toEqual({ items: [], subtotal: "0.00", itemCount: 0 });
  });
});

describe("addToCart", () => {
  it("item baru -> upsert create, return getCart", async () => {
    mocks.variantFindUnique.mockResolvedValue({ id: "v1", stock: 10, product: { isActive: true } });
    mocks.cartItemUpsert.mockResolvedValue({ id: "ci1", quantity: 2 });
    mocks.cartItemFindMany.mockResolvedValue([]);

    const result = await addToCart(ctxGuest, { variantId: "v1", quantity: 2 });

    expect(mocks.variantFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "v1" } }),
    );
    expect(mocks.cartItemUpsert).toHaveBeenCalledWith({
      where: { sessionId_variantId: { sessionId: "sess-1", variantId: "v1" } },
      create: { sessionId: "sess-1", variantId: "v1", quantity: 2 },
      update: { quantity: { increment: 2 } },
      select: { id: true, quantity: true },
    });
    // 2 <= stok 10 - tiada tulis tambahan.
    expect(mocks.cartItemUpdateMany).not.toHaveBeenCalled();
    expect(result.itemCount).toBe(0);
  });

  it("cart user guna userId_variantId dalam upsert", async () => {
    mocks.variantFindUnique.mockResolvedValue({ id: "v1", stock: 10, product: { isActive: true } });
    mocks.cartItemUpsert.mockResolvedValue({ id: "ci1", quantity: 1 });
    mocks.cartItemFindMany.mockResolvedValue([]);

    await addToCart(ctxUser, { variantId: "v1", quantity: 1 });

    expect(mocks.cartItemUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_variantId: { userId: "user-1", variantId: "v1" } },
        create: expect.objectContaining({ userId: "user-1" }),
      }),
    );
  });

  it("tanpa userId dan sessionId -> VALIDATION_ERROR 400 (elak baris sessionId kosong dikongsi)", async () => {
    await expect(
      addToCart({ sessionId: null, userId: null }, { variantId: "v1", quantity: 1 }),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR", status: 400 });

    expect(mocks.variantFindUnique).not.toHaveBeenCalled();
    expect(mocks.cartItemUpsert).not.toHaveBeenCalled();
  });

  it("item wujud -> increment (bukan tulis nilai mutlak) dan cap pada stok variant", async () => {
    mocks.variantFindUnique.mockResolvedValue({ id: "v1", stock: 10, product: { isActive: true } });
    mocks.cartItemUpsert.mockResolvedValue({ id: "ci1", quantity: 13 });
    mocks.cartItemFindMany.mockResolvedValue([]);

    await addToCart(ctxGuest, { variantId: "v1", quantity: 5 });

    // Increment +5 di DB (atomic) - baca-lalu-tulis hilang kuantiti bila serentak.
    expect(mocks.cartItemUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ update: { quantity: { increment: 5 } } }),
    );
    // 13 > stok 10 -> cap bersyarat (hanya jika masih melebihi stok).
    expect(mocks.cartItemUpdateMany).toHaveBeenCalledWith({
      where: { id: "ci1", quantity: { gt: 10 } },
      data: { quantity: 10 },
    });
  });

  it("stok 0 -> throw ApiError OUT_OF_STOCK 409", async () => {
    mocks.variantFindUnique.mockResolvedValue({ id: "v1", stock: 0, product: { isActive: true } });

    await expect(addToCart(ctxGuest, { variantId: "v1", quantity: 1 })).rejects.toMatchObject({
      code: "OUT_OF_STOCK",
      status: 409,
    });
    expect(mocks.cartItemUpsert).not.toHaveBeenCalled();
  });

  it("stok lebih kecil daripada kuantiti diminta -> create dicap pada stok", async () => {
    mocks.variantFindUnique.mockResolvedValue({ id: "v1", stock: 3, product: { isActive: true } });
    mocks.cartItemUpsert.mockResolvedValue({ id: "ci1", quantity: 3 });
    mocks.cartItemFindMany.mockResolvedValue([]);

    await addToCart(ctxGuest, { variantId: "v1", quantity: 9 });

    expect(mocks.cartItemUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ create: expect.objectContaining({ quantity: 3 }) }),
    );
  });

  it("variant tak wujud / produk tak aktif -> NOT_FOUND 404", async () => {
    mocks.variantFindUnique.mockResolvedValue(null);

    await expect(addToCart(ctxGuest, { variantId: "v1", quantity: 1 })).rejects.toMatchObject({
      code: "NOT_FOUND",
      status: 404,
    });
  });
});

describe("updateCartItem", () => {
  it("quantity cap pada stok variant", async () => {
    mocks.cartItemFindUnique.mockResolvedValue(cartRow({ quantity: 2 }));
    mocks.cartItemUpdateMany.mockResolvedValue({ count: 1 });
    mocks.cartItemFindMany.mockResolvedValue([]);

    const result = await updateCartItem(ctxGuest, "ci1", 99);

    expect(mocks.cartItemUpdateMany).toHaveBeenCalledWith({
      where: { id: "ci1" },
      data: { quantity: 10 },
    });
    expect(result.itemCount).toBe(0);
  });

  it("baris dipadam serentak (updateMany count 0) -> NOT_FOUND 404, bukan 500", async () => {
    mocks.cartItemFindUnique.mockResolvedValue(cartRow({ quantity: 2 }));
    mocks.cartItemUpdateMany.mockResolvedValue({ count: 0 });

    await expect(updateCartItem(ctxGuest, "ci1", 3)).rejects.toMatchObject({
      code: "NOT_FOUND",
      status: 404,
    });
  });

  it("quantity < 1 -> buang item (remove)", async () => {
    mocks.cartItemFindUnique.mockResolvedValue(cartRow({ quantity: 2 }));
    mocks.cartItemDeleteMany.mockResolvedValue({ count: 1 });
    mocks.cartItemFindMany.mockResolvedValue([]);

    await updateCartItem(ctxGuest, "ci1", 0);

    expect(mocks.cartItemDeleteMany).toHaveBeenCalledWith({ where: { id: "ci1" } });
    expect(mocks.cartItemUpdateMany).not.toHaveBeenCalled();
  });

  it("item bukan kepunyaan ctx -> NOT_FOUND 404", async () => {
    mocks.cartItemFindUnique.mockResolvedValue(cartRow({ sessionId: "sess-lain", userId: null }));

    await expect(updateCartItem(ctxGuest, "ci1", 3)).rejects.toMatchObject({
      code: "NOT_FOUND",
      status: 404,
    });
    expect(mocks.cartItemUpdateMany).not.toHaveBeenCalled();
  });

  it("stok variant jatuh ke 0 -> OUT_OF_STOCK 409, tiada baris kuantiti 0 ditulis", async () => {
    mocks.cartItemFindUnique.mockResolvedValue(
      cartRow({ quantity: 2, variant: { ...cartRow().variant, stock: 0 } }),
    );

    await expect(updateCartItem(ctxGuest, "ci1", 3)).rejects.toMatchObject({
      code: "OUT_OF_STOCK",
      status: 409,
    });
    expect(mocks.cartItemUpdateMany).not.toHaveBeenCalled();
    expect(mocks.cartItemDeleteMany).not.toHaveBeenCalled();
  });

  it("item tak wujud -> NOT_FOUND 404", async () => {
    mocks.cartItemFindUnique.mockResolvedValue(null);

    await expect(updateCartItem(ctxGuest, "ci1", 3)).rejects.toMatchObject({
      code: "NOT_FOUND",
      status: 404,
    });
  });
});

describe("removeCartItem", () => {
  it("delete item sendiri dan return getCart", async () => {
    mocks.cartItemFindUnique.mockResolvedValue(cartRow());
    mocks.cartItemDeleteMany.mockResolvedValue({ count: 1 });
    mocks.cartItemFindMany.mockResolvedValue([]);

    const result = await removeCartItem(ctxGuest, "ci1");

    expect(mocks.cartItemDeleteMany).toHaveBeenCalledWith({ where: { id: "ci1" } });
    expect(result.items).toEqual([]);
  });

  it("item kepunyaan user lain -> NOT_FOUND 404", async () => {
    mocks.cartItemFindUnique.mockResolvedValue(
      cartRow({ sessionId: null, userId: "user-lain" }),
    );

    await expect(removeCartItem(ctxGuest, "ci1")).rejects.toMatchObject({
      code: "NOT_FOUND",
      status: 404,
    });
    expect(mocks.cartItemDeleteMany).not.toHaveBeenCalled();
  });
});

describe("mergeCart", () => {
  it("pindah semua item session -> user, gabung quantity (cap stok), buang session items", async () => {
    mocks.cartItemFindMany.mockResolvedValue([
      cartRow({ quantity: 2 }), // v1 stok 10
      cartRow({ id: "ci2", variantId: "v2", quantity: 3, variant: { ...cartRow().variant, id: "v2", stock: 5 } }),
    ]);
    mocks.cartItemUpsert
      .mockResolvedValueOnce({ id: "u-ci1", quantity: 6 })
      .mockResolvedValueOnce({ id: "u-ci2", quantity: 3 });

    await mergeCart("user-1", "sess-1");

    expect(mocks.transaction).toHaveBeenCalled();
    // v1: item user (4) + item guest (2) - increment atomic, tiada baca-lalu-tulis.
    expect(mocks.cartItemUpsert).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: { userId_variantId: { userId: "user-1", variantId: "v1" } },
        update: { quantity: { increment: 2 } },
        select: { id: true, quantity: true },
      }),
    );
    // 6 <= stok 10 -> tiada cap tambahan.
    expect(mocks.cartItemUpdateMany).not.toHaveBeenCalled();
    // v2: tiada sedia ada -> create quantity 3
    expect(mocks.cartItemUpsert).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: { userId_variantId: { userId: "user-1", variantId: "v2" } },
        create: expect.objectContaining({ userId: "user-1", variantId: "v2", quantity: 3 }),
      }),
    );
    expect(mocks.cartItemDeleteMany).toHaveBeenCalledWith({ where: { sessionId: "sess-1" } });
  });

  it("gabung quantity cap pada stok (existing + session melebihi stok)", async () => {
    mocks.cartItemFindMany.mockResolvedValue([cartRow({ quantity: 5 })]); // stok 10
    // Item user sudah 9; increment +5 menjadikan 14.
    mocks.cartItemUpsert.mockResolvedValueOnce({ id: "u-ci1", quantity: 14 });

    await mergeCart("user-1", "sess-1");

    expect(mocks.cartItemUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ update: { quantity: { increment: 5 } } }),
    );
    // 14 > stok 10 -> cap bersyarat.
    expect(mocks.cartItemUpdateMany).toHaveBeenCalledWith({
      where: { id: "u-ci1", quantity: { gt: 10 } },
      data: { quantity: 10 },
    });
    expect(mocks.cartItemDeleteMany).toHaveBeenCalledWith({ where: { sessionId: "sess-1" } });
  });

  it("item session stok 0 dilangkau (tak di-upsert)", async () => {
    mocks.cartItemFindMany.mockResolvedValue([
      cartRow({ variant: { ...cartRow().variant, stock: 0 } }),
    ]);

    await mergeCart("user-1", "sess-1");

    expect(mocks.cartItemUpsert).not.toHaveBeenCalled();
    expect(mocks.cartItemDeleteMany).toHaveBeenCalledWith({ where: { sessionId: "sess-1" } });
  });

  it("tiada item session -> return awal tanpa transaction", async () => {
    mocks.cartItemFindMany.mockResolvedValue([]);

    await mergeCart("user-1", "sess-1");

    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.cartItemDeleteMany).not.toHaveBeenCalled();
  });
});
