import { describe, expect, it } from "vitest";

import { shippingMethods, shippingRates, statesList } from "@/lib/shipping";

/**
 * Kadar penghantaran (API.md section 4 + DESIGN.md 8).
 * Semenanjung: J&T RM8, Pos Laju RM7. Timur (Sabah/Sarawak/Labuan): J&T RM12, Pos Laju RM11.
 */
describe("shippingRates", () => {
  it("J&T Express: Semenanjung RM8, Timur RM12", () => {
    expect(shippingRates("J&T Express", "Selangor")).toBe(8);
    expect(shippingRates("J&T Express", "Sabah")).toBe(12);
    expect(shippingRates("J&T Express", "Sarawak")).toBe(12);
    expect(shippingRates("J&T Express", "Labuan")).toBe(12);
  });

  it("Pos Laju: Semenanjung RM7, Timur RM11", () => {
    expect(shippingRates("Pos Laju", "Kuala Lumpur")).toBe(7);
    expect(shippingRates("Pos Laju", "Sarawak")).toBe(11);
    expect(shippingRates("Pos Laju", "Putrajaya")).toBe(7);
  });

  it("semua negeri dalam statesList diliputi (tiada NaN)", () => {
    for (const state of statesList) {
      for (const method of ["J&T Express", "Pos Laju"] as const) {
        const fee = shippingRates(method, state);
        expect(Number.isFinite(fee)).toBe(true);
        expect(fee).toBeGreaterThan(0);
      }
    }
  });
});

describe("shippingMethods", () => {
  it("senarai kaedah dengan id, label, feeSemenanjung, feeTimur, eta", () => {
    expect(shippingMethods()).toEqual([
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
    ]);
  });

  it("statesList mengandungi 16 negeri termasuk Sabah dan Labuan", () => {
    expect(statesList).toHaveLength(16);
    expect(statesList).toContain("Sabah");
    expect(statesList).toContain("Labuan");
    expect(statesList).toContain("Selangor");
  });
});
