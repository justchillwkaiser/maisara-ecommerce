import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  productFindMany: vi.fn(),
  productCount: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    product: {
      findMany: mocks.productFindMany,
      count: mocks.productCount,
    },
  },
}));

import { listProducts } from "@/server/services/product.service";

/**
 * Row produk raw dari mock db - bentuk sama dengan hasil
 * db.product.findMany({ include: { category, variants, reviews } }).
 */
function productRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "p1",
    name: "Tudung Bawal Premium",
    slug: "tudung-bawal-premium",
    description: "Bawal premium dari kain voal berkualiti.",
    price: { toString: () => "49.00" },
    categoryId: "c1",
    isActive: true,
    featured: false,
    images: ["https://cdn.example.com/tudung-1.jpg", "https://cdn.example.com/tudung-2.jpg"],
    createdAt: new Date("2026-08-01"),
    updatedAt: new Date("2026-08-01"),
    category: { id: "c1", name: "Tudung", slug: "tudung" },
    variants: [
      { id: "v1", color: "Sage", size: null, stock: 3 },
      { id: "v2", color: "Ivory", size: null, stock: 8 },
    ],
    reviews: [
      { rating: 5 },
      { rating: 4 },
      { rating: 5 },
    ],
    ...overrides,
  };
}

beforeEach(() => {
  mocks.productFindMany.mockReset();
  mocks.productCount.mockReset();
});

describe("listProducts", () => {
  it("return { items, total, page, pageSize } dengan transform betul", async () => {
    mocks.productFindMany.mockResolvedValue([productRow()]);
    mocks.productCount.mockResolvedValue(1);

    const result = await listProducts({ page: 1, pageSize: 12 });

    expect(result).toEqual({
      items: [
        {
          id: "p1",
          name: "Tudung Bawal Premium",
          slug: "tudung-bawal-premium",
          price: "49.00",
          image: "https://cdn.example.com/tudung-1.jpg",
          category: { name: "Tudung", slug: "tudung" },
          colors: ["Sage", "Ivory"],
          sizes: [],
          minStock: 3,
          avgRating: 14 / 3,
          reviewCount: 3,
        },
      ],
      total: 1,
      page: 1,
      pageSize: 12,
    });

    expect(mocks.productFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isActive: true }),
        skip: 0,
        take: 12,
      }),
    );
    expect(mocks.productCount).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ isActive: true }) }),
    );
  });

  it("filter kategori guna category.slug", async () => {
    mocks.productFindMany.mockResolvedValue([]);
    mocks.productCount.mockResolvedValue(0);

    await listProducts({ category: "tudung" });

    expect(mocks.productFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isActive: true,
          category: { slug: "tudung" },
        }),
      }),
    );
  });

  it("filter search nama contains insensitive", async () => {
    mocks.productFindMany.mockResolvedValue([]);
    mocks.productCount.mockResolvedValue(0);

    await listProducts({ search: "bawal" });

    expect(mocks.productFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          name: { contains: "bawal", mode: "insensitive" },
        }),
      }),
    );
  });

  it("filter harga min/max", async () => {
    mocks.productFindMany.mockResolvedValue([]);
    mocks.productCount.mockResolvedValue(0);

    await listProducts({ minPrice: 30, maxPrice: 100 });

    const call = mocks.productFindMany.mock.calls[0][0];
    const priceFilter = call.where.price;
    expect(priceFilter.gte.toString()).toBe("30");
    expect(priceFilter.lte.toString()).toBe("100");
  });

  it("sort price-asc orderBy price asc", async () => {
    mocks.productFindMany.mockResolvedValue([]);
    mocks.productCount.mockResolvedValue(0);

    await listProducts({ sort: "price-asc" });

    expect(mocks.productFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { price: "asc" } }),
    );
  });

  it("sort popular order ikut kiraan review", async () => {
    mocks.productFindMany.mockResolvedValue([]);
    mocks.productCount.mockResolvedValue(0);

    await listProducts({ sort: "popular" });

    expect(mocks.productFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: expect.arrayContaining([expect.objectContaining({ reviews: { _count: "desc" } })]),
      }),
    );
  });

  it("filter warna & saiz melalui variants some", async () => {
    mocks.productFindMany.mockResolvedValue([]);
    mocks.productCount.mockResolvedValue(0);

    await listProducts({ color: "Sage", size: "M" });

    expect(mocks.productFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          variants: { some: { color: "Sage", size: "M" } },
        }),
      }),
    );
  });

  it("pagination skip = (page-1) * pageSize", async () => {
    mocks.productFindMany.mockResolvedValue([]);
    mocks.productCount.mockResolvedValue(0);

    await listProducts({ page: 3, pageSize: 12 });

    expect(mocks.productFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 24, take: 12 }),
    );
  });

  it("transform handle images sebagai string JSON dan tiada variants", async () => {
    mocks.productFindMany.mockResolvedValue([
      productRow({
        images: '["https://cdn.example.com/solo.jpg"]',
        variants: [],
        reviews: [],
      }),
    ]);
    mocks.productCount.mockResolvedValue(1);

    const result = await listProducts({ page: 1, pageSize: 12 });

    expect(result.items[0].image).toBe("https://cdn.example.com/solo.jpg");
    expect(result.items[0].colors).toEqual([]);
    expect(result.items[0].sizes).toEqual([]);
    expect(result.items[0].minStock).toBe(0);
    expect(result.items[0].avgRating).toBeNull();
    expect(result.items[0].reviewCount).toBe(0);
  });

  it("sizes unik daripada variants, warna unik tanpa null", async () => {
    mocks.productFindMany.mockResolvedValue([
      productRow({
        variants: [
          { id: "v1", color: "Sage", size: "S", stock: 2 },
          { id: "v2", color: "Sage", size: "M", stock: 5 },
          { id: "v3", color: null, size: "L", stock: 1 },
        ],
      }),
    ]);
    mocks.productCount.mockResolvedValue(1);

    const result = await listProducts({ page: 1, pageSize: 12 });

    expect(result.items[0].colors).toEqual(["Sage"]);
    expect(result.items[0].sizes).toEqual(["S", "M", "L"]);
    expect(result.items[0].minStock).toBe(1);
  });
});
