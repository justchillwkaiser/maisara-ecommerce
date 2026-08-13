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
import { formatDate, formatRM } from "@/lib/format";
import { getDashboardStats } from "@/server/services/dashboard.service";

/**
 * Dashboard admin (API.md section 7 - GET /api/admin/dashboard).
 * 4 kad stats, jadual order terkini (5), senarai stok rendah.
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
    <div className="space-y-8">
      {/* Kad stats */}
      <section aria-label="Statistik ringkas" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-line bg-card p-5"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-gold-tint text-gold-deep">
              <card.icon size={20} />
            </span>
            <p className="mt-4 text-2xl font-medium tabular-nums text-ink">
              {card.value}
            </p>
            <p className="mt-1 text-sm text-ink-soft">{card.label}</p>
          </div>
        ))}
      </section>

      {/* Order terkini */}
      <section aria-label="Order terkini">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-medium text-ink">Order Terkini</h2>
          <Link
            href="/admin/order"
            className="text-sm font-medium text-gold hover:text-gold-deep"
          >
            Lihat Semua
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-line bg-card px-6 py-12 text-center text-sm text-ink-soft">
            Tiada order lagi.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-card">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs tracking-wide text-ink-soft uppercase">
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Pelanggan</th>
                  <th className="px-5 py-3 font-medium">Tarikh</th>
                  <th className="px-5 py-3 text-right font-medium">Jumlah</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-line last:border-0">
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/order`}
                        className="font-medium tabular-nums text-ink hover:text-gold"
                      >
                        #{order.id.slice(0, 8).toUpperCase()}
                      </Link>
                      <span className="ml-2 text-xs text-ink-soft">
                        {order.itemCount} item
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-ink">
                      {order.user.name ?? "-"}
                    </td>
                    <td className="px-5 py-3.5 text-ink-soft">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium tabular-nums text-ink">
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
      <section aria-label="Stok rendah">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-medium text-ink">Stok Rendah</h2>
          <Link
            href="/admin/stok?lowOnly=true"
            className="text-sm font-medium text-gold hover:text-gold-deep"
          >
            Urus Stok
          </Link>
        </div>

        {lowStockItems.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-line bg-card px-6 py-12 text-center text-sm text-ink-soft">
            Semua stok mencukupi. Bagus!
          </div>
        ) : (
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {lowStockItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-card p-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    {item.product.name}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    {[item.color, item.size].filter(Boolean).join(" / ") || "Saiz tunggal"}
                    {" · "}
                    <span className="tabular-nums">{item.sku}</span>
                  </p>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-medium ${
                    item.stock === 0
                      ? "bg-danger/10 text-danger"
                      : "bg-gold-tint text-gold-deep"
                  }`}
                >
                  {item.stock === 0 ? "Habis" : `${item.stock} lagi`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
