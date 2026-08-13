import { states as statesList } from "@/lib/format";

/**
 * Kadar penghantaran (API.md section 4, DESIGN.md 8).
 * - Semenanjung (13 negeri + WP): J&T Express RM8, Pos Laju RM7.
 * - Timur (Sabah, Sarawak, Labuan): J&T Express RM12, Pos Laju RM11.
 * Masa anggaran: 2-4 hari bekerja untuk kedua-dua kaedah.
 */

export const SHIPPING_METHODS = [
  {
    id: "J&T Express",
    label: "J&T Express",
    feeSemenanjung: 8,
    feeTimur: 12,
    eta: "2-4 hari bekerja",
  },
  {
    id: "Pos Laju",
    label: "Pos Laju",
    feeSemenanjung: 7,
    feeTimur: 11,
    eta: "2-4 hari bekerja",
  },
] as const;

export type ShippingMethodId = (typeof SHIPPING_METHODS)[number]["id"];

export interface ShippingMethod {
  id: ShippingMethodId;
  label: string;
  feeSemenanjung: number;
  feeTimur: number;
  eta: string;
}

/** Negeri Semenanjung (kadar Semenanjung); selain ini dianggap Timur. */
const SEMENANJUNG: ReadonlySet<string> = new Set([
  "Johor",
  "Kedah",
  "Kelantan",
  "Melaka",
  "Negeri Sembilan",
  "Pahang",
  "Perak",
  "Perlis",
  "Pulau Pinang",
  "Selangor",
  "Terengganu",
  "Kuala Lumpur",
  "Putrajaya",
]);

export { statesList };

/** Semak sama ada negeri dalam zon Semenanjung. */
export function isSemenanjung(state: string): boolean {
  return SEMENANJUNG.has(state);
}

/**
 * Kadar penghantaran (RM) untuk kaedah + negeri.
 * Negeri tidak dikenali dianggap zon Timur (kadar lebih tinggi - selamat).
 */
export function shippingRates(method: ShippingMethodId, state: string): number {
  const config = SHIPPING_METHODS.find((m) => m.id === method) ?? SHIPPING_METHODS[0];
  return isSemenanjung(state) ? config.feeSemenanjung : config.feeTimur;
}

/** Senarai kaedah penghantaran untuk paparan (checkout form). */
export function shippingMethods(): ShippingMethod[] {
  return SHIPPING_METHODS.map((m) => ({ ...m }));
}
