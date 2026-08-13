import { Reveal } from "./reveal";

/**
 * Testimoni editorial (DESIGN.md 8, homepage section 4): satu quote besar
 * serif italic (max 3 baris) + attribution kiri, 2 quote kecil samping kanan.
 */
export function Testimonials() {
  return (
    <section className="bg-surface py-24 md:py-32">
      <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 items-start gap-16 px-4 md:px-8 lg:grid-cols-[2fr,1fr]">
        {/* Quote utama */}
        <Reveal>
          <blockquote className="max-w-[24ch] font-serif text-3xl leading-[1.3] font-medium tracking-tight italic text-ink md:text-4xl">
            &ldquo;Kainnya selesa, jahitannya kemas. Maisara jadi pilihan
            pertama untuk semua majlis.&rdquo;
          </blockquote>
          <p className="mt-6 text-sm text-ink-soft">Nurul Aisyah, Kuala Lumpur</p>
        </Reveal>

        {/* Quote kecil samping */}
        <div className="flex flex-col gap-8">
          <Reveal delay={0.08}>
            <blockquote className="font-serif text-lg leading-snug italic text-ink">
              &ldquo;Tudung bawal paling lembut yang pernah saya pakai.&rdquo;
              <cite className="mt-2 block text-xs not-italic text-ink-soft">
                Aina Sofea, Shah Alam
              </cite>
            </blockquote>
          </Reveal>
          <Reveal delay={0.16}>
            <blockquote className="font-serif text-lg leading-snug italic text-ink">
              &ldquo;Penghantaran cepat, pembungkusan cantik.&rdquo;
              <cite className="mt-2 block text-xs not-italic text-ink-soft">
                Sarah Izzati, Johor Bahru
              </cite>
            </blockquote>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
