import type { ReactNode } from "react";

/**
 * Layout halaman info statik (Penghantaran, Pertukaran, Hubungi Kami).
 * Satu lajur prosa dengan irama editorial: eyebrow mono, tajuk serif,
 * jarak antara seksyen yang lapang.
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
    <div className="bg-paper">
      <div className="shell py-(--space-section)">
        <div className="mx-auto max-w-[65ch]">
          <p className="meta-label text-cocoa">{eyebrow}</p>
          <h1 className="mt-5 text-h1 text-ink">{title}</h1>
          <p className="mt-6 text-body-lg text-cocoa">{intro}</p>

          <div className="mt-16 space-y-14 border-t border-line pt-14 md:mt-20 md:space-y-16 md:pt-16">
            {sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-h3 text-ink">{section.heading}</h2>
                <div className="mt-4 space-y-4 text-body text-cocoa">{section.body}</div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
