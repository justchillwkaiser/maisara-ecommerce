import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

import { Footer } from "@/components/shared/footer";
import { Header } from "@/components/shared/header";
import { Providers } from "@/components/shared/providers";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-serif",
});

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
});

/**
 * Metadata global (SEO): metadataBase penting supaya OG image dan
 * canonical URL resolve dengan betul. Guna VERCEL_PROJECT_PRODUCTION_URL
 * bila deploy di Vercel; fallback ke maisara-beta.vercel.app.
 * Tukar bila domain custom dipasang (backlog P2.5).
 */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://maisara-beta.vercel.app");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Maisara | Butik Modest Fashion",
    template: "%s | Maisara",
  },
  description:
    "Butik modest fashion untuk wanita Malaysia. Sentuhan warisan untuk fesyen harian.",
  applicationName: "Maisara",
  keywords: [
    "Maisara",
    "modest fashion",
    "tudung",
    "baju kurung",
    "batik",
    "fesyen wanita",
    "Malaysia",
  ],
  openGraph: {
    type: "website",
    locale: "ms_MY",
    url: "/",
    siteName: "Maisara",
    title: "Maisara | Butik Modest Fashion",
    description:
      "Butik modest fashion untuk wanita Malaysia. Sentuhan warisan untuk fesyen harian.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Maisara - Butik Modest Fashion",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Maisara | Butik Modest Fashion",
    description:
      "Butik modest fashion untuk wanita Malaysia. Sentuhan warisan untuk fesyen harian.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ms"
      className={`${serif.variable} ${sans.variable} h-full antialiased`}
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
