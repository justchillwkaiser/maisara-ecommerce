import {
  ArrowClockwise,
  Package,
  ShoppingCartSimple,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/akaun/status-badges";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatRM } from "@/lib/format";
import { getDashboardStats } from "@/server/services/dashboard.service";

/**
 * Dashboard admin (API.md section 7 - GET /api/admin/dashboard).
 * 4 blok stats, jadual order terkini (5), senarai stok rendah.
 * Padat dan on-system: garis halus, label mono, angka tabular.
 */
export default async function AdminDashboardPage() {
  const { stats, recentOrders, lowStockItems } = await getDashboardStats();

  const cards = [
    {
      label: "Jumlah Order",
      value: stats.totalOrders.toLocaleString("ms-MY"),
      icon: ShoppingCartSimple,
    },
    {
      label: "Revenue (Dibayar)",
      value: formatRM(stats.totalRevenue),
      icon: Package,
    },
    {
      label: "Order Pending",
      value: stats.pendingOrders.toLocaleString("ms-MY"),
      icon: ArrowClockwise,
    },
    {
      label: "Stok Rendah",
      value: stats.lowStockCount.toLocaleString("ms-MY"),
      icon: WarningCircle,
    },
  ];

  return (
    <div className="space-y-10">
      {/* Blok stats */}
      <section
        aria-label="Statistik ringkas"
        className="grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-4"
      >
        {cards.map((card) => (
          <div key={card.label} className="bg-paper-lift p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="meta-label text-cocoa">{card.label}</p>
              <card.icon size={16} aria-hidden="true" className="text-line-strong" />
            </div>
            <p className="mt-5 font-display text-h3 tabular-nums text-ink">
              {card.value}
            </p>
          </div>
        ))}
      </section>

      {/* Order terkini */}
      <section aria-labelledby="admin-order-terkini">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="admin-order-terkini" className="font-display text-h3 text-ink">
            Order Terkini
          </h2>
          <Link
            href="/admin/order"
            className="meta-label text-cocoa transition-colors duration-(--dur-fast) hover:text-ink"
          >
            Lihat Semua
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="mt-4 border border-line bg-paper-lift px-5 py-10 text-center text-body-sm text-cocoa">
            Tiada order lagi.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto border border-line bg-paper-lift">
            <table className="w-full min-w-[640px] text-left text-body-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="meta-label px-5 py-3 text-cocoa">Order</th>
                  <th className="meta-label px-5 py-3 text-cocoa">Pelanggan</th>
                  <th className="meta-label px-5 py-3 text-cocoa">Tarikh</th>
                  <th className="meta-label px-5 py-3 text-right text-cocoa">
                    Jumlah
                  </th>
                  <th className="meta-label px-5 py-3 text-cocoa">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-line last:border-0">
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/order`}
                        className="font-mono text-body-sm tabular-nums text-ink underline-offset-4 hover:underline"
                      >
                        #{order.id.slice(0, 8).toUpperCase()}
                      </Link>
                      <span className="ml-2 font-mono text-meta text-cocoa">
                        {order.itemCount} item
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-ink">{order.user.name ?? "-"}</td>
                    <td className="px-5 py-3.5 font-mono text-meta text-cocoa">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-ink">
                      {formatRM(order.total)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        <OrderStatusBadge status={order.status} />
                        <PaymentStatusBadge status={order.paymentStatus} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Stok rendah */}
      <section aria-labelledby="admin-stok-rendah">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="admin-stok-rendah" className="font-display text-h3 text-ink">
            Stok Rendah
          </h2>
          <Link
            href="/admin/stok?lowOnly=true"
            className="meta-label text-cocoa transition-colors duration-(--dur-fast) hover:text-ink"
          >
            Urus Stok
          </Link>
        </div>

        {lowStockItems.length === 0 ? (
          <p className="mt-4 border border-line bg-paper-lift px-5 py-10 text-center text-body-sm text-cocoa">
            Semua stok mencukupi.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {lowStockItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-4 border border-line bg-paper-lift px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-body-sm text-ink">
                    {item.product.name}
                  </p>
                  <p className="mt-1 font-mono text-meta text-cocoa">
                    {[item.color, item.size].filter(Boolean).join(" / ") || "Saiz tunggal"}
                    {" · "}
                    <span className="tabular-nums">{item.sku}</span>
                  </p>
                </div>
                <Badge
                  variant={item.stock === 0 ? "danger" : "outline"}
                  className="shrink-0 tabular-nums"
                >
                  {item.stock === 0 ? "Habis" : `${item.stock} lagi`}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
