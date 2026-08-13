import { defineConfig, devices } from "@playwright/test";

/**
 * Konfigurasi E2E Maisara (Task 13).
 * - Satu project chromium, headless.
 * - workers: 1 + retries: 0 (suite serial guna DB bersama; global-setup
 *   reset DB via seed sebelum setiap run supaya suite boleh diulang).
 * - webServer: `npm run dev` di port 3000 (reuse kalau dah jalan).
 */
export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  retries: 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
