import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

import { JawiText, SongketTexture } from "@/components/shared/motif";
import { Button } from "@/components/ui/button";

import { Reveal } from "./reveal";

/**
 * Kisah Maisara (DESIGN.md 8, homepage section 5): full-width editorial,
 * imej lifestyle 4:3 + Jawi + kisah serif + CTA sekunder ke /kisah-kami.
 * Songket texture halus pada section.
 */
export function BrandStory() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <SongketTexture className="absolute inset-0" />

      <div className="relative mx-auto grid w-full max-w-[1400px] grid-cols-1 items-center gap-12 px-4 md:px-8 lg:grid-cols-2 lg:gap-16">
        {/* Imej lifestyle */}
        <Reveal duration={0.4}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-[0_2px_4px_rgba(42,38,34,0.06),0_16px_48px_rgba(42,38,34,0.10)]">
            <Image
              src="https://picsum.photos/seed/maisara-kisah/900/675"
              alt="Suasana butik Maisara"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </Reveal>

        {/* Teks kisah */}
        <div>
          <Reveal>
            <JawiText className="mb-4 block text-2xl text-gold-deep" />
            <h2 className="font-serif text-3xl font-medium tracking-tight text-ink md:text-5xl">
              Kisah Maisara
            </h2>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="mt-5 max-w-[46ch] text-base leading-relaxed text-ink-soft">
              Bermula dari sebuah mesin jahit di Johor, Maisara membawa warisan
              tenun dan batik Melayu ke dalam fesyen harian yang selesa dan
              bermutu. Setiap helaian dipilih, setiap jahitan dijaga.
            </p>
          </Reveal>

          <Reveal delay={0.16}>
            <Button asChild variant="secondary" size="lg" className="mt-8">
              <Link href="/kisah-kami">
                Kenali Maisara
                <span data-icon="inline-end">
                  <ArrowRight size={16} />
                </span>
              </Link>
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
