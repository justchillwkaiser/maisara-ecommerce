import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

import { JournalCard } from "@/components/journal/journal-card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  FramedImage,
  ImageFrame,
  ImagePlaceholder,
} from "@/components/ui/image-frame";
import { formatDate } from "@/lib/format";
import {
  JOURNAL_ENTRIES,
  getJournalEntry,
  type JournalEntry,
} from "@/lib/journal";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://maisarabutik.vercel.app");

interface JournalEntryPageProps {
  params: Promise<{ slug: string }>;
}

/** Semua entri dijana semasa build: setiap slug ialah halaman sebenar. */
export function generateStaticParams() {
  return JOURNAL_ENTRIES.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: JournalEntryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getJournalEntry(slug);

  if (!entry) {
    return {
      title: "Entri tidak dijumpai | Maisara",
      description: "Entri jurnal yang diminta tidak tersedia.",
    };
  }

  const url = `${siteUrl}/journal/${entry.slug}`;

  return {
    title: `${entry.title} | Journal Maisara`,
    description: entry.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: entry.title,
      description: entry.excerpt,
      url,
      siteName: "MAISARA",
      locale: "ms_MY",
      publishedTime: entry.publishedAt,
      images: entry.image
        ? [{ url: `${siteUrl}${entry.image}`, alt: entry.title }]
        : undefined,
    },
  };
}

/**
 * Halaman entri jurnal. Entri berkaitan diambil daripada kategori yang sama
 * dahulu, kemudian diisi dengan entri terbaru supaya seksyen ini tidak pernah
 * kosong walaupun sesuatu kategori hanya mempunyai satu entri.
 */
function relatedEntries(entry: JournalEntry): JournalEntry[] {
  const sameCategory = JOURNAL_ENTRIES.filter(
    (candidate) =>
      candidate.slug !== entry.slug && candidate.category === entry.category,
  );
  const rest = JOURNAL_ENTRIES.filter(
    (candidate) =>
      candidate.slug !== entry.slug && candidate.category !== entry.category,
  );

  return [...sameCategory, ...rest].slice(0, 3);
}

export default async function JournalEntryPage({
  params,
}: JournalEntryPageProps) {
  const { slug } = await params;
  const entry = getJournalEntry(slug);

  if (!entry) {
    notFound();
  }

  const related = relatedEntries(entry);
  const absoluteUrl = `${siteUrl}/journal/${entry.slug}`;

  /**
   * Structured data (spesifikasi 28). Setiap medan datang daripada entri
   * sebenar; tiada pengarang rekaan, tiada penilaian, tiada tarikh ubah suai
   * yang tidak diketahui.
   */
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: entry.title,
    description: entry.excerpt,
    datePublished: entry.publishedAt,
    articleSection: entry.category,
    url: absoluteUrl,
    mainEntityOfPage: absoluteUrl,
    ...(entry.image ? { image: [`${siteUrl}${entry.image}`] } : {}),
    publisher: {
      "@type": "Organization",
      name: "MAISARA",
      url: siteUrl,
    },
  };

  return (
    <div className="pb-(--space-section-lg)">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <article>
        <div className="shell pt-(--space-section)">
          <Breadcrumb
            items={[
              { label: "Journal", href: "/journal" },
              { label: entry.title },
            ]}
          />

          <header className="mt-10 max-w-[52ch]">
            <p className="meta-label flex flex-wrap items-center gap-x-3 text-cocoa">
              <span>{entry.category}</span>
              <span aria-hidden="true">/</span>
              <span>{entry.readingMinutes} minit baca</span>
              <span aria-hidden="true">/</span>
              <time dateTime={entry.publishedAt}>
                {formatDate(entry.publishedAt)}
              </time>
            </p>
            <h1 className="mt-6 font-display text-display-l text-ink">
              {entry.title}
            </h1>
            <p className="mt-6 text-body-lg text-cocoa">{entry.excerpt}</p>
          </header>
        </div>

        {/* Hero penuh: `bleed` hanya sah di dalam `shell`, kerana ia menolak
            margin mengikut gutter shell. */}
        <div className="shell">
          <div className="mt-(--space-section) bleed">
            {entry.image ? (
              <FramedImage
                src={entry.image}
                alt={`Ilustrasi editorial untuk ${entry.title}`}
                ratio="3 / 2"
                rounded="none"
                preload
                sizes="100vw"
              />
            ) : (
              <ImageFrame ratio="3 / 2" rounded="none">
                <ImagePlaceholder />
              </ImageFrame>
            )}
          </div>
        </div>

        <div className="shell">
          <div className="mx-auto mt-(--space-section) max-w-[65ch]">
            {entry.body.map((paragraph, index) => (
              <p
                key={paragraph}
                className={
                  index === 0
                    ? "text-body-lg text-ink"
                    : "mt-6 text-body-lg text-cocoa"
                }
              >
                {paragraph}
              </p>
            ))}

            <div className="mt-14 flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="meta-label text-cocoa">
                {entry.category} / {entry.readingMinutes} minit baca
              </p>
              <Link
                href="/koleksi"
                className="meta-label inline-flex min-h-11 items-center gap-2 text-ink transition-colors duration-(--dur-fast) hover:text-cocoa"
              >
                Lihat koleksi
                <ArrowRight size={14} weight="light" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </article>

      {related.length > 0 ? (
        <section className="shell mt-(--space-section)">
          <h2 className="meta-label text-cocoa">Entri berkaitan</h2>
          <div className="mt-10 grid gap-x-(--gutter) gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((candidate) => (
              <JournalCard key={candidate.slug} entry={candidate} as="h3" />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}