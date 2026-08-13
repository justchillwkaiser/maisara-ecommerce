import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/server/guards";

/**
 * Layout admin (UX.md section 4, DESIGN.md 8 - Admin Panel).
 * Guard dua lapis: proxy (middleware) dah semak session+role; di sini
 * requireAdmin() semula server-side (second layer). Sidebar kiri desktop /
 * top tabs mobile. Header "Admin Maisara" + nama user.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let user: { id: string; name: string | null; email: string; role: string };
  try {
    user = await requireAdmin();
  } catch {
    redirect("/log-masuk?next=/admin");
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-10 md:px-8 md:py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-wide text-gold-deep uppercase">Pentadbiran</p>
          <h1 className="mt-1 font-serif text-3xl font-medium tracking-tight text-ink md:text-4xl">
            Admin Maisara
          </h1>
          {user.name && <p className="mt-2 text-sm text-ink-soft">{user.name}</p>}
        </div>
        <Link
          href="/"
          className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line bg-card px-5 text-sm font-medium text-ink transition-colors hover:border-gold hover:text-gold-deep"
        >
          Lihat Kedai
        </Link>
      </header>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:gap-12">
        <AdminNav name={user.name} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
