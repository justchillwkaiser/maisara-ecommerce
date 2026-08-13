import type { Prisma } from "@/generated/prisma/client";

/**
 * Input wang sentiasa dalam unit RM (bukan sen).
 * Contoh: formatRM(49) -> "RM 49.00", formatRM("189.5") -> "RM 189.50".
 */
export type MoneyInput = number | string | Prisma.Decimal;

const rmFormatter = new Intl.NumberFormat("ms-MY", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatRM(value: MoneyInput): string {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount)) {
    return "RM 0.00";
  }
  return `RM ${rmFormatter.format(amount)}`;
}

const dateFormatter = new Intl.DateTimeFormat("ms-MY", {
  dateStyle: "medium",
});

export function formatDate(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return dateFormatter.format(date);
}

/** 13 negeri + 3 wilayah persekutuan (untuk dropdown alamat penghantaran). */
export const states = [
  "Johor",
  "Kedah",
  "Kelantan",
  "Melaka",
  "Negeri Sembilan",
  "Pahang",
  "Perak",
  "Perlis",
  "Pulau Pinang",
  "Sabah",
  "Sarawak",
  "Selangor",
  "Terengganu",
  "Kuala Lumpur",
  "Labuan",
  "Putrajaya",
] as const;

export type State = (typeof states)[number];
