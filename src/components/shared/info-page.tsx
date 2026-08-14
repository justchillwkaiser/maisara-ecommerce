import type { ReactNode } from "react";

import { SongketTexture } from "./motif";

/**
 * Layout halaman info statik (Penghantaran, Pertukaran, Hubungi Kami).
 * Tajuk serif + intro + section dengan heading. Songket halus pada latar,
 * konsisten dengan halaman editorial lain (DESIGN.md 8).
 * Zero em-dash dalam copy (AGENTS.md).
 */
export function InfoPage({
  eyebrow,
  title,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  sections: { heading: string; body: ReactNode }[];
}) {
  return (
    <main className="relative overflow-hidden">
      <SongketTexture className="absolute inset-0" />

      <div className="relative mx-auto w-full max-w-[1400px] px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs tracking-wide text-ink-soft uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight text-ink md:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-[52ch] text-base leading-relaxed text-ink-soft">
            {intro}
          </p>

          <div className="mt-12 space-y-10">
            {sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-serif text-2xl font-medium tracking-tight text-ink">
                  {section.heading}
                </h2>
                <div className="mt-3 space-y-3 text-base leading-relaxed text-ink-soft">
                  {section.body}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
