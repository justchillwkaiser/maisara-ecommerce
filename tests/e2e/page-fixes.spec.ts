import { expect, test } from "@playwright/test";

import { addFirstProductToCart } from "./helpers";

/**
 * Backlog P1 fix: halaman /kisah-kami dan /cart sebelum ini 404.
 * - /kisah-kami: editorial page boleh dibuka, tajuk + CTA ke koleksi.
 * - /cart: fallback penuh untuk CartButton, senarai item + CTA checkout.
 */
test("kisah-kami: halaman editorial wujud dan CTA ke koleksi berfungsi", async ({
  page,
}) => {
  await page.goto("/kisah-kami");
  await expect(
    page.getByRole("heading", { name: "Kisah Maisara" }),
  ).toBeVisible();
  await expect(
    page.getByText("Maisara lahir di Johor", { exact: false }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Terokai Koleksi" }).click();
  await expect(page).toHaveURL(/\/koleksi/);
});

test("cart page: senarai item + CTA checkout selepas tambah produk", async ({
  page,
}) => {
  await page.goto("/cart");
  // Empty state wujud (sebelum tambah apa-apa)
  await expect(page.getByText("Cart kosong.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Lihat Koleksi" })).toBeVisible();

  // Tambah produk pertama -> drawer terbuka -> tutup -> buka /cart penuh
  await addFirstProductToCart(page);
  await page.goto("/cart");
  await expect(page.getByRole("heading", { name: "Cart Anda" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Teruskan ke Checkout" })).toBeVisible();
  await expect(page.getByText("Ringkasan")).toBeVisible();
});
