"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";

import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  /** Nama produk untuk alt text imej utama. */
  alt: string;
}

/**
 * Galeri PDP (DESIGN.md 8): thumbnail kiri (vertical desktop, horizontal
 * scroll mobile) + imej utama 4:5 rounded-xl. Crossfade halus opacity 300ms
 * (DESIGN.md 9); reduced motion -> imej bertukar tanpa animasi.
 */
export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  if (images.length === 0) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="aspect-[4/5] w-full rounded-xl bg-surface"
      />
    );
  }

  const activeImage = images[Math.min(activeIndex, images.length - 1)];

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      {/* Thumbnail: vertical desktop (kiri), horizontal scroll mobile */}
      <div
        className="order-2 flex gap-3 overflow-x-auto pb-1 sm:order-1 sm:w-20 sm:shrink-0 sm:flex-col sm:overflow-x-visible sm:overflow-y-auto sm:pb-0"
        aria-label="Pilih imej produk"
      >
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Lihat imej ${index + 1}`}
            aria-current={index === activeIndex}
            className={cn(
              "relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-lg border transition-colors sm:w-full",
              index === activeIndex
                ? "border-gold ring-1 ring-gold/40"
                : "border-line hover:border-gold/60",
            )}
          >
            <Image
              src={image}
              alt=""
              fill
              sizes="80px"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Imej utama dengan crossfade */}
      <div className="relative order-1 aspect-[4/5] w-full overflow-hidden rounded-xl bg-surface sm:order-2">
        {reduceMotion ? (
          <Image
            src={activeImage}
            alt={alt}
            fill
            priority
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="object-cover"
          />
        ) : (
          <AnimatePresence initial={false}>
            <motion.div
              key={activeImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <Image
                src={activeImage}
                alt={alt}
                fill
                priority
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
