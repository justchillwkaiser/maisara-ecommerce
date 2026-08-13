import { expect, test } from "@playwright/test";

import { USERS, login } from "./helpers";

/**
 * Admin E2E (plan Task 13 Step 3):
 * - Admin: dashboard stats -> produk table -> order status (Diproses) ->
 *   stok rendah -> approve review.
 * - Customer: /admin redirect ke /.
 */

test("admin: dashboard, produk, order status, stok, review", async ({ page }) => {
  await login(page, USERS.admin.email, USERS.admin.password);

  // Feedback login: header tunjuk nama + link Admin (bukan "Log Masuk").
  await expect(page.getByRole("link", { name: "Aminah" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Admin", exact: true })).toBeVisible();

  // Dashboard: stats kad + order terkini
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Admin Maisara" })).toBeVisible();
  await expect(page.getByText("Jumlah Order")).toBeVisible();
  await expect(page.getByText("Order Terkini")).toBeVisible();

  // Produk: jadual kelihatan
  await page.goto("/admin/produk");
  await expect(page.getByRole("heading", { name: "Produk" })).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByRole("link", { name: "Tambah Produk" }).first()).toBeVisible();

  // Order: senarai + tukar status order pertama (PENDING -> Diproses)
  await page.goto("/admin/order");
  await expect(page.getByRole("heading", { name: "Order" })).toBeVisible();
  // Baris order = butang toggle dengan nama bermula "#" (ID order ringkas);
  // elak butang lain dalam header/footer. Expand order PENDING (badge "Menunggu")
  // — order CANCELLED tiada transition sah (tiada combobox).
  await page.locator("main").getByRole("button", { name: /Menunggu/ }).first().click();
  const statusSelect = page.getByRole("combobox", { name: "Kemas kini status order" });
  await expect(statusSelect).toBeVisible();
  await statusSelect.selectOption("PROCESSING");
  await expect(page.getByText("Status order dikemas kini.")).toBeVisible();

  // Stok: senarai + tab Stok Rendah -> badge stok rendah
  await page.goto("/admin/stok");
  await expect(page.getByRole("heading", { name: "Stok" })).toBeVisible();
  const lowStockTab = page.getByRole("link", { name: "Stok Rendah" });
  await expect(lowStockTab).toBeVisible();
  await lowStockTab.click();
  await expect(page).toHaveURL(/lowOnly=true/);
  await expect(page.locator("text=/^(Habis|[0-9]+ lagi)$/").first()).toBeVisible();

  // Review: senarai pending + lulus satu review
  await page.goto("/admin/review");
  await expect(page.getByRole("heading", { name: "Review" })).toBeVisible();
  const approveButton = page.getByRole("button", { name: "Lulus" }).first();
  await expect(approveButton).toBeVisible();
  await approveButton.click();
  await expect(page.getByText("Ulasan diluluskan.")).toBeVisible();
});

test("customer tidak boleh akses /admin (redirect ke /)", async ({ page }) => {
  await login(page, USERS.nurul.email, USERS.nurul.password);
  await page.goto("/admin");
  await expect(page).toHaveURL("http://localhost:3000/");
});
