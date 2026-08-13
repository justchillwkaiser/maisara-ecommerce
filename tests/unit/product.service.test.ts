import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  productFindMany: vi.fn(),
  productCount: vi.fn(),
  productFindUnique: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    product: {
      findMany: mocks.productFindMany,
      count: mocks.productCount,
      findUnique: mocks.productFindUnique,
    },
  },
}));

import {
  getProductBySlug,
  listProducts,
} from "@/server/services/product.service";

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
          quickAddVariantId: "v1",
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

/**
 * Row produk detail raw dari mock db - bentuk sama dengan hasil
 * db.product.findUnique({ where: { slug }, include: { category, variants,
 * reviews: { include: { user } } } }).
 */
function productDetailRow(overrides: Record<string, unknown> = {}) {
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
    category: {
      id: "c1",
      name: "Tudung",
      slug: "tudung",
      description: null,
      image: null,
      order: 0,
      createdAt: new Date("2026-08-01"),
    },
    variants: [
      { id: "v1", color: "Sage", size: null, sku: "MAI-BELLA-SAGE", stock: 3 },
      { id: "v2", color: "Ivory", size: null, sku: "MAI-BELLA-IVORY", stock: 8 },
    ],
    reviews: [
      {
        id: "r1",
        rating: 5,
        comment: "Kain selesa dan jahitan kemas.",
        createdAt: new Date("2026-08-10"),
        user: { name: "Nurul Aisyah" },
      },
      {
        id: "r2",
        rating: 4,
        comment: "Potongan kemas.",
        createdAt: new Date("2026-08-09"),
        user: { name: "Aina Sofea" },
      },
      {
        id: "r3",
        rating: 5,
        comment: "Cantik!",
        createdAt: new Date("2026-08-08"),
        user: { name: null },
      },
    ],
    ...overrides,
  };
}

describe("getProductBySlug", () => {
  it("return ProductDetail (variants, reviews approved, avgRating 1 dp, reviewCount) bila slug wujud", async () => {
    mocks.productFindUnique.mockResolvedValue(productDetailRow());

    const result = await getProductBySlug("tudung-bawal-premium");

    expect(result).toEqual({
      id: "p1",
      name: "Tudung Bawal Premium",
      slug: "tudung-bawal-premium",
      description: "Bawal premium dari kain voal berkualiti.",
      price: "49.00",
      images: ["https://cdn.example.com/tudung-1.jpg", "https://cdn.example.com/tudung-2.jpg"],
      category: { id: "c1", name: "Tudung", slug: "tudung" },
      variants: [
        { id: "v1", color: "Sage", size: null, sku: "MAI-BELLA-SAGE", stock: 3 },
        { id: "v2", color: "Ivory", size: null, sku: "MAI-BELLA-IVORY", stock: 8 },
      ],
      reviews: [
        {
          id: "r1",
          rating: 5,
          comment: "Kain selesa dan jahitan kemas.",
          createdAt: new Date("2026-08-10"),
          user: { name: "Nurul Aisyah" },
        },
        {
          id: "r2",
          rating: 4,
          comment: "Potongan kemas.",
          createdAt: new Date("2026-08-09"),
          user: { name: "Aina Sofea" },
        },
        {
          id: "r3",
          rating: 5,
          comment: "Cantik!",
          createdAt: new Date("2026-08-08"),
          user: { name: null },
        },
      ],
      avgRating: 4.7, // (5+4+5)/3 = 4.666... -> 1 dp
      reviewCount: 3,
    });

    expect(mocks.productFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: "tudung-bawal-premium" },
        include: expect.objectContaining({
          category: true,
          variants: expect.objectContaining({ orderBy: { color: "asc" } }),
          reviews: expect.objectContaining({
            where: { status: "APPROVED" },
            orderBy: { createdAt: "desc" },
          }),
        }),
      }),
    );
  });

  it("return null bila slug tak wujud", async () => {
    mocks.productFindUnique.mockResolvedValue(null);

    const result = await getProductBySlug("produk-tak-wujud");

    expect(result).toBeNull();
  });

  it("return null bila produk isActive false", async () => {
    mocks.productFindUnique.mockResolvedValue(productDetailRow({ isActive: false }));

    const result = await getProductBySlug("tudung-bawal-premium");

    expect(result).toBeNull();
  });

  it("return null bila tiada reviews (avgRating null, reviewCount 0)", async () => {
    mocks.productFindUnique.mockResolvedValue(productDetailRow({ reviews: [] }));

    const result = await getProductBySlug("tudung-bawal-premium");

    expect(result?.avgRating).toBeNull();
    expect(result?.reviewCount).toBe(0);
    expect(result?.reviews).toEqual([]);
  });

  it("hanya review APPROVED disertakan (status lain ditapis oleh query)", async () => {
    mocks.productFindUnique.mockResolvedValue(productDetailRow());

    await getProductBySlug("tudung-bawal-premium");

    const include = mocks.productFindUnique.mock.calls[0][0].include;
    expect(include.reviews.where.status).toBe("APPROVED");
  });
});
