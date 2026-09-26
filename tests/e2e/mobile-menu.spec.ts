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
/**
 * Panel menu hanya dirender di bawah `lg`. Dulu, apabila viewport melebar
 * melepasi had itu sementara panel terbuka (putaran peranti atau tetingkap
 * dibesarkan), panel menjadi `display:none` tetapi state kekal terbuka:
 * perangkap Tab terus `preventDefault()` dan cuba memfokus pautan tersembunyi,
 * jadi kekunci Tab mati sepenuhnya dan kunci skrol badan kekal.
 */
test("menu mudah alih ditutup apabila viewport melebar melepasi lg", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Buka menu" }).click();
  await expect(page.getByLabel("Menu utama")).toBeVisible();

  await page.setViewportSize({ width: 1280, height: 844 });

  await expect(page.getByLabel("Menu utama")).toBeHidden();
  await expect
    .poll(() => page.evaluate(() => document.body.style.overflow))
    .toBe("");
  await page.keyboard.press("Tab");
  await expect
    .poll(() => page.evaluate(() => document.activeElement?.tagName ?? "NONE"))
    .not.toBe("BODY");
});
