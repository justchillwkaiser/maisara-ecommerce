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
      <div className="rounded-2xl border border-line bg-card px-6 py-14 text-center text-sm text-ink-soft">
        Tiada order lagi.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {orders.map((order) => {
        const orderDetail = detail[order.id];
        const options = STATUS_OPTIONS[order.status] ?? [];
        const isExpanded = expandedId === order.id;

        return (
          <li key={order.id} className="rounded-2xl border border-line bg-card">
            <button
              type="button"
              onClick={() => void toggleExpand(order.id)}
              aria-expanded={isExpanded}
              className="flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-5 text-left"
            >
              <div className="flex items-center gap-4">
                <CaretDown
                  size={16}
                  className={cn(
                    "shrink-0 text-ink-soft transition-transform",
                    isExpanded && "rotate-180",
                  )}
                />
                <div>
                  <p className="font-medium tabular-nums text-ink">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="mt-0.5 text-sm text-ink-soft">
                    {order.user.name ?? order.user.email ?? "-"} · {formatDate(order.createdAt)} ·{" "}
                    {order.itemCount} item
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-base font-medium tabular-nums text-ink">
                  {formatRM(order.total)}
                </span>
                <OrderStatusBadge status={order.status} />
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-line px-6 py-5">
                {loadingId === order.id ? (
                  <p className="text-sm text-ink-soft">Memuatkan detail...</p>
                ) : orderDetail ? (
                  <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                    {/* Items */}
                    <div>
                      <h3 className="text-xs font-medium tracking-wide text-ink-soft uppercase">
                        Item
                      </h3>
                      <ul className="mt-3 space-y-2">
                        {orderDetail.items.map((item) => (
                          <li
                            key={item.id}
                            className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface/40 px-4 py-3 text-sm"
                          >
                            <div className="min-w-0">
                              <p className="truncate font-medium text-ink">
                                {item.productName}
                              </p>
                              <p className="text-xs text-ink-soft">
                                {[item.color, item.size].filter(Boolean).join(" / ") ||
                                  "Saiz tunggal"}{" "}
                                · {item.quantity} unit
                              </p>
                            </div>
                            <span className="shrink-0 font-medium tabular-nums text-ink">
                              {formatRM(item.unitPrice)}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <dl className="mt-4 space-y-1.5 text-sm">
                        <div className="flex justify-between text-ink-soft">
                          <dt>Subtotal</dt>
                          <dd className="tabular-nums">{formatRM(orderDetail.subtotal)}</dd>
                        </div>
                        <div className="flex justify-between text-ink-soft">
                          <dt>Penghantaran ({orderDetail.shippingMethod})</dt>
                          <dd className="tabular-nums">{formatRM(orderDetail.shippingFee)}</dd>
                        </div>
                        <div className="flex justify-between border-t border-line pt-1.5 font-medium text-ink">
                          <dt>Jumlah</dt>
                          <dd className="tabular-nums">{formatRM(orderDetail.total)}</dd>
                        </div>
                      </dl>
                    </div>

                    {/* Alamat + payment + status */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xs font-medium tracking-wide text-ink-soft uppercase">
                          Alamat Penghantaran
                        </h3>
                        {orderDetail.shippingAddress ? (
                          <address className="mt-2 text-sm text-ink not-italic">
                            <p className="font-medium">{orderDetail.shippingAddress.name}</p>
                            <p className="text-ink-soft">{orderDetail.shippingAddress.phone}</p>
                            <p className="mt-1 text-ink-soft">
                              {orderDetail.shippingAddress.address}
                            </p>
                            <p className="text-ink-soft">
                              {orderDetail.shippingAddress.postcode},{" "}
                              {orderDetail.shippingAddress.state}
                            </p>
                          </address>
                        ) : (
                          <p className="mt-2 text-sm text-ink-soft">Tiada alamat.</p>
                        )}
                      </div>

                      <div>
                        <h3 className="text-xs font-medium tracking-wide text-ink-soft uppercase">
                          Pembayaran
                        </h3>
                        <p className="mt-2 text-sm text-ink">
                          {orderDetail.payment
                            ? `${orderDetail.payment.reference} (${orderDetail.payment.provider})`
                            : "Tiada rekod pembayaran."}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-xs font-medium tracking-wide text-ink-soft uppercase">
                          Kemas Kini Status
                        </h3>
                        {options.length === 0 ? (
                          <p className="mt-2 text-sm text-ink-soft">
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
                            className="mt-2 h-10 w-full rounded-xl border border-line bg-card px-3 text-sm transition-colors outline-none focus-visible:border-gold focus-visible:ring-3 focus-visible:ring-gold/25 disabled:opacity-50"
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
