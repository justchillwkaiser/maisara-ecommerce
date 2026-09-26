import Link from "next/link";

import { JournalCard } from "@/components/journal/journal-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { JOURNAL_ENTRIES } from "@/lib/journal";

/**
 * Catatan journal (spesifikasi 12). Tiga entri terkini daripada sumber
 * kandungan editorial, setiap satu pautan ke artikel penuh.
 */
export function JournalTeaser() {
  const entries = JOURNAL_ENTRIES.slice(0, 3);
  if (entries.length === 0) return null;

  return (
    <section className="border-b border-line bg-bone">
      <div className="shell py-(--space-section)">
        <SectionHeading
          eyebrow="08 · Journal"
          title="Nota tentang bahan dan cara memakainya"
          description="Catatan pendek tentang fabrik, penjagaan dan kehidupan harian."
          size="display-m"
          action={
            <Link
              href="/journal"
              className="meta-label text-cocoa underline-offset-4 transition-colors duration-(--dur-fast) hover:text-ink hover:underline"
            >
              Semua catatan
            </Link>
          }
        />

        <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-(--gutter)">
          {entries.map((entry) => (
            <JournalCard key={entry.slug} entry={entry} />
          ))}
        </div>
      </div>
    </section>
  );
}
