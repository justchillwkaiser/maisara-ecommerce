"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";

import { ImageFrame, ImagePlaceholder } from "@/components/ui/image-frame";
import { PDP_MAIN_SIZES } from "@/lib/image-sizes";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  /** Nama produk untuk alt text imej utama. */
  alt: string;
}

/** Kapsyen indeks mono dua digit, cth. "01 / 04". */
function frameCaption(index: number, total: number): string {
  const position = String(index + 1).padStart(2, "0");
  return `${position} / ${String(total).padStart(2, "0")}`;
}

/**
 * Galeri PDP (spesifikasi 16).
 *
 * Imej disusun mengikut urutan konsep galeri: imej pertama ialah hero
 * (di-preload oleh komponen pelayan PDP melalui CriticalImagePreload), imej
 * seterusnya detail dan lifestyle. Bingkai utama sentiasa 4:5
 * dengan object-cover, jadi imej tidak pernah herot walau berapa banyak imej
 * dihantar. Thumbnail hanya muncul bila ada lebih daripada satu imej; produk
 * tanpa imej mendapat ImagePlaceholder, bukan blok warna.
 * Reduced motion -> imej bertukar tanpa crossfade.
 */
export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const total = images.length;

  if (total === 0) {
    return (
      <ImageFrame ratio="4 / 5" rounded="sm">
        <ImagePlaceholder label="Imej produk belum tersedia" />
      </ImageFrame>
    );
  }

  const safeIndex = Math.min(activeIndex, total - 1);
  const activeImage = images[safeIndex];
  const mainSizes = PDP_MAIN_SIZES;

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      {total > 1 ? (
        <ul
          aria-label="Imej produk"
          className="order-2 flex gap-3 overflow-x-auto pb-1 sm:order-1 sm:w-20 sm:shrink-0 sm:flex-col sm:overflow-x-visible sm:overflow-y-auto sm:pb-0"
        >
          {images.map((image, index) => (
            <li key={`${image}-${index}`} className="w-16 shrink-0 sm:w-full">
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Lihat imej ${index + 1} daripada ${total}`}
                aria-current={index === safeIndex ? "true" : undefined}
                className="block w-full"
              >
                <ImageFrame
                  ratio="4 / 5"
                  rounded="xs"
                  className={cn(
                    "border transition-colors duration-(--dur-fast)",
                    index === safeIndex
                      ? "border-ink"
                      : "border-line hover:border-ink/60",
                  )}
                >
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </ImageFrame>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="order-1 min-w-0 sm:order-2 sm:flex-1">
        <ImageFrame ratio="4 / 5" rounded="sm">
          {reduceMotion ? (
            <Image
              src={activeImage}
              alt={alt}
              fill
              sizes={mainSizes}

              className="object-cover"
            />
          ) : (
            <AnimatePresence initial={false}>
              <motion.div
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src={activeImage}
                  alt={alt}
                  fill
                  sizes={mainSizes}

                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>
          )}

          <p
            aria-live="polite"
            className="meta-label absolute bottom-0 left-0 bg-paper px-3 py-2 text-ink"
          >
            {frameCaption(safeIndex, total)}
          </p>
        </ImageFrame>
      </div>
    </div>
  );
}
