"use client";

import { CaretDown } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/akaun/status-badges";
import { formatDate, formatRM } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface AdminOrderRow {
  id: string;
  status: string;
  paymentStatus: string;
  total: string;
  createdAt: string;
  itemCount: number;
  user: { name: string | null; email: string | null };
}

/** Pilihan transition sah sahaja (API.md section 4). */
const STATUS_OPTIONS: Record<string, Array<{ value: string; label: string }>> = {
  PENDING: [
    { value: "PROCESSING", label: "Diproses" },
    { value: "CANCELLED", label: "Dibatalkan" },
  ],
  PROCESSING: [
    { value: "SHIPPED", label: "Dihantar" },
    { value: "CANCELLED", label: "Dibatalkan" },
  ],
  SHIPPED: [{ value: "COMPLETED", label: "Selesai" }],
  COMPLETED: [],
  CANCELLED: [],
};

interface OrderDetailItem {
  id: string;
  productName: string;
  color: string | null;
  size: string | null;
  quantity: number;
  unitPrice: string;
}

interface OrderDetailData {
  status: string;
  paymentStatus: string;
  subtotal: string;
  shippingFee: string;
  total: string;
  shippingMethod: string;
  shippingAddress: {
    name?: string;
    phone?: string;
    address?: string;
    state?: string;
    postcode?: string;
  } | null;
  items: OrderDetailItem[];
  payment: { provider: string; reference: string; status: string } | null;
}

/**
 * Senarai order admin (UX.md section 4 - Order, DESIGN.md 8).
 * Expand row untuk detail (items, alamat, payment) + dropdown status dengan
 * pilihan transition sah sahaja -> PATCH /api/orders/[id]/status.
 */
