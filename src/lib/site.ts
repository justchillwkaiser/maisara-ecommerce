/**
 * Konfigurasi laman MAISARA — satu tempat untuk nilai yang datang dari
 * persekitaran atau sumber sedia ada.
 *
 * Prinsip: JANGAN reka nilai jenama. Alamat e-mel sebenar datang dari
 * NEXT_PUBLIC_CONTACT_EMAIL (lalai: alamat yang sudah digunakan dalam
 * aplikasi). Pautan sosial hanya dipaparkan apabila dikonfigurasi, jadi
 * footer tidak pernah memaparkan akaun yang tidak wujud.
 */

export const SITE = {
  name: "MAISARA",
  tagline: "Contemporary modest pieces, rooted in Malaysian heritage.",
  closing: "Made to be worn. Made to stay.",
  description:
    "Butik modest fashion untuk wanita Malaysia. Siluet moden dengan tekstur yang terasa dekat.",
} as const;

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "salam@maisara.my";

/** Jenis pertanyaan di halaman Hubungi Kami. Semua pergi ke inbox sebenar. */
export const CONTACT_TOPICS = [
  {
    id: "customer-care",
    label: "Penjagaan Pelanggan",
    detail: "Saiz, bahan dan cara penjagaan",
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL_CARE ?? contactEmail,
  },
  {
    id: "order-support",
    label: "Bantuan Pesanan",
    detail: "Status penghantaran, pertukaran dan pemulangan",
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL_ORDER ?? contactEmail,
  },
  {
    id: "collaborations",
    label: "Kerjasama",
    detail: "Kandungan, acara dan jenama",
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL_COLLAB ?? contactEmail,
  },
  {
    id: "wholesale",
    label: "Borong",
    detail: "Pesanan pukal dan pengedar",
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL_WHOLESALE ?? contactEmail,
  },
] as const;

export type ContactTopicId = (typeof CONTACT_TOPICS)[number]["id"];

/** Alamat inbox utama — dipakai oleh borang hubungi dan halaman info. */
export const PRIMARY_CONTACT_EMAIL = contactEmail;

/**
 * Pautan sosial. Hanya dipaparkan bila dikonfigurasi melalui persekitaran;
 * tiada akaun rekaan dalam kod.
 */
export const SOCIAL_LINKS = [
  {
    id: "instagram",
    label: "Instagram",
    href: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "",
  },
  {
    id: "tiktok",
    label: "TikTok",
    href: process.env.NEXT_PUBLIC_TIKTOK_URL ?? "",
  },
].filter((link): link is { id: string; label: string; href: string } =>
  link.href.startsWith("http"),
);

/** Navigasi utama (spesifikasi 11). */
export const PRIMARY_NAV = [
  { label: "Koleksi", href: "/koleksi" },
  { label: "Cerita", href: "/kisah-kami" },
  { label: "Tentang", href: "/tentang" },
  { label: "Journal", href: "/journal" },
] as const;

/** Pautan bawah footer (spesifikasi 22). */
export const FOOTER_LINKS = {
  customerCare: [
    { label: "Penghantaran", href: "/penghantaran" },
    { label: "Pertukaran", href: "/pertukaran" },
    { label: "Soalan Lazim", href: "/soalan-lazim" },
    { label: "Hubungi Kami", href: "/hubungi-kami" },
  ],
} as const;
