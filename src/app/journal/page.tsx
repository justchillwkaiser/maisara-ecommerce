import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

import { JournalCard } from "@/components/journal/journal-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";
import {
  JOURNAL_CATEGORIES,
  JOURNAL_ENTRIES,
  getJournalByCategory,
} from "@/lib/journal";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://maisarabutik.vercel.app");

export const metadata: Metadata = {
  title: "Journal | Maisara",
  description:
    "Catatan editorial MAISARA tentang fabrik, potongan, penjagaan dan cara memakai pakaian warisan setiap hari.",
  alternates: { canonical: `${siteUrl}/journal` },
};

interface JournalPageProps {
  searchParams: Promise<{ kategori?: string | string[] }>;
}

/**
 * Indeks jurnal (spesifikasi 20). Penapis kategori ialah pautan sebenar dengan
 * parameter `?kategori=`, jadi senarai boleh dikongsi dan diindeks tanpa
 * JavaScript. Nilai kategori yang tidak dikenali diabaikan, bukan dianggap
 * sebagai senarai kosong, supaya URL yang tersalah taip tetap berguna.
 */
export default async function JournalPage({ searchParams }: JournalPageProps) {
  const params = await searchParams;
  const requested =
    typeof params.kategori === "string" ? params.kategori.trim().toUpperCase() : "";
  const activeCategory = JOURNAL_CATEGORIES.find(
    (category) => category === requested,
  );
  const entries = activeCategory
    ? getJournalByCategory(activeCategory)
    : JOURNAL_ENTRIES;

  return (
    <div className="pb-(--space-section-lg)">
      <div className="shell pt-(--space-section)">
        <SectionHeading
          as="h1"
          size="display-l"
          eyebrow="Journal"
          title="MAISARA JOURNAL"
          description="Catatan tentang fabrik, potongan, penjagaan dan cara pakaian ini dipakai dari hari ke hari."
        />

        <nav aria-label="Tapis mengikut kategori" className="mt-12">
          <ul className="flex flex-wrap items-center gap-2">
            <li>
              <Link
                href="/journal"
                aria-current={activeCategory ? undefined : "page"}
                className={cn(
                  "meta-label inline-flex min-h-11 items-center rounded-xs border px-4",
                  "transition-colors duration-(--dur-fast)",
                  activeCategory
                    ? "border-line text-cocoa hover:border-ink hover:text-ink"
                    : "border-ink bg-ink text-paper",
                )}
              >
                Semua
              </Link>
            </li>
            {JOURNAL_CATEGORIES.map((category) => {
              const isActive = activeCategory === category;

              return (
                <li key={category}>
                  <Link
                    href={`/journal?kategori=${category}`}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "meta-label inline-flex min-h-11 items-center rounded-xs border px-4",
                      "transition-colors duration-(--dur-fast)",
                      isActive
                        ? "border-ink bg-ink text-paper"
                        : "border-line text-cocoa hover:border-ink hover:text-ink",
                    )}
                  >
                    {category}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <p aria-live="polite" className="meta-label mt-8 text-cocoa">
          {entries.length} entri
          {activeCategory ? ` dalam ${activeCategory}` : ""}
        </p>

        <div className="mt-10 grid gap-x-(--gutter) gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry, index) => (
            <JournalCard key={entry.slug} entry={entry} preload={index === 0} />
          ))}
        </div>

        <div className="mt-24 flex flex-col gap-4 border-t border-line pt-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[46ch] font-display text-h3 text-ink">
            Kisah jenama bermula dari sebuah mesin jahit.
          </p>
          <Link
            href="/kisah-kami"
            className="meta-label inline-flex min-h-11 items-center gap-2 text-ink transition-colors duration-(--dur-fast) hover:text-cocoa"
          >
            Baca Kisah Kami
            <ArrowRight size={14} weight="light" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}