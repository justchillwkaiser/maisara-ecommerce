import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

import {
  FramedImage,
  ImageFrame,
  ImagePlaceholder,
} from "@/components/ui/image-frame";
import { formatDate } from "@/lib/format";
import type { JournalEntry } from "@/lib/journal";

/**
 * Kad entri jurnal (spesifikasi 20). Server component tulen: satu pautan ke
 * halaman entri, imej editorial 4:3, baris meta mono (kategori, masa baca,
 * tarikh) dan tajuk serif.
 *
 * `as` wujud kerana kad ini muncul pada dua aras tajuk yang berbeza: terus di
 * bawah h1 pada halaman indeks, dan di bawah tajuk seksyen pada halaman lain.
 * Hierarki tajuk tidak pernah dilangkau, jadi arasnya diberi oleh pemanggil.
 */
export function JournalCard({
  entry,
  as: Heading = "h2",
  preload = false,
  className,
}: {
  entry: JournalEntry;
  as?: "h2" | "h3";
  /** Pra-muat imej kad (kad pertama di atas lipatan). */
  preload?: boolean;
  className?: string;
}) {
  return (
    <article className={className}>
      <Link
        href={`/journal/${entry.slug}`}
        className="group block focus-visible:outline-none"
      >
        {entry.image ? (
          <FramedImage
            src={entry.image}
            alt={entry.title}
            ratio="4 / 3"
            rounded="sm"
            preload={preload}
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            className="transition-transform duration-(--dur-editorial) ease-out motion-safe:group-hover:scale-[1.02]"
          />
        ) : (
          <ImageFrame ratio="4 / 3" rounded="sm">
            <ImagePlaceholder />
          </ImageFrame>
        )}

        <p className="meta-label mt-6 flex flex-wrap items-center gap-x-3 text-cocoa">
          <span>{entry.category}</span>
          <span aria-hidden="true">/</span>
          <span>{entry.readingMinutes} minit baca</span>
          <span aria-hidden="true">/</span>
          <time dateTime={entry.publishedAt}>
            {formatDate(entry.publishedAt)}
          </time>
        </p>

        <Heading className="mt-3 font-display text-h3 text-ink transition-colors duration-(--dur-fast) group-hover:text-cocoa">
          {entry.title}
        </Heading>

        <p className="mt-3 max-w-[46ch] text-body-sm text-cocoa">
          {entry.excerpt}
        </p>

        <span className="meta-label mt-5 inline-flex items-center gap-2 text-ink">
          Baca entri
          <ArrowUpRight
            size={13}
            weight="light"
            aria-hidden="true"
            className="transition-transform duration-(--dur-base) ease-out motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
          />
        </span>
      </Link>
    </article>
  );
}