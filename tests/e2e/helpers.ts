import { expect, type Page } from "@playwright/test";

/** Akaun demo dari seed (prisma/seed.ts). */
export const USERS = {
  admin: { email: "admin@maisara.my", password: "AdminDemo123!" },
  nurul: { email: "nurul@maisara.my", password: "Demo123!" },
} as const;

/**
 * Login melalui UI (/log-masuk) - menguji form auth sebenar,
 * bukan API. Jika page sudah berada di /log-masuk (cth. selepas redirect
 * dari halaman protected dengan ?next=...), kekal di situ supaya
 * callbackUrl tidak hilang. Selepas submit, tunggu keluar dari /log-masuk.
 */
export async function login(page: Page, email: string, password: string): Promise<void> {
  const current = new URL(page.url());
  if (!current.pathname.startsWith("/log-masuk")) {
    await page.goto("/log-masuk");
  }
  await page.locator("#login-email").fill(email);
  await page.locator("#login-password").fill(password);
  await page.getByRole("button", { name: "Log Masuk" }).click();
  await expect(page).not.toHaveURL(/\/log-masuk/, { timeout: 20_000 });
}

/**
 * Pergi ke /koleksi, buka produk pertama, pilih variant pertama yang ada
 * stok (swatch warna pertama; saiz pertama yang enabled jika produk ada
 * saiz), tambah ke cart, dan pastikan drawer cart terbuka.
 */
export async function addFirstProductToCart(page: Page): Promise<void> {
  await page.goto("/koleksi");
  await page.locator('a[href^="/produk/"]').first().click();
  await expect(page).toHaveURL(/\/produk\//);

  // Swatch warna pertama yang ada stok (aria-label "Warna X").
  const colorButtons = page.getByRole("button", { name: /^Warna / });
  const colorCount = await colorButtons.count();
  expect(colorCount).toBeGreaterThan(0);
  await colorButtons.first().click();

  // Jika produk ada saiz, pilih saiz pertama yang enabled.
  const sizeButtons = page.getByRole("button", { name: /^Saiz / });
  const sizeCount = await sizeButtons.count();
  for (let i = 0; i < sizeCount; i += 1) {
    const sizeButton = sizeButtons.nth(i);
    if (await sizeButton.isEnabled()) {
      await sizeButton.click();
      break;
    }
  }

  await page.getByRole("button", { name: "Tambah ke Cart" }).click();
  await expect(page.getByRole("link", { name: "Teruskan ke Checkout" })).toBeVisible();
}

/**
 * Isi borang checkout: Alamat -> Teruskan -> Penghantaran (J&T Express
 * default) -> Teruskan -> Semakan & Bayar. Berhenti di langkah bayar.
 */
export async function fillCheckoutToPayment(page: Page): Promise<void> {
  await expect(page.getByRole("heading", { name: "Selesaikan Pesanan Anda" })).toBeVisible();

  await page.locator("#shipping-name").fill("Nurul Aisyah");
  await page.locator("#shipping-phone").fill("0123456789");
  await page.locator("#shipping-postcode").fill("40000");
  await page.locator("#shipping-address").fill("No. 12, Jalan Melati, Taman Bahagia, Shah Alam");
  await page.locator("#shipping-state").selectOption("Selangor");
  await page.getByRole("button", { name: "Teruskan", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Kaedah Penghantaran" })).toBeVisible();

  await page.getByRole("button", { name: "Teruskan", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Semakan & Bayar" })).toBeVisible();
}
