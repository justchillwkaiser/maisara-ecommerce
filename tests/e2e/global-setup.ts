import { execSync } from "node:child_process";

/**
 * Reset DB sebelum suite E2E (Task 13, plan Step 1: "reset DB sebelum
 * suite"). Seed idempotent: padam data demo users dan cipta semula
 * (22 produk, variants, orders, reviews PENDING, dll.) supaya setiap
 * run suite boleh diulang dengan data yang sama.
 */
export default function globalSetup(): void {
  console.log("[global-setup] reset DB via seed...");
  execSync("npx prisma db seed", { stdio: "inherit", cwd: process.cwd() });
  console.log("[global-setup] seed selesai.");
}
