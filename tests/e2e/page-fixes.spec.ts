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
    page.getByRole("heading", { name: "It started with a sewing machine." }),
  ).toBeVisible();
  await expect(
    page.getByText("Bermula daripada satu mesin jahit di Johor", { exact: false }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Terokai Koleksi" }).click();
  await expect(page).toHaveURL(/\/koleksi/);
});

test("cart page: senarai item + CTA checkout selepas tambah produk", async ({
  page,
}) => {
  await page.goto("/cart");
  // Empty state wujud (sebelum tambah apa-apa)
  await expect(page.getByText("Beg anda kosong")).toBeVisible();
  await expect(page.getByRole("link", { name: "Lihat Koleksi" })).toBeVisible();

  // Tambah produk pertama -> drawer terbuka -> tutup -> buka /cart penuh
  await addFirstProductToCart(page);
  await page.goto("/cart");
  await expect(page.getByRole("heading", { name: "YOUR BAG" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Teruskan ke Checkout" })).toBeVisible();
  await expect(page.getByText("Ringkasan")).toBeVisible();
});

test("footer links: halaman bantuan dan syarikat berfungsi", async ({ page }) => {
  await page.goto("/");
  const footer = page.getByRole("contentinfo");

  // Bantuan: Penghantaran
  await footer.getByRole("link", { name: "Penghantaran" }).click();
  await expect(page).toHaveURL(/\/penghantaran/);
  await expect(
    page.getByRole("heading", { name: "Penghantaran", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("J&T Express")).toBeVisible();

  // Bantuan: Pertukaran
  await page.goto("/");
  await footer.getByRole("link", { name: "Pertukaran" }).click();
  await expect(page).toHaveURL(/\/pertukaran/);
  await expect(
    page.getByRole("heading", { name: "Pertukaran", exact: true }),
  ).toBeVisible();

  // Bantuan: Hubungi Kami
  await page.goto("/");
  await footer.getByRole("link", { name: "Hubungi Kami" }).click();
  await expect(page).toHaveURL(/\/hubungi-kami/);
  await expect(
    page.getByRole("heading", { name: "LET'S TALK.", exact: true }),
  ).toBeVisible();

  // Syarikat: Kisah Kami
  await page.goto("/");
  await footer.getByRole("link", { name: "Our Story" }).click();
  await expect(page).toHaveURL(/\/kisah-kami/);
});