export function AdminOrderList({ orders }: { orders: AdminOrderRow[] }) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Record<string, OrderDetailData>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function toggleExpand(orderId: string) {
    if (expandedId === orderId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(orderId);
    if (!detail[orderId]) {
      setLoadingId(orderId);
      try {
        const response = await fetch(`/api/orders/${orderId}`, { cache: "no-store" });
        if (!response.ok) {
          toast.error("Gagal memuatkan detail order.");
          return;
        }
        const data = (await response.json()) as OrderDetailData;
        setDetail((current) => ({ ...current, [orderId]: data }));
      } catch {
        toast.error("Ralat dalaman. Sila cuba sebentar lagi.");
      } finally {
        setLoadingId(null);
      }
    }
  }

  async function changeStatus(orderId: string, status: string) {
    setUpdatingId(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        cache: "no-store",
      });
      const body = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(
          typeof body?.error?.message === "string" && body.error.message.length > 0
            ? body.error.message
            : "Gagal mengemas kini status.",
        );
        return;
      }

      toast.success("Status order dikemas kini.");
      setDetail((current) =>
        current[orderId] ? { ...current, [orderId]: { ...current[orderId], status } } : current,
      );
      router.refresh();
    } catch {
      toast.error("Ralat dalaman. Sila cuba sebentar lagi.");
    } finally {
      setUpdatingId(null);
    }
  }

  if (orders.length === 0) {
    return (
      <p className="border border-line bg-paper-lift px-5 py-12 text-center text-body-sm text-cocoa">
        Tiada order lagi.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {orders.map((order) => {
        const orderDetail = detail[order.id];
        const options = STATUS_OPTIONS[order.status] ?? [];
        const isExpanded = expandedId === order.id;

        return (
          <li key={order.id} className="border border-line bg-paper-lift">
            <button
              type="button"
              onClick={() => void toggleExpand(order.id)}
              aria-expanded={isExpanded}
              className="flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4 text-left transition-colors duration-(--dur-fast) hover:bg-bone/40"
            >
              <div className="flex items-center gap-4">
                <CaretDown
                  size={14}
                  aria-hidden="true"
                  className={cn(
                    "shrink-0 text-cocoa motion-safe:transition-transform",
                    isExpanded && "rotate-180",
                  )}
                />
                <div>
                  <p className="font-mono text-body-sm tabular-nums text-ink">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="mt-1 font-mono text-meta text-cocoa">
                    {order.user.name ?? order.user.email ?? "-"} ·{" "}
                    {formatDate(order.createdAt)} · {order.itemCount} item
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-body-sm tabular-nums text-ink">
                  {formatRM(order.total)}
                </span>
                <OrderStatusBadge status={order.status} />
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-line px-5 py-5">
                {loadingId === order.id ? (
                  <p className="text-body-sm text-cocoa">Memuatkan detail...</p>
                ) : orderDetail ? (
                  <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                    {/* Items */}
                    <div>
                      <h3 className="meta-label text-cocoa">Item</h3>
                      <ul className="mt-3 divide-y divide-line border-y border-line">
                        {orderDetail.items.map((item) => (
                          <li
                            key={item.id}
                            className="flex items-center justify-between gap-4 py-3 text-body-sm"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-ink">{item.productName}</p>
                              <p className="mt-0.5 font-mono text-meta text-cocoa">
                                {[item.color, item.size].filter(Boolean).join(" / ") ||
                                  "Saiz tunggal"}{" "}
                                · {item.quantity} unit
                              </p>
                            </div>
                            <span className="shrink-0 tabular-nums text-ink">
                              {formatRM(item.unitPrice)}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <dl className="mt-4 space-y-2 text-body-sm">
                        <div className="flex justify-between gap-6 text-cocoa">
                          <dt>Subtotal</dt>
                          <dd className="tabular-nums text-ink">
                            {formatRM(orderDetail.subtotal)}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-6 text-cocoa">
                          <dt>Penghantaran ({orderDetail.shippingMethod})</dt>
                          <dd className="tabular-nums text-ink">
                            {formatRM(orderDetail.shippingFee)}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-6 border-t border-line pt-2 text-ink">
                          <dt>Jumlah</dt>
                          <dd className="tabular-nums">{formatRM(orderDetail.total)}</dd>
                        </div>
                      </dl>
                    </div>

                    {/* Alamat + payment + status */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="meta-label text-cocoa">Alamat Penghantaran</h3>
                        {orderDetail.shippingAddress ? (
                          <address className="mt-3 text-body-sm text-cocoa not-italic">
                            <p className="text-ink">
                              {orderDetail.shippingAddress.name}
                            </p>
                            <p className="tabular-nums">
                              {orderDetail.shippingAddress.phone}
                            </p>
                            <p className="mt-1">{orderDetail.shippingAddress.address}</p>
                            <p>
                              {orderDetail.shippingAddress.postcode},{" "}
                              {orderDetail.shippingAddress.state}
                            </p>
                          </address>
                        ) : (
                          <p className="mt-3 text-body-sm text-cocoa">Tiada alamat.</p>
                        )}
                      </div>

                      <div>
                        <h3 className="meta-label text-cocoa">Pembayaran</h3>
                        <p className="mt-3 font-mono text-body-sm text-ink">
                          {orderDetail.payment
                            ? `${orderDetail.payment.reference} (${orderDetail.payment.provider})`
                            : "Tiada rekod pembayaran."}
                        </p>
                      </div>

                      <div>
                        <h3 className="meta-label text-cocoa">Kemas Kini Status</h3>
                        {options.length === 0 ? (
                          <p className="mt-3 text-body-sm text-cocoa">
                            Tiada transition sah dari status ini.
                          </p>
                        ) : (
                          <select
                            aria-label="Kemas kini status order"
                            value=""
                            onChange={(event) => {
                              if (event.target.value) {
                                void changeStatus(order.id, event.target.value);
                              }
                            }}
                            disabled={updatingId === order.id}
                            className="mt-3 h-10 w-full rounded-xs border border-line bg-paper-lift px-3 text-body-sm text-ink transition-colors outline-none focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/20 disabled:opacity-50"
                          >
                            <option value="" disabled>
                              {updatingId === order.id ? "Menyimpan..." : "Pilih status..."}
                            </option>
                            {options.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
