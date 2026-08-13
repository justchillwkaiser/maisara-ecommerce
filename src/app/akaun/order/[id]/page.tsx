import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/akaun/status-badges";
import { ApiError } from "@/lib/errors";
import { formatDate, formatRM } from "@/lib/format";
import { requireUser } from "@/server/guards";
import { getOrderDetail, type OrderDetail } from "@/server/services/order.service";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

/** Alamat penghantaran disimpan sebagai Json dalam Order.shippingAddress. */
interface ShippingAddressShape {
  name?: string;
  phone?: string;
  address?: string;
  state?: string;
  postcode?: string;
}

function toAddress(value: unknown): ShippingAddressShape {
  if (value && typeof value === "object") {
    return value as ShippingAddressShape;
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (parsed && typeof parsed === "object") return parsed as ShippingAddressShape;
    } catch {
      /* fallthrough */
    }
  }
  return {};
}

/** Imej item: dari produk; fallback placeholder (corak toCardProduct PDP). */
function itemImage(order: OrderDetail, index: number): string {
  return (
    order.items[index]?.image ??
    `https://picsum.photos/seed/maisara-order-${order.id.slice(-6)}-${index}/400/500`
  );
}

/**
 * Detail order (UX.md section 4, DESIGN.md 8 - Akaun).
 * Items (imej + nama + variant + qty + harga), alamat, penghantaran,
 * ringkasan jumlah, status. Order bukan milik user -> notFound().
 */
export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const user = await requireUser();

  let order: OrderDetail;
  try {
    order = await getOrderDetail(id, user);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const address = toAddress(order.shippingAddress);
  const lineTotal = (index: number) =>
    (Number(order.items[index].unitPrice) * order.items[index].quantity).toFixed(2);

  return (
    <div className="space-y-6">
      <Link
        href="/akaun/order"
        className="inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-gold-deep"
      >
        <ArrowLeft size={16} />
        Kembali ke Order
      </Link>

      {/* Kepala: no. order + tarikh + status */}
      <section className="rounded-2xl border border-line p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
          <div>
            <p className="text-xs tracking-wide text-ink-soft uppercase">No. Pesanan</p>
            <p className="mt-1 font-serif text-2xl font-medium tabular-nums text-ink">
              #{order.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="mt-1 text-sm text-ink-soft">{formatDate(order.createdAt)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>
        </div>
      </section>

      {/* Items */}
      <section className="rounded-2xl border border-line p-6 md:p-8">
        <h2 className="font-serif text-xl font-medium text-ink">Item Pesanan</h2>
        <ul className="mt-5 divide-y divide-line">
          {order.items.map((item, index) => (
            <li key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-surface">
                <Image
                  src={itemImage(order, index)}
                  alt={item.productName}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between gap-2">
                <div>
                  <p className="font-medium text-ink">{item.productName}</p>
                  <p className="mt-0.5 text-sm text-ink-soft">
                    {[item.color, item.size].filter(Boolean).join(" · ") ||
                      "Saiz unik"}
                  </p>
                </div>
                <p className="text-sm text-ink-soft">
                  {item.quantity} × {formatRM(item.unitPrice)}
                </p>
              </div>
              <p className="text-sm font-medium tabular-nums text-ink">
                {formatRM(lineTotal(index))}
              </p>
            </li>
          ))}
        </ul>

        {/* Ringkasan jumlah */}
        <dl className="mt-6 space-y-2 border-t border-line pt-5 text-sm">
          <div className="flex justify-between text-ink-soft">
            <dt>Subtotal</dt>
            <dd className="tabular-nums text-ink">{formatRM(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between text-ink-soft">
            <dt>Penghantaran ({order.shippingMethod})</dt>
            <dd className="tabular-nums text-ink">{formatRM(order.shippingFee)}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-base font-medium">
            <dt className="text-ink">Jumlah</dt>
            <dd className="tabular-nums text-ink">{formatRM(order.total)}</dd>
          </div>
        </dl>
      </section>

      {/* Alamat penghantaran */}
      <section className="rounded-2xl border border-line p-6 md:p-8">
        <h2 className="font-serif text-xl font-medium text-ink">Alamat Penghantaran</h2>
        <address className="mt-4 text-sm leading-relaxed text-ink-soft not-italic">
          <p className="font-medium text-ink">{address.name ?? "-"}</p>
          <p>{address.phone ?? "-"}</p>
          <p>{address.address ?? "-"}</p>
          <p>
            {[address.postcode, address.state].filter(Boolean).join(", ")}
          </p>
        </address>
      </section>
    </div>
  );
}
