import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireAdmin, requireUser } from "@/server/guards";

const { getSessionMock } = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: getSessionMock,
    },
  },
}));

describe("guards", () => {
  beforeEach(() => {
    getSessionMock.mockReset();
  });

  describe("requireUser", () => {
    it("rejects dengan ApiError UNAUTHORIZED jika tiada session", async () => {
      getSessionMock.mockResolvedValue(null);

      await expect(requireUser()).rejects.toMatchObject({
        name: "ApiError",
        code: "UNAUTHORIZED",
        status: 401,
        message: "Sila log masuk dahulu.",
      });
    });

    it("return user jika session wujud", async () => {
      const user = { id: "user-1", email: "nurul@maisara.my", role: "CUSTOMER" };
      getSessionMock.mockResolvedValue({ user });

      await expect(requireUser()).resolves.toEqual(user);
    });
  });

  describe("requireAdmin", () => {
    it("rejects dengan ApiError FORBIDDEN jika role bukan ADMIN", async () => {
      getSessionMock.mockResolvedValue({
        user: { id: "user-1", email: "nurul@maisara.my", role: "CUSTOMER" },
      });

      await expect(requireAdmin()).rejects.toMatchObject({
        name: "ApiError",
        code: "FORBIDDEN",
        status: 403,
        message: "Akses ditolak.",
      });
    });

    it("return user jika role ADMIN", async () => {
      const user = { id: "user-2", email: "admin@maisara.my", role: "ADMIN" };
      getSessionMock.mockResolvedValue({ user });

      await expect(requireAdmin()).resolves.toEqual(user);
    });
  });
});
