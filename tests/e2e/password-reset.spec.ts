import { test, expect } from "@playwright/test";
import { USERS, clearResetUrl, getLatestResetToken } from "./helpers";

/**
 * P3 - Password reset (Better Auth 1.6).
 * Flow penuh: lupa kata laluan -> request reset -> token dalam DB
 * (model Verification) -> halaman set semula -> login dengan password baru
 * -> reset balik ke password asal supaya test lain kekal hijau.
 */
test("password reset: request -> token DB -> set semula -> login password baru", async ({
  page,
}) => {
  const NEW_PASSWORD = "Baru123!";

  // 1) Buka halaman lupa kata laluan dari login form.
  await page.goto("/log-masuk");
  await page.getByRole("link", { name: /Lupa kata laluan/i }).click();
  await expect(page).toHaveURL(/\/lupa-kata-laluan/);

  // 2) Request reset. Padam fail mock URL dahulu supaya helper tidak
  // tersilap baca token daripada request sebelum ini.
  clearResetUrl();
  await page.locator("#reset-email").fill(USERS.nurul.email);
  await page.getByRole("button", { name: "Hantar Pautan Reset" }).click();
  await expect(page.getByRole("alert")).toBeVisible();

  // 3) Ambil token reset dari mock email transport.
  const token = await getLatestResetToken();
  expect(token).toBeTruthy();

  // 4) Buka pautan reset dan set password baru.
  await page.goto(`/set-semula-kata-laluan?token=${token}`);
  await page.locator("#reset-new-password").fill(NEW_PASSWORD);
  await page.locator("#reset-confirm-password").fill(NEW_PASSWORD);
  await page.getByRole("button", { name: "Set Semula Kata Laluan" }).click();

  // 5) Redirect ke login + mesej success.
  await expect(page).toHaveURL(/\/log-masuk/);
  await expect(page.getByText("Kata laluan berjaya diset semula. Sila log masuk.")).toBeVisible();

  // 6) Login dengan password baru berfungsi.
  await page.locator("#login-email").fill(USERS.nurul.email);
  await page.locator("#login-password").fill(NEW_PASSWORD);
  await page.getByRole("button", { name: "Log Masuk" }).click();
  await expect(page).not.toHaveURL(/\/log-masuk/, { timeout: 20_000 });
  await expect(page.getByRole("link", { name: /Nurul Aisyah/ })).toBeVisible();

  // 7) Logout, kemudian pulihkan password asal (suite lain guna Demo123!).
  await page.getByRole("button", { name: "Log Keluar" }).click();
  await page.getByRole("button", { name: "Buka menu" }).waitFor({ state: "hidden" }).catch(() => {});
  await page.goto("/log-masuk");
  await page.getByRole("link", { name: /Lupa kata laluan/i }).click();
  clearResetUrl();
  await page.locator("#reset-email").fill(USERS.nurul.email);
  await page.getByRole("button", { name: "Hantar Pautan Reset" }).click();
  await expect(page.getByRole("alert")).toBeVisible();

  const token2 = await getLatestResetToken();
  expect(token2).toBeTruthy();

  await page.goto(`/set-semula-kata-laluan?token=${token2}`);
  await page.locator("#reset-new-password").fill(USERS.nurul.password);
  await page.locator("#reset-confirm-password").fill(USERS.nurul.password);
  await page.getByRole("button", { name: "Set Semula Kata Laluan" }).click();
  await expect(page).toHaveURL(/\/log-masuk/);

  // Sahkan password asal berfungsi semula.
  await page.locator("#login-email").fill(USERS.nurul.email);
  await page.locator("#login-password").fill(USERS.nurul.password);
  await page.getByRole("button", { name: "Log Masuk" }).click();
  await expect(page).not.toHaveURL(/\/log-masuk/, { timeout: 20_000 });
});
