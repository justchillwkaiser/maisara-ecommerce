import Link from "next/link";

import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/akaun/status-badges";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, formatRM } from "@/lib/format";
import { requireUser } from "@/server/guards";
import { listUserOrders } from "@/server/services/order.service";

/**
 * Sejarah order (UX.md section 4, DESIGN.md 8 - Akaun).
 * Baris setiap order: ID ringkas (8 aksara), tarikh, status, jumlah,
 * pautan ke detail. Empty state + CTA ke koleksi.
 */
export default async function AkaunOrderPage() {
  const user = await requireUser();
  const orders = await listUserOrders(user.id);

  if (orders.length === 0) {
    return (
      <EmptyState
        eyebrow="Order"
        title="Tiada pesanan lagi"
        description="Apabila anda membuat pembelian, sejarah pesanan akan muncul di sini."
        action={{ label: "Teruskan Membeli", href: "/koleksi" }}
      />
    );
  }

  return (
    <ul className="divide-y divide-line border-y border-line">
      {orders.map((order) => (
        <li key={order.id}>
          <Link
            href={`/akaun/order/${order.id}`}
            className="group flex flex-wrap items-start justify-between gap-x-8 gap-y-4 py-6 transition-colors duration-(--dur-fast)"
          >
            <div className="min-w-0">
              <p className="meta-label text-cocoa">No. Pesanan</p>
              <p className="mt-2 font-mono text-body-sm tabular-nums text-ink underline-offset-4 group-hover:underline">
                #{order.id.slice(0, 8).toUpperCase()}
              </p>
              <p className="mt-1 text-body-sm text-cocoa">
                {formatDate(order.createdAt)} · {order.itemCount} item
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 sm:items-end">
              <span className="text-body-lg tabular-nums text-ink">
                {formatRM(order.total)}
              </span>
              <div className="flex flex-wrap gap-2">
                <OrderStatusBadge status={order.status} />
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
