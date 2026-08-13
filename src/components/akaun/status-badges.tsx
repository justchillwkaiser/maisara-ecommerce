import { cn } from "@/lib/utils";

/**
 * Badge status (DESIGN.md 7.6) - dikongsi akaun order list/detail dan
 * task admin. Server-safe (tiada hooks).
 * Order: PENDING "Menunggu" (warning), PROCESSING "Diproses" (gold),
 * SHIPPED "Dihantar" (success), COMPLETED "Selesai" (ink), CANCELLED
 * "Dibatalkan" (danger).
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

const BADGE_TONES = {
  warning: "bg-gold-tint text-gold-deep",
  gold: "bg-gold text-card",
  success: "bg-success/10 text-success",
  ink: "bg-surface text-ink",
  danger: "bg-danger/10 text-danger",
} as const;

type Tone = keyof typeof BADGE_TONES;

const ORDER_STATUS_TONES: Record<string, Tone> = {
  PENDING: "warning",
  PROCESSING: "gold",
  SHIPPED: "success",
  COMPLETED: "ink",
  CANCELLED: "danger",
};

const PAYMENT_STATUS_TONES: Record<string, Tone> = {
  PENDING: "warning",
  PAID: "success",
  FAILED: "danger",
};

function Badge({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        BADGE_TONES[tone],
      )}
    >
      {label}
    </span>
  );
}

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      label={ORDER_STATUS_LABELS[status] ?? status}
      tone={ORDER_STATUS_TONES[status] ?? "ink"}
    />
  );
}

export function PaymentStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      label={PAYMENT_STATUS_LABELS[status] ?? status}
      tone={PAYMENT_STATUS_TONES[status] ?? "ink"}
    />
  );
}
