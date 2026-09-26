import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/akaun/status-badges";
import { ImageFrame, ImagePlaceholder } from "@/components/ui/image-frame";
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

/**
 * Detail order (UX.md section 4, DESIGN.md 8 - Akaun).
 * Items (imej + nama + variant + qty + harga), alamat, penghantaran,
 * ringkasan jumlah, status. Order bukan milik user -> notFound().
 *
 * Imej item datang dari produk (order.items[].image). OrderDetail tidak
 * menyimpan slug produk, jadi apabila imej tiada kita papar ImagePlaceholder
 * yang disengajakan - bukan URL stok rawak.
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

  return (
    <div className="space-y-12">
      <Link
        href="/akaun/order"
        className="meta-label inline-flex items-center gap-2 text-cocoa transition-colors duration-(--dur-fast) hover:text-ink"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Kembali ke Order
      </Link>

      {/* Kepala: no. order + tarikh + status */}
      <section aria-labelledby="order-ringkasan" className="border-t border-line pt-6">
        <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
          <div>
            <p className="meta-label text-cocoa">No. Pesanan</p>
            <p
              id="order-ringkasan"
              className="mt-3 font-display text-h3 tabular-nums text-ink"
            >
              #{order.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="mt-2 font-mono text-body-sm text-cocoa">
              {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>
        </div>
      </section>

      {/* Items */}
      <section aria-labelledby="order-items">
        <h2 id="order-items" className="font-display text-h3 text-ink">
          Item Pesanan
        </h2>
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-5 py-5">
              <ImageFrame ratio="4 / 5" rounded="xs" className="w-16 shrink-0">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.productName}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <ImagePlaceholder label="Tiada imej" />
                )}
              </ImageFrame>
              <div className="flex flex-1 flex-col justify-between gap-3">
                <div>
                  <p className="text-body-sm text-ink">{item.productName}</p>
                  <p className="mt-1 text-body-sm text-cocoa">
                    {[item.color, item.size].filter(Boolean).join(" · ") ||
                      "Saiz unik"}
                  </p>
                </div>
                <p className="text-body-sm text-cocoa">
                  {item.quantity} × {formatRM(item.unitPrice)}
                </p>
              </div>
              <p className="text-body-sm tabular-nums text-ink">
                {formatRM((Number(item.unitPrice) * item.quantity).toFixed(2))}
              </p>
            </li>
          ))}
        </ul>

        {/* Ringkasan jumlah */}
        <dl className="mt-6 space-y-3 text-body-sm">
          <div className="flex justify-between gap-6 text-cocoa">
            <dt>Subtotal</dt>
            <dd className="tabular-nums text-ink">{formatRM(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-6 text-cocoa">
            <dt>Penghantaran ({order.shippingMethod})</dt>
            <dd className="tabular-nums text-ink">{formatRM(order.shippingFee)}</dd>
          </div>
          <div className="flex justify-between gap-6 border-t border-line pt-4 text-body-lg">
            <dt className="text-ink">Jumlah</dt>
            <dd className="tabular-nums text-ink">{formatRM(order.total)}</dd>
          </div>
        </dl>
      </section>

      {/* Alamat penghantaran */}
      <section aria-labelledby="order-alamat" className="border-t border-line pt-6">
        <h2 id="order-alamat" className="meta-label text-cocoa">
          Alamat Penghantaran
        </h2>
        <address className="mt-4 text-body-sm leading-relaxed text-cocoa not-italic">
          <p className="text-ink">{address.name ?? "-"}</p>
          <p className="tabular-nums">{address.phone ?? "-"}</p>
          <p>{address.address ?? "-"}</p>
          <p>{[address.postcode, address.state].filter(Boolean).join(", ")}</p>
        </address>
      </section>
    </div>
  );
}
