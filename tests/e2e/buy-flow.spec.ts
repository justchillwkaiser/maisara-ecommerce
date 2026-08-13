import { expect, test, type Browser } from "@playwright/test";

import {
  USERS,
  addFirstProductToCart,
  fillCheckoutToPayment,
  login,
} from "./helpers";

/**
 * Buy flow E2E (plan Task 13 Step 2):
 * - Happy path: browse -> cart -> checkout -> bayar berjaya -> order success
 *   -> akaun/order menunjukkan order baru (PENDING + Dibayar).
 * - Flow gagal: Bayaran Gagal -> mesej jelas -> Cuba Semula berfungsi.
 * - Smoke mobile 390px: hamburger nav + grid.
 */

test("buy flow lengkap: hero -> koleksi -> PDP -> cart -> checkout -> bayar berjaya", async ({
  page,
}) => {
  // Homepage: hero + section featured
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Warisan untuk fesyen harian/ }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Pilihan Maisara" })).toBeVisible();

  // Buka koleksi
  await page.getByRole("link", { name: "Lihat Koleksi" }).first().click();
  await expect(page).toHaveURL(/\/koleksi/);
  await expect(page.getByRole("heading", { name: "Semua Koleksi" })).toBeVisible();

  // Produk pertama -> pilih variant -> tambah ke cart -> drawer terbuka
  await addFirstProductToCart(page);

  // Teruskan ke checkout -> belum login -> redirect /log-masuk
  await page.getByRole("link", { name: "Teruskan ke Checkout" }).click();
  await expect(page).toHaveURL(/\/log-masuk/);

  // Login nurul -> kembali ke checkout (cart guest di-merge server-side)
  await login(page, USERS.nurul.email, USERS.nurul.password);
  await expect(page).toHaveURL(/\/checkout/, { timeout: 20_000 });

  // Isi alamat -> J&T Express (default) -> Bayar Sekarang
  await fillCheckoutToPayment(page);
  await page.getByRole("button", { name: "Bayar Sekarang" }).click();
  await expect(page).toHaveURL(/\/pembayaran\//, { timeout: 20_000 });
  await expect(page.getByRole("heading", { name: "Bayaran melalui FPX" })).toBeVisible();

  // Simulasi FPX berjaya
  await page.getByRole("button", { name: "Bayaran Berjaya" }).click();
  await expect(page).toHaveURL(/\/order\/success/);
  await expect(page.getByRole("heading", { name: "Terima kasih!" })).toBeVisible();
  await expect(page.getByText("Menunggu pemprosesan")).toBeVisible();

  // Akaun order: order baru pertama = PENDING + Dibayar
  await page.goto("/akaun/order");
  const firstOrder = page.locator('a[href^="/akaun/order/"]').first();
  await expect(firstOrder.getByText("Menunggu")).toBeVisible();
  await expect(firstOrder.getByText("Dibayar")).toBeVisible();
});

test("payment gagal: mesej jelas + cuba semula berfungsi", async ({ page }) => {
  // Login dahulu, kemudian tambah item ke cart
  await login(page, USERS.nurul.email, USERS.nurul.password);
  await addFirstProductToCart(page);

  await page.getByRole("link", { name: "Teruskan ke Checkout" }).click();
  await expect(page).toHaveURL(/\/checkout/);

  await fillCheckoutToPayment(page);
  await page.getByRole("button", { name: "Bayar Sekarang" }).click();
  await expect(page).toHaveURL(/\/pembayaran\//, { timeout: 20_000 });

  // Simulasi FPX gagal -> halaman status failed
  await page.getByRole("button", { name: "Bayaran Gagal" }).click();
  await expect(page).toHaveURL(/\/order\/success\?status=failed/);
  await expect(
    page.getByRole("heading", { name: "Pembayaran tidak berjaya" }),
  ).toBeVisible();

  // Cuba Semula -> kembali ke halaman pembayaran (status FAILED -> papar cuba semula)
  await page.getByRole("link", { name: "Cuba Semula" }).click();
  await expect(page).toHaveURL(/\/pembayaran\//);
  await expect(page.getByRole("heading", { name: "Bayaran melalui FPX" })).toBeVisible();
  await expect(page.getByText("Pembayaran tidak berjaya")).toBeVisible();
});

test("mobile smoke 390px: hamburger nav + grid koleksi", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    baseURL: "http://localhost:3000",
  });
  const page = await context.newPage();

  await page.goto("/");
  // Hamburger kelihatan (desktop nav tersembunyi < 1024px)
  const hamburger = page.getByRole("button", { name: "Buka menu" });
  await expect(hamburger).toBeVisible();
  await hamburger.click();

  // Overlay menu mobile: pautan koleksi boleh diklik
  // (skop ke nav "Menu utama" - footer juga ada pautan "Semua Koleksi").
  const menuNav = page.getByLabel("Menu utama");
  const menuLink = menuNav.getByRole("link", { name: "Semua Koleksi" });
  await expect(menuLink).toBeVisible();
  await menuLink.click();
  await expect(page).toHaveURL(/\/koleksi/);

  // Grid produk collapse: produk pertama kelihatan
  await expect(page.locator('a[href^="/produk/"]').first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Buka menu" })).toBeVisible();

  await context.close();
});
