import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/server/guards";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/**
 * Layout admin (UX.md section 4, DESIGN.md 8 - Admin Panel).
 * Guard dua lapis: proxy (middleware) dah semak session+role; di sini
 * requireAdmin() semula server-side (second layer). Rel nav menegak desktop /
 * mendatar mobile. Header "Admin Maisara" + nama user.
 *
 * Ini alat kerja, bukan storefront: tiada rawatan hero editorial, hanya
 * permukaan `bg-paper` yang padat dengan garis halus.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let user: { id: string; name: string | null; email: string; role: string };
  try {
    user = await requireAdmin();
  } catch {
    redirect("/log-masuk?next=/admin");
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="shell py-10 md:py-12">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="meta-label text-cocoa">Pentadbiran</p>
            <h1 className="mt-3 font-display text-h1 text-ink">Admin Maisara</h1>
            {user.name && <p className="mt-2 text-body-sm text-cocoa">{user.name}</p>}
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/">Lihat Kedai</Link>
          </Button>
        </header>

        <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:gap-12">
          <AdminNav name={user.name} />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
