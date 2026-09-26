import { describe, expect, it, vi } from "vitest";
import { parseUserInput } from "better-auth/db";
import type { BetterAuthOptions, User } from "better-auth";

// Konfigurasi auth diuji tanpa pangkalan data sebenar: ujian ini menguji
// kontrak konfigurasi + laluan pengesahan Better Auth, bukan sambungan DB.
vi.mock("@/lib/db", () => ({ db: {} }));
vi.mock("@/lib/email-transport", () => ({ sendResetPasswordEmail: vi.fn() }));

const { auth } = await import("@/lib/auth");

describe("konfigurasi auth", () => {
  it("mengabaikan `role` daripada badan permintaan sign-up", () => {
    // `parseUserInput` ialah laluan sebenar yang digunakan Better Auth semasa
    // sign-up; dengan `input: false` nilai daripada klien digantikan dengan
    // defaultValue, jadi pendaftaran sendiri tidak boleh menetapkan peranan.
    const created = parseUserInput(
      auth.options as BetterAuthOptions,
      { name: "Zed", email: "zed@example.com", role: "ADMIN" },
      "create",
    ) as Record<string, unknown>;
    expect(created.role).toBe("CUSTOMER");
  });

  it("mengambil origin laman daripada persekitaran Vercel apabila BETTER_AUTH_URL tiada", async () => {
    // Import dinamik diperlukan: modul mesti dinilai semula selepas env
    // diganti (vite/vitest mengekalkan modul pertama sahaja).
    vi.resetModules();
    vi.stubEnv("BETTER_AUTH_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "maisara-prod.vercel.app");
    const { auth: reloaded } = await import("@/lib/auth");
    expect(reloaded.options.baseURL).toBe("https://maisara-prod.vercel.app");
    expect(reloaded.options.trustedOrigins).toContain(
      "https://maisara-prod.vercel.app",
    );
    vi.unstubAllEnvs();
  });

  it("membina pautan set semula daripada token dalam PATH URL Better Auth", async () => {
    vi.resetModules();
    vi.stubEnv("BETTER_AUTH_URL", "https://butik.example.com");
    const { auth: reloaded } = await import("@/lib/auth");
    // Ambil mock SELEPAS resetModules supaya instance yang sama digunakan.
    const { sendResetPasswordEmail } = await import("@/lib/email-transport");
    const send = reloaded.options.emailAndPassword?.sendResetPassword;
    await send?.({
      // Hanya e-mel yang digunakan oleh penghantar kita.
      user: { email: "nurul@maisara.my" } as unknown as User,
      url: "https://butik.example.com/api/auth/reset-password/TOKEN123?callbackURL=",
      token: "TOKEN123",
    });
    expect(sendResetPasswordEmail).toHaveBeenCalledExactlyOnceWith({
      email: "nurul@maisara.my",
      url: "https://butik.example.com/set-semula-kata-laluan?token=TOKEN123",
    });
    vi.unstubAllEnvs();
  });
});
