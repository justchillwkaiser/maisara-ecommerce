import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";

/**
 * Service dashboard & stok admin (API.md section 7).
 * Layer bebas transport: dipanggil oleh route handler admin.
 */

export interface DashboardStats {
  totalOrders: number;
  /** Jumlah wang order PAID sahaja (string Decimal). */
  totalRevenue: string;
  pendingOrders: number;
  /** Bilangan variants dengan stok <= 5. */
  lowStockCount: number;
}

export interface DashboardRecentOrder {
  id: string;
  status: string;
  paymentStatus: string;
  total: string;
  createdAt: string;
  itemCount: number;
  user: { name: string | null };
}

export interface DashboardLowStockItem {
  id: string;
  color: string | null;
  size: string | null;
  sku: string;
  stock: number;
  product: { name: string; slug: string; image: string | null };
}

export interface DashboardData {
  stats: DashboardStats;
  recentOrders: DashboardRecentOrder[];
  lowStockItems: DashboardLowStockItem[];
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
 * Statistik dashboard admin (API.md section 7 - GET /api/admin/dashboard):
 * revenue = jumlah total order PAID sahaja; recentOrders = 5 terkini dengan
 * itemCount + user name; lowStockItems = variants stok <= 5 dengan nama produk.
 */
export async function getDashboardStats(): Promise<DashboardData> {
  const [revenueAgg, totalOrders, pendingOrders, lowStockCount, recentOrders, lowStockItems] =
    await Promise.all([
      db.order.aggregate({
        where: { paymentStatus: "PAID" },
        _sum: { total: true },
      }),
      db.order.count(),
      db.order.count({ where: { status: "PENDING" } }),
      db.productVariant.count({ where: { stock: { lte: 5 } } }),
      db.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          user: { select: { name: true } },
          _count: { select: { items: true } },
        },
      }),
      db.productVariant.findMany({
        where: { stock: { lte: 5 } },
        include: {
          product: { select: { name: true, slug: true, images: true } },
        },
        orderBy: { stock: "asc" },
      }),
    ]);

  return {
    stats: {
      totalOrders,
      totalRevenue: (revenueAgg._sum.total ?? new Prisma.Decimal(0)).toFixed(2),
      pendingOrders,
      lowStockCount,
    },
    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: order.total.toString(),
      createdAt: order.createdAt.toISOString(),
      itemCount: order._count.items,
      user: { name: order.user.name },
    })),
    lowStockItems: lowStockItems.map((variant) => ({
      id: variant.id,
      color: variant.color,
      size: variant.size,
      sku: variant.sku,
      stock: variant.stock,
      product: {
        name: variant.product.name,
        slug: variant.product.slug,
        image: parseImages(variant.product.images)[0] ?? null,
      },
    })),
  };
}

export interface StockVariantItem {
  id: string;
  color: string | null;
  size: string | null;
  sku: string;
  stock: number;
  product: { id: string; name: string; slug: string };
}

/**
 * Senarai variants stok (API.md section 7 - GET /api/admin/stock).
 * lowOnly=true -> hanya stok <= 5. Termasuk nama produk untuk paparan admin.
 */
export async function listStockVariants(lowOnly: boolean): Promise<StockVariantItem[]> {
  const variants = await db.productVariant.findMany({
    where: lowOnly ? { stock: { lte: 5 } } : {},
    include: {
      product: { select: { id: true, name: true, slug: true } },
    },
    orderBy: [{ product: { name: "asc" } }, { color: "asc" }],
  });

  return variants.map((variant) => ({
    id: variant.id,
    color: variant.color,
    size: variant.size,
    sku: variant.sku,
    stock: variant.stock,
    product: {
      id: variant.product.id,
      name: variant.product.name,
      slug: variant.product.slug,
    },
  }));
}
