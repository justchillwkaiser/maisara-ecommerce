import type { NextConfig } from "next";

/**
 * Semua imej produk ialah aset tempatan dalam public/products (dan images[] dari
 * pangkalan data yang merujuk aset yang sama). Tiada host imej luaran dibenarkan
 * - picsum.photos telah dibuang bersama semua imej stok rawak.
 *
 * Format & kualiti diukur, bukan diagak (SSIM/PSNR lwn sumber pada lebar
 * sebenar yang dipaparkan):
 *   maisara-04 @828   webp75 92.6KB SSIM .9620  →  avif60 71.6KB SSIM .9711
 *   maisara-03 @828   webp75 68.7KB SSIM .9539  →  avif55 52.1KB SSIM .9569
 *   lookbook   @1408  webp75 92.1KB SSIM .9389  →  avif60 90.6KB SSIM .9523
 *   signature  @1080  webp75 49.2KB SSIM .9668  →  avif60 44.7KB SSIM .9744
 * AVIF pada kualiti 60 memberi kesetiaan yang sama atau lebih baik daripada
 * webp75 sambil mengurangkan bytes; WebP 60 kekal sebagai sandaran untuk
 * pelayar tanpa AVIF (penurunan ~16-20% bytes, masih di atas ambang kelihatan).
 */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
    formats: ["image/avif", "image/webp"],
    qualities: [60],
  },
};

export default nextConfig;
