import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  DM_Mono,
  Instrument_Serif,
} from "next/font/google";
import "./globals.css";

import { Footer } from "@/components/shared/footer";
import { Header } from "@/components/shared/header";
import { Providers } from "@/components/shared/providers";
import { SITE } from "@/lib/site";

/**
 * MAISARA typography (three roles, no substitutes):
 * - Display  : Instrument Serif  — headlines and editorial voice
 * - UI / body: Bricolage Grotesque — navigation, copy, controls
 * - Metadata : DM Mono            — labels, prices, spec tables, eyebrows
 * All three are self-hosted by next/font, so there is no render-blocking
 * request to a font CDN and no layout shift on load.
 */
const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const sans = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-bricolage",
  display: "swap",
});

/**
 * Hanya berat yang benar-benar dipakai dimuatkan (`font-light`/`font-semibold`
 * tidak wujud dalam kod). DM Mono ialah font statik, jadi berat 300 dan 500
 * hanya menambah fail yang di-preload pada setiap halaman tanpa dipakai.
 */
const mono = DM_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-dm-mono",
  display: "swap",
});

/**
 * Metadata global (SEO): metadataBase penting supaya OG image dan
 * canonical URL resolve dengan betul. Guna VERCEL_PROJECT_PRODUCTION_URL
 * bila deploy di Vercel; fallback ke maisarabutik.vercel.app.
 * Tukar bila domain custom dipasang.
 */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://maisarabutik.vercel.app");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MAISARA | Fesyen Modest Malaysia",
    template: "%s | MAISARA",
  },
  description: SITE.description,
  applicationName: "MAISARA",
  keywords: [
    "Maisara",
    "fesyen modest",
    "tudung",
    "baju kurung",
    "dress",
    "abaya",
    "aksesori",
    "fesyen wanita",
    "Malaysia",
  ],
  openGraph: {
    type: "website",
    locale: "ms_MY",
    url: "/",
    siteName: "MAISARA",
    title: "MAISARA | Fesyen Modest Malaysia",
    description: SITE.description,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "MAISARA — fesyen modest Malaysia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MAISARA | Fesyen Modest Malaysia",
    description: SITE.description,
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ms"
      data-scroll-behavior="smooth"
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <Header />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
