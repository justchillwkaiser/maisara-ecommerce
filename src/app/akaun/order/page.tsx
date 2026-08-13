import { Package } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/akaun/status-badges";
import { formatDate, formatRM } from "@/lib/format";
import { requireUser } from "@/server/guards";
import { listUserOrders } from "@/server/services/order.service";

/**
 * Sejarah order (UX.md section 4, DESIGN.md 8 - Akaun).
 * Kad setiap order: ID ringkas (8 aksara), tarikh, status badge, jumlah,
 * link ke detail. Empty state + CTA ke koleksi.
 */
export default async function AkaunOrderPage() {
  const user = await requireUser();
  const orders = await listUserOrders(user.id);

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-line px-6 py-16 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-gold-tint text-gold-deep">
          <Package size={26} />
        </span>
        <h2 className="mt-5 font-serif text-2xl text-ink">Tiada pesanan lagi</h2>
        <p className="mt-2 max-w-sm text-sm text-ink-soft">
          Apabila anda membuat pembelian, sejarah pesanan akan muncul di sini.
        </p>
        <Link
          href="/koleksi"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-gold px-7 text-sm font-medium text-card transition-colors hover:bg-gold-deep"
        >
          Teruskan Membeli
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {orders.map((order) => (
        <li key={order.id}>
          <Link
            href={`/akaun/order/${order.id}`}
            className="block rounded-2xl border border-line p-6 transition-colors hover:border-gold"
          >
            <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
              <div>
                <p className="text-xs tracking-wide text-ink-soft uppercase">
                  No. Pesanan
                </p>
                <p className="mt-1 font-medium tabular-nums text-ink">
                  #{order.id.slice(0, 8).toUpperCase()}
                </p>
                <p className="mt-1 text-sm text-ink-soft">
                  {formatDate(order.createdAt)} · {order.itemCount} item
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-lg font-medium tabular-nums text-ink">
                  {formatRM(order.total)}
                </span>
                <div className="flex flex-wrap justify-end gap-2">
                  <OrderStatusBadge status={order.status} />
                  <PaymentStatusBadge status={order.paymentStatus} />
                </div>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
