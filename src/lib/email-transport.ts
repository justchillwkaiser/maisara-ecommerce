import { writeFileSync } from "node:fs";
import path from "node:path";

/**
 * Abstraksi penghantaran email Maisara.
 * Mock transport (demo): pautan reset ditulis ke fail sementara
 * (.reset-url.tmp) dan di-log ke console supaya flow boleh diuji tanpa
 * provider email. Untuk production, ganti isi fungsi ini dengan provider
 * sebenar (cth. Resend) - tiada perubahan pada pemanggil.
 */
export interface ResetPasswordEmail {
  email: string;
  url: string;
}

export async function sendResetPasswordEmail({ email, url }: ResetPasswordEmail): Promise<void> {
  console.log(`[email:mock] reset-password untuk ${email}: ${url}`);
  if (process.env.NODE_ENV !== "production") {
    // Simpan URL untuk e2e/demo (token sebenar yang dihantar ke user).
    writeFileSync(path.join(process.cwd(), ".reset-url.tmp"), url, "utf8");
  }
}
