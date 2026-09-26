import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://maisarabutik.vercel.app");

/**
 * robots.txt: benarkan crawler ke katalog dan kandungan editorial; halang
 * kawasan transaksi, akaun, admin dan laluan API.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/akaun",
          "/cart",
          "/checkout",
          "/pembayaran",
          "/order",
          "/log-masuk",
          "/daftar",
          "/lupa-kata-laluan",
          "/set-semula-kata-laluan",
          "/api/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
