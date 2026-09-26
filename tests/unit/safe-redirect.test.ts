import { describe, expect, it } from "vitest";
import { safeRelativePath } from "@/lib/safe-redirect";

describe("safeRelativePath", () => {
  it("membenarkan laluan relatif origin-sama", () => {
    expect(safeRelativePath("/akaun")).toBe("/akaun");
    expect(safeRelativePath("/akaun/order/abc?tab=items#top")).toBe(
      "/akaun/order/abc?tab=items#top",
    );
    expect(safeRelativePath("/koleksi?q=kain batik")).toBe("/koleksi?q=kain batik");
  });

  it("menolak open redirect ke origin lain", () => {
    // `new URL("//evil.com", origin)` menunjuk ke https://evil.com/
    expect(safeRelativePath("//evil.com")).toBe("/");
    expect(safeRelativePath("//evil.com/akaun")).toBe("/");
    // Backslash dianggap slash oleh parser URL untuk skema khas.
    expect(safeRelativePath("/\\evil.com")).toBe("/");
    // Aksara kawalan diabaikan oleh parser, jadi ia boleh menyembunyikan `//`.
    expect(safeRelativePath("/\t/evil.com")).toBe("/");
    expect(safeRelativePath("/\n/evil.com")).toBe("/");
    expect(safeRelativePath(" //evil.com")).toBe("/");
  });

  it("menolak nilai mutlak dan bukan-string", () => {
    expect(safeRelativePath("https://evil.com")).toBe("/");
    expect(safeRelativePath("evil.com")).toBe("/");
    expect(safeRelativePath("")).toBe("/");
    expect(safeRelativePath(undefined)).toBe("/");
    // ?next boleh berulang: Next menghantar tatasusunan.
    expect(safeRelativePath(["/a", "/b"])).toBe("/");
    expect(safeRelativePath({ toString: () => "/akaun" })).toBe("/");
  });

  it("menggunakan fallback yang diberikan", () => {
    expect(safeRelativePath("//evil.com", "/koleksi")).toBe("/koleksi");
  });
});
