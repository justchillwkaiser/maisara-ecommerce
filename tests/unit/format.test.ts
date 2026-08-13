import { describe, expect, it } from "vitest";
import { Prisma } from "@/generated/prisma/client";
import { formatDate, formatRM, states } from "@/lib/format";

describe("formatRM", () => {
  it("format number dalam unit RM dengan 2 tempat perpuluhan", () => {
    expect(formatRM(49)).toBe("RM 49.00");
  });

  it("format string perpuluhan", () => {
    expect(formatRM("189.5")).toBe("RM 189.50");
  });

  it("format Decimal dari Prisma", () => {
    expect(formatRM(new Prisma.Decimal("1234.5"))).toBe("RM 1,234.50");
  });

  it("guna pemisah ribu untuk nilai besar", () => {
    expect(formatRM(4900)).toBe("RM 4,900.00");
  });

  it("nilai tak sah jatuh ke RM 0.00", () => {
    expect(formatRM("bukan-harga")).toBe("RM 0.00");
  });
});

describe("formatDate", () => {
  it("format tarikh dalam gaya ms-MY", () => {
    expect(formatDate(new Date("2026-08-13T00:00:00Z"))).toBe("13 Ogo 2026");
  });

  it("terima string ISO", () => {
    expect(formatDate("2026-08-13")).toBe("13 Ogo 2026");
  });
});

describe("states", () => {
  it("senarai 13 negeri + 3 wilayah persekutuan", () => {
    expect(states).toHaveLength(16);
    expect(states).toContain("Kuala Lumpur");
    expect(states).toContain("Sarawak");
    expect(states).toContain("Terengganu");
  });
});
