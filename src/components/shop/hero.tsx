import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

import { BatikPattern } from "@/components/shared/motif";
import { Button } from "@/components/ui/button";

import { Reveal } from "./reveal";

/**
 * Hero Editorial Split (DESIGN.md 8, homepage section 1):
 * kiri teks (eyebrow, headline serif, subtext <= 20 patah perkataan, 1 CTA),
 * kanan imej editorial portrait dengan frame gold offset.
 * Latar: batik pattern 4%. Reveal: fade-up, CTA cepat 300ms.
 */
export function Hero() {
  return (
    <section className="relative flex min-h-[100dvh] items-center overflow-hidden pt-24 pb-16">
      <BatikPattern opacity={0.04} className="absolute inset-0" />

      <div className="relative mx-auto grid w-full max-w-[1400px] grid-cols-1 items-center gap-14 px-4 md:px-8 lg:grid-cols-2 lg:gap-16">
        {/* Kiri: teks */}
        <div>
          <Reveal>
            <p className="mb-6 text-[11px] font-medium tracking-[0.18em] text-gold-deep uppercase">
              Koleksi Baharu
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="font-serif text-5xl leading-[1.05] font-medium tracking-tight text-ink md:text-7xl">
              Warisan untuk{" "}
              {/* Italic descender clearance (DESIGN.md 4): leading lebih longgar + pb */}
              <em className="inline-block pb-1 italic leading-[1.1]">fesyen harian</em>
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-6 max-w-[44ch] text-base leading-relaxed text-ink-soft md:text-lg">
              Tudung, baju kurung dan pakaian modest yang dijahit dengan teliti,
              untuk wanita Melayu yang menghargai kehalusan.
            </p>
          </Reveal>

          <Reveal delay={0.24} duration={0.3}>
            <Button asChild size="lg" className="mt-9">
              <Link href="/koleksi">
                Lihat Koleksi
                {/* Arrow dalam circle (DESIGN.md 7.2, icon-in-button) */}
                <span
                  data-icon="inline-end"
                  className="flex size-8 items-center justify-center rounded-full bg-card/25 transition-transform duration-300 group-hover/button:translate-x-0.5"
                >
                  <ArrowRight size={14} />
                </span>
              </Link>
            </Button>
          </Reveal>
        </div>

        {/* Kanan: imej editorial + frame gold offset */}
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute inset-0 translate-x-4 translate-y-4 rounded-2xl border border-gold/35"
          />
          <Reveal delay={0.2} duration={0.4}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-[0_24px_64px_rgba(42,38,34,0.18)]">
              <Image
                src="https://picsum.photos/seed/maisara-hero/800/1000"
                alt="Model berhijab dalam cahaya hangat"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
