import Link from "next/link";

import { getCategories } from "@/lib/categories";

import { BatikPattern, JawiText, SongketTexture } from "./motif";

interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

const HELP_LINKS: FooterColumn["links"] = [
  { label: "Penghantaran", href: "#" },
  { label: "Pertukaran", href: "#" },
  { label: "Hubungi Kami", href: "#" },
];

const COMPANY_LINKS: FooterColumn["links"] = [
  { label: "Kisah Kami", href: "/kisah-kami" },
  { label: "Blog", href: "#" },
  { label: "Kerjaya", href: "#" },
];

/**
 * Footer Maisara (DESIGN.md 8, footer): bg-surface-alt + batik 5% + songket,
 * wordmark serif + tagline, 3 kolum links, bottom bar dengan Jawi.
 */
export async function Footer() {
  const categories = await getCategories();
  const collectionLinks: FooterColumn["links"] = [
    { label: "Semua Koleksi", href: "/koleksi" },
    ...categories.map((category) => ({
      label: category.name,
      href: `/koleksi/${category.slug}`,
    })),
  ];

  const columns: FooterColumn[] = [
    { title: "Koleksi", links: collectionLinks },
    { title: "Bantuan", links: HELP_LINKS },
    { title: "Syarikat", links: COMPANY_LINKS },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-line bg-surface-alt">
      {/* Motif warisan (DESIGN.md 5.4: footer = batik 5% + songket) */}
      <BatikPattern opacity={0.05} className="absolute inset-0" />
      <SongketTexture className="absolute inset-0" />

      <div className="relative mx-auto w-full max-w-[1400px] px-4 py-20 md:px-8">
        {/* Wordmark + tagline */}
        <div className="mb-14">
          <p className="font-serif text-2xl font-semibold tracking-[0.02em] text-ink">
            Maisara
          </p>
          <p className="mt-2 text-sm text-ink-soft">Warisan untuk fesyen harian.</p>
        </div>

        {/* Kolum links */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-ink-soft">
                {column.title}
              </h3>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="block py-1 text-sm text-ink-soft transition-colors hover:text-gold-deep"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-line">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center justify-between gap-4 px-4 py-6 md:flex-row md:px-8">
          <p className="text-sm text-ink-soft">
            © 2026 Maisara. Semua hak terpelihara.
          </p>
          <JawiText className="text-lg text-gold-deep" />
        </div>
      </div>
    </footer>
  );
}
