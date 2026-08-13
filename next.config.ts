import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Semua imej demo (seed + fallback) datang dari picsum.photos.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;
