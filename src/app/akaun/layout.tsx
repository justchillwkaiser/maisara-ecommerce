import { redirect } from "next/navigation";

import { AkaunNav } from "@/components/akaun/akaun-nav";
import { requireUser } from "@/server/guards";
export const dynamic = "force-dynamic";

/**
 * Layout akaun (UX.md section 4, DESIGN.md 8 - Akaun).
 * Guard session: tiada session -> redirect /log-masuk?next=/akaun.
 * Header "Akaun Saya" + nama user; rel tab (desktop: menegak / mobile: mendatar).
 */
export default async function AkaunLayout({ children }: { children: React.ReactNode }) {
  let user: { id: string; name: string | null; email: string; role: string };
  try {
    user = await requireUser();
  } catch {
    redirect("/log-masuk?next=/akaun");
  }

  return (
    <div className="shell py-12 md:py-16">
      <header>
        <p className="meta-label text-cocoa">Akaun</p>
        <h1 className="mt-4 font-display text-h1 text-ink">Akaun Saya</h1>
        {user.name && <p className="mt-3 text-body-sm text-cocoa">{user.name}</p>}
      </header>

      <div className="mt-12 flex flex-col gap-10 lg:flex-row lg:gap-16">
        <AkaunNav name={user.name} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
