import { expect, test } from "@playwright/test";

import { USERS, login } from "./helpers";

/**
 * Security smoke E2E (plan Task 13 Step 4):
 * - Tanpa login: /akaun dan /admin redirect ke /log-masuk.
 * - Tanpa login: POST /api/orders dan POST /api/products -> 401.
 * - Customer session: POST /api/products -> 403.
 */

test("tanpa login: /akaun dan /admin redirect ke /log-masuk", async ({ page }) => {
  await page.goto("/akaun");
  await expect(page).toHaveURL(/\/log-masuk/);

  await page.goto("/admin");
  await expect(page).toHaveURL(/\/log-masuk/);
});

test("tanpa login: API orders & products -> 401", async ({ request }) => {
  const ordersResponse = await request.post("/api/orders", { data: {} });
  expect(ordersResponse.status()).toBe(401);

  const productsResponse = await request.post("/api/products", { data: {} });
  expect(productsResponse.status()).toBe(401);
});

test("customer session: POST /api/products -> 403", async ({ page }) => {
  await login(page, USERS.nurul.email, USERS.nurul.password);

  // Fetch dari dalam page (same-origin: Origin header + session cookies).
  const status = await page.evaluate(async () => {
    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    return response.status;
  });
  expect(status).toBe(403);
});
