import { test, expect } from "@playwright/test";
import { USERS, login } from "./helpers";

/**
 * P3 - Profil edit: nama + tukar kata laluan dari /akaun.
 * Akhir test memulihkan nama dan password asal supaya suite lain kekal hijau.
 */
test("profil edit: tukar nama + tukar kata laluan dari akaun", async ({ page }) => {
  const NEW_PASSWORD = "Profil123!";
  await login(page, USERS.nurul.email, USERS.nurul.password);

  // 1) Pergi ke akaun dan edit nama.
  await page.goto("/akaun");
  await expect(page.getByRole("heading", { name: "Profil" })).toBeVisible();

  await page.locator("#profile-name").fill("Nurul Ujian");
  await page.getByRole("button", { name: "Simpan Nama" }).click();
  await expect(page.getByText("Nama berjaya dikemas kini.")).toBeVisible();

  // Header desktop tunjuk nama baru (selepas refresh).
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Nurul Ujian" })).toBeVisible();

  // 2) Tukar kata laluan dari akaun.
  await page.goto("/akaun");
  await page.locator("#password-current").fill(USERS.nurul.password);
  await page.locator("#password-new").fill(NEW_PASSWORD);
  await page.locator("#password-confirm").fill(NEW_PASSWORD);
  await page.getByRole("button", { name: "Tukar Kata Laluan" }).click();
  await expect(page.getByText("Kata laluan berjaya ditukar.")).toBeVisible();

  // 3) Logout dan login dengan password baru.
  await page.goto("/");
  await page.getByRole("button", { name: "Log Keluar" }).click();
  await login(page, USERS.nurul.email, NEW_PASSWORD);
  await expect(page.getByRole("link", { name: "Nurul Ujian" })).toBeVisible();

  // 4) Pulihkan state asal: password Demo123! + nama asal.
  await page.goto("/akaun");
  await page.locator("#password-current").fill(NEW_PASSWORD);
  await page.locator("#password-new").fill(USERS.nurul.password);
  await page.locator("#password-confirm").fill(USERS.nurul.password);
  await page.getByRole("button", { name: "Tukar Kata Laluan" }).click();
  await expect(page.getByText("Kata laluan berjaya ditukar.")).toBeVisible();

  await page.locator("#profile-name").fill("Nurul Aisyah");
  await page.getByRole("button", { name: "Simpan Nama" }).click();
  await expect(page.getByText("Nama berjaya dikemas kini.")).toBeVisible();
});
