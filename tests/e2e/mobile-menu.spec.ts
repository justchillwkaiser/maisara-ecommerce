import { test, expect } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

test("menu mobile memenuhi viewport tanpa scroll", async ({ page }) => {
  await page.goto("/");
  const hamburger = page.getByRole("button", { name: "Buka menu" });
  await expect(hamburger).toBeVisible();
  await hamburger.click();

  const menuNav = page.getByLabel("Menu utama");
  await expect(menuNav).toBeVisible();

  const metrics = await page.evaluate(() => {
    const nav = document.querySelector('[aria-label="Menu utama"]');
    const overlay = nav?.closest(".fixed");
    if (!overlay) return null;
    const rect = overlay.getBoundingClientRect();
    return {
      overlayHeight: rect.height,
      viewportHeight: window.innerHeight,
      bodyOverflow: getComputedStyle(document.body).overflow,
      overlayIsFixed: getComputedStyle(overlay).position === "fixed",
    };
  });

  expect(metrics).not.toBeNull();
  expect(metrics!.overlayIsFixed).toBe(true);
  expect(metrics!.bodyOverflow).toBe("hidden");
  expect(metrics!.overlayHeight).toBeGreaterThanOrEqual(metrics!.viewportHeight - 2);
});
