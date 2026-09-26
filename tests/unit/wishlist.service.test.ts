import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  wishlistUpsert: vi.fn(),
  wishlistDeleteMany: vi.fn(),
  wishlistFindMany: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    wishlistItem: {
      upsert: mocks.wishlistUpsert,
      deleteMany: mocks.wishlistDeleteMany,
      findMany: mocks.wishlistFindMany,
    },
  },
}));

import { addToWishlist, getWishlist, removeFromWishlist } from "@/server/services/wishlist.service";

beforeEach(() => {
  for (const fn of Object.values(mocks)) fn.mockReset();
});

/** Row WishlistItem raw dari mock db (bentuk sama dengan include product). */
function wishlistRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "wl1",
    userId: "user-1",
    productId: "p1",
    createdAt: new Date("2026-08-13T10:00:00Z"),
    product: {
      id: "p1",
      name: "Tudung Bella Voal Premium",
      slug: "tudung-bella-voal",
      price: { toString: () => "39.90" },
      images: ["https://img.test/bella.jpg", "https://img.test/bella-2.jpg"],
      isActive: true,
      variants: [
        { id: "v1", color: "Sage", size: null, stock: 5 },
        { id: "v2", color: "Ivory", size: null, stock: 0 },
      ],
      reviews: [{ rating: 5 }, { rating: 4 }],
    },
    ...overrides,
  };
}

describe("addToWishlist", () => {
  it("produk belum ada -> upsert create WishlistItem", async () => {
    mocks.wishlistUpsert.mockResolvedValue({ id: "wl1" });

    await addToWishlist("user-1", "p1");

    expect(mocks.wishlistUpsert).toHaveBeenCalledWith({
      where: { userId_productId: { userId: "user-1", productId: "p1" } },
      create: { userId: "user-1", productId: "p1" },
      update: {},
    });
  });

  it("produk sudah wujud (duplicate) -> upsert no-op, tiada ralat", async () => {
    mocks.wishlistUpsert.mockResolvedValue({ id: "wl1" });

    await expect(addToWishlist("user-1", "p1")).resolves.not.toThrow();
    expect(mocks.wishlistUpsert).toHaveBeenCalledTimes(1);
  });
});

describe("removeFromWishlist", () => {
  it("padam item (deleteMany) untuk user + produk", async () => {
    mocks.wishlistDeleteMany.mockResolvedValue({ count: 1 });

    await removeFromWishlist("user-1", "p1");

    expect(mocks.wishlistDeleteMany).toHaveBeenCalledWith({
      where: { userId: "user-1", productId: "p1" },
    });
  });

  it("item tiada -> deleteMany count 0, tiada ralat", async () => {
    mocks.wishlistDeleteMany.mockResolvedValue({ count: 0 });

    await expect(removeFromWishlist("user-1", "p1")).resolves.not.toThrow();
  });
});

describe("getWishlist", () => {
  it("return items dengan shape ProductCard: name, slug, price string, image pertama, minStock, rating", async () => {
    mocks.wishlistFindMany.mockResolvedValue([wishlistRow()]);

    const result = await getWishlist("user-1");

    expect(mocks.wishlistFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1", product: { isActive: true } },
        orderBy: { createdAt: "desc" },
      }),
    );

    expect(result).toEqual([
      {
        id: "wl1",
        createdAt: "2026-08-13T10:00:00.000Z",
        product: {
          id: "p1",
          name: "Tudung Bella Voal Premium",
          slug: "tudung-bella-voal",
          price: "39.90",
          image: "https://img.test/bella.jpg",
          hoverImage: "https://img.test/bella-2.jpg",
          minStock: 0,
          quickAddVariant: { id: "v1", color: "Sage", size: null, stock: 5 },
          avgRating: 4.5,
          reviewCount: 2,
        },
      },
    ]);
  });

  it("images string JSON -> parse; image null apabila produk tiada imej", async () => {
    mocks.wishlistFindMany.mockResolvedValue([
      wishlistRow({
        id: "wl2",
        product: {
          ...wishlistRow().product,
          images: '["https://img.test/str.jpg"]',
        },
      }),
      wishlistRow({
        id: "wl3",
        product: {
          ...wishlistRow().product,
          images: [],
          variants: [],
          reviews: [],
        },
      }),
    ]);

    const result = await getWishlist("user-1");

    expect(result[0].product.image).toBe("https://img.test/str.jpg");
    expect(result[1].product.image).toBeNull();
    expect(result[1].product.minStock).toBe(0);
    expect(result[1].product.quickAddVariant).toBeNull();
    expect(result[1].product.avgRating).toBeNull();
    expect(result[1].product.reviewCount).toBe(0);
  });

  it("wishlist kosong -> array kosong", async () => {
    mocks.wishlistFindMany.mockResolvedValue([]);

    await expect(getWishlist("user-1")).resolves.toEqual([]);
  });
});
