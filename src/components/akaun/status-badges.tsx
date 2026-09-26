import { Badge } from "@/components/ui/badge";

/**
 * Badge status (DESIGN.md 7.6) - dikongsi akaun order list/detail dan
 * task admin. Server-safe (tiada hooks).
 *
 * Label kekal seperti sebelum ini; hanya warna dipetakan kepada varian Badge
 * sistem MAISARA (brass/clay/olive ialah aksen hiasan - teks kekal cocoa).
 * Order: PENDING "Menunggu", PROCESSING "Diproses", SHIPPED "Dihantar",
 * COMPLETED "Selesai", CANCELLED "Dibatalkan".
 */

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Menunggu",
  PROCESSING: "Diproses",
  SHIPPED: "Dihantar",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Menunggu Bayaran",
  PAID: "Dibayar",
  FAILED: "Gagal",
};

type StatusVariant = "default" | "outline" | "muted" | "brass" | "clay" | "olive" | "danger";

const ORDER_STATUS_VARIANTS: Record<string, StatusVariant> = {
  PENDING: "outline",
  PROCESSING: "brass",
  SHIPPED: "clay",
  COMPLETED: "default",
  CANCELLED: "danger",
};

const PAYMENT_STATUS_VARIANTS: Record<string, StatusVariant> = {
  PENDING: "outline",
  PAID: "olive",
  FAILED: "danger",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={ORDER_STATUS_VARIANTS[status] ?? "outline"}>
      {ORDER_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

export function PaymentStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={PAYMENT_STATUS_VARIANTS[status] ?? "outline"}>
      {PAYMENT_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
