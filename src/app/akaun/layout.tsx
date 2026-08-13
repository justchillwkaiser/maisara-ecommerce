import { redirect } from "next/navigation";

import { AkaunNav } from "@/components/akaun/akaun-nav";
import { requireUser } from "@/server/guards";
export const dynamic = "force-dynamic";

/**
 * Layout akaun (UX.md section 4, DESIGN.md 8 - Akaun).
 * Guard session: tiada session -> redirect /log-masuk?next=/akaun.
 * Header "Akaun Saya" + nama user; sidebar (desktop) / tabs (mobile).
 */
export default async function AkaunLayout({ children }: { children: React.ReactNode }) {
  let user: { id: string; name: string | null; email: string; role: string };
  try {
    user = await requireUser();
  } catch {
    redirect("/log-masuk?next=/akaun");
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-10 md:px-8 md:py-16">
      <header>
        <p className="text-xs tracking-wide text-ink-soft uppercase">Akaun</p>
        <h1 className="mt-1 font-serif text-3xl font-medium tracking-tight text-ink md:text-4xl">
          Akaun Saya
        </h1>
        {user.name && <p className="mt-2 text-sm text-ink-soft">{user.name}</p>}
      </header>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:gap-12">
        <AkaunNav name={user.name} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
