import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

import { Button } from "@/components/ui/button";
import { JawiText, SongketTexture } from "@/components/shared/motif";
import { Reveal } from "@/components/shop/reveal";

export const metadata: Metadata = {
  title: "Kisah Kami | Maisara",
  description:
    "Kisah Maisara: bermula dari sebuah mesin jahit di Johor, membawa warisan tenun dan batik Melayu ke dalam fesyen harian yang selesa dan bermutu.",
};

/**
 * Halaman editorial Kisah Kami (DESIGN.md 5.3 - Jawi pada halaman ini,
 * DESIGN.md 8 - gaya editorial). Layout: hero tajuk + Jawi, imej lifestyle
 * 4:3, perenggan kisah, CTA ke koleksi. Songket halus pada latar.
 */
export default function KisahKamiPage() {
  return (
    <main className="relative overflow-hidden">
      <SongketTexture className="absolute inset-0" />

      <div className="relative mx-auto w-full max-w-[1400px] px-4 py-20 md:px-8 md:py-28">
        {/* Tajuk */}
        <Reveal>
          <div className="text-center">
            <JawiText className="block text-3xl text-gold-deep" />
            <p className="mt-4 text-xs tracking-wide text-ink-soft uppercase">
              Kisah Kami
            </p>
            <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight text-ink md:text-6xl">
              Kisah Maisara
            </h1>
            <p className="mx-auto mt-4 max-w-[52ch] text-base leading-relaxed text-ink-soft">
              Warisan untuk fesyen harian. Setiap helaian dipilih, setiap
              jahitan dijaga.
            </p>
          </div>
        </Reveal>

        {/* Imej utama */}
        <Reveal delay={0.1}>
          <div className="relative mx-auto mt-14 aspect-[4/3] max-w-4xl overflow-hidden rounded-2xl shadow-[0_2px_4px_rgba(42,38,34,0.06),0_16px_48px_rgba(42,38,34,0.10)]">
            <Image
              src="https://picsum.photos/seed/maisara-kisah/1200/900"
              alt="Butik Maisara"
              fill
              sizes="(min-width: 1024px) 896px, 100vw"
              className="object-cover"
            />
          </div>
        </Reveal>

        {/* Kisah */}
        <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-10 lg:grid-cols-[1fr_1.4fr]">
          <Reveal delay={0.05}>
            <h2 className="font-serif text-2xl font-medium tracking-tight text-ink md:text-3xl">
              Bermula dari sebuah mesin jahit
            </h2>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="space-y-5 text-base leading-relaxed text-ink-soft">
              <p>
                Maisara lahir di Johor, dari sebuah mesin jahit dan rasa cinta
                pada kain. Apa yang bermula sebagai jahitan untuk keluarga
                sendiri membesar menjadi butik yang membawa warisan tenun dan
                batik Melayu ke dalam fesyen harian.
              </p>
              <p>
                Kami percaya pakaian yang selesa dan bermutu bukan pilihan,
                tetapi hak. Sebab itu setiap helaian dipilih dengan teliti:
                daripada benang, jahitan, hingga potongan yang sesuai dengan
                cuaca dan cara hidup di Malaysia.
              </p>
              <p>
                Setiap helaian dipilih, setiap jahitan dijaga. Itu janji
                Maisara kepada anda.
              </p>
            </div>
          </Reveal>
        </div>

        {/* CTA */}
        <Reveal delay={0.15}>
          <div className="mt-16 text-center">
            <Button asChild variant="secondary" size="lg">
              <Link href="/koleksi">
                Terokai Koleksi
                <span data-icon="inline-end">
                  <ArrowRight size={16} />
                </span>
              </Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
