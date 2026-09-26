import Link from "next/link";

import { getCategories } from "@/lib/categories";
import { FOOTER_LINKS, SITE, SOCIAL_LINKS } from "@/lib/site";

interface FooterColumn {
  /** Dipakai sebagai id untuk aria-labelledby. */
  id: string;
  title: string;
  links: { label: string; href: string }[];
}

const COMPANY_LINKS: FooterColumn["links"] = [
  { label: "Our Story", href: "/kisah-kami" },
  { label: "Journal", href: "/journal" },
  { label: "Contact", href: "/hubungi-kami" },
];

/**
 * Footer Maisara (spesifikasi 22): wordmark + tagline, kolum SHOP, pautan
 * utama, CUSTOMER CARE dan FOLLOW. Kolum FOLLOW dilangkau sepenuhnya apabila
 * SOCIAL_LINKS kosong supaya footer tidak pernah memaparkan pautan mati.
 */
export async function Footer() {
  const categories = await getCategories();
  const shopLinks: FooterColumn["links"] = [
    { label: "Semua Koleksi", href: "/koleksi" },
    ...categories.map((category) => ({
      label: category.name,
      href: `/koleksi/${category.slug}`,
    })),
  ];

  const columns: FooterColumn[] = [
    { id: "shop", title: "Shop", links: shopLinks },
    { id: "company", title: "Company", links: COMPANY_LINKS },
    { id: "customer-care", title: "Customer Care", links: [...FOOTER_LINKS.customerCare] },
    ...(SOCIAL_LINKS.length > 0
      ? [
          {
            id: "follow",
            title: "Follow",
            links: SOCIAL_LINKS.map(({ label, href }) => ({ label, href })),
          },
        ]
      : []),
  ];

  return (
    <footer className="border-t border-line bg-bone">
      <div className="shell pt-(--space-section) pb-16 md:pb-20">
        <div className="grid-12 gap-y-14">
          {/* Wordmark + tagline */}
          <div className="col-span-12 lg:col-span-4">
            <p className="font-display text-2xl leading-none tracking-[0.16em] text-ink">
              {SITE.name}
            </p>
            <p className="mt-5 max-w-[34ch] text-body-sm text-cocoa">{SITE.tagline}</p>
          </div>

          {/* Kolum pautan */}
          <div className="col-span-12 grid grid-cols-2 gap-x-(--gutter) gap-y-10 sm:grid-cols-3 lg:col-span-8 lg:grid-cols-4">
            {columns.map((column) => (
              <nav key={column.id} aria-labelledby={`footer-${column.id}`}>
                <h2 id={`footer-${column.id}`} className="meta-label text-cocoa">
                  {column.title}
                </h2>
                <ul className="mt-4">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="flex min-h-11 items-center text-body-sm text-ink/75 transition-colors duration-(--dur-fast) hover:text-ink"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-line">
        <div className="shell flex flex-col gap-3 py-6 md:flex-row md:items-center md:justify-between">
          <p className="meta-label text-cocoa">© {SITE.name}</p>
          <p className="text-body-sm text-cocoa">{SITE.closing}</p>
        </div>
      </div>
    </footer>
  );
}
