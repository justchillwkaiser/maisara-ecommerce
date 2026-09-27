import { Reveal } from "@/components/shop/reveal";
import { WideImage } from "@/components/ui/image-frame";
import { EDITORIAL_IMAGES } from "@/lib/product-images";

/**
 * Empat perkara yang menentukan cara sesuatu kepingan terasa.
 *
 * Dipaparkan sebagai senarai bernombor editorial, bukan empat kad ikon:
 * prinsip reka bentuk menolak grid kad ikon yang besar, dan sistem
 * kepercayaan sepatutnya dibaca sebagai nota, bukan sebagai seksyen promosi.
 */
const CRAFT_STEPS = [
  {
    numeral: "01",
    label: "Fabrik",
    detail:
      "Kami bermula dengan berat kain. Linen dan cotton yang sederhana berat jatuh dengan tenang, tidak melekat pada badan dan bertambah selesa selepas dipakai.",
  },
  {
    numeral: "02",
    label: "Kemasan",
    detail:
      "Setiap tepi diselesaikan supaya tidak berbulu dan tidak menambah tebal. Jahitan dalam diletakkan supaya ia tidak kelihatan dari luar.",
  },
  {
    numeral: "03",
    label: "Potongan",
    detail:
      "Potongan diuji pada tubuh yang bergerak, bukan pada patung sahaja. Lengan mesti cukup longgar untuk mengangkat tangan tanpa menegangkan dada.",
  },
  {
    numeral: "04",
    label: "Rasa",
    detail:
      "Ujian terakhir mudah: adakah ia selesa dipakai sepanjang hari, duduk, memandu dan berjalan. Jika tidak, ia tidak masuk koleksi.",
  },
] as const;

export function Craft() {
  return (
    <section className="border-b border-line bg-bone">
      <div className="shell py-(--space-section)">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-(--gutter)">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="meta-label text-cocoa">05 · Cara kami membuat</p>
              <h2 className="mt-6 text-display-m text-ink">
                Empat perkara yang anda rasa, bukan lihat.
              </h2>
              <p className="mt-7 max-w-md text-body-lg text-cocoa">
                Sesuatu pakaian dinilai paling jujur apabila ia sudah dipakai
                beberapa kali. Empat perkara ini yang kami semak sebelum
                sesuatu kepingan diluluskan.
              </p>
            </Reveal>

            <Reveal delay={0.1} className="mt-10">
              <WideImage
                src={EDITORIAL_IMAGES.fold}
                alt="Kain Maisara terlipat di birai plaster di bawah cahaya tingkap"
                sizes="(min-width: 1024px) 40vw, 100vw"
              />
            </Reveal>
          </div>

          <dl className="lg:col-span-6 lg:col-start-7">
            {CRAFT_STEPS.map((step) => (
              <div
                key={step.numeral}
                className="grid grid-cols-1 gap-3 border-t border-line-strong py-7 last:border-b lg:grid-cols-[12rem_1fr] lg:gap-6"
              >
                <dt className="meta-label text-cocoa lg:pt-1.5">
                  {step.numeral} / {step.label}
                </dt>
                <dd className="text-body-lg text-cocoa">{step.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
