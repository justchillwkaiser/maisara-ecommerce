import type { Metadata } from "next";
import { Clock, Envelope, MapPin } from "@phosphor-icons/react/dist/ssr";

import { ContactForm } from "@/components/shared/contact-form";
import { CONTACT_TOPICS, PRIMARY_CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Hubungi Kami | Maisara",
  description:
    "Hubungi Maisara untuk pertanyaan tentang saiz dan bahan, pesanan, kerjasama atau borong. Kami balas dalam 1-2 hari bekerja.",
};

/**
 * Halaman Hubungi Kami (spesifikasi 18). Empat topik diambil daripada
 * `CONTACT_TOPICS` dan memaparkan alamat sebenar setiap satunya; tiada alamat
 * direka di dalam komponen. Borang menghantar ke `/api/contact` dan hanya
 * melaporkan kejayaan apabila pelayan benar-benar menghantar mesej.
 */
export default function HubungiKamiPage() {
  return (
    <div className="pb-(--space-section-lg)">
      <div className="shell pt-(--space-section-lg)">
        <p className="meta-label text-cocoa">Hubungi Kami</p>
        <h1 className="mt-6 font-display text-display-l text-ink">
          LET&apos;S TALK.
        </h1>
        <p className="mt-8 max-w-[54ch] text-body-lg text-cocoa">
          Ada soalan tentang saiz, pesanan atau kerjasama? Pilih topik yang
          sesuai supaya mesej anda terus sampai kepada orang yang betul. Kami
          membalas dalam 1-2 hari bekerja.
        </p>

        <div className="mt-(--space-section) grid-12 gap-y-16">
          <div className="col-span-12 lg:col-span-6">
            <h2 className="meta-label text-cocoa">Hantar mesej</h2>
            <ContactForm
              topics={CONTACT_TOPICS}
              contactEmail={PRIMARY_CONTACT_EMAIL}
            />
          </div>

          <div className="col-span-12 lg:col-span-5 lg:col-start-8">
            <h2 className="meta-label text-cocoa">Topik dan alamat</h2>
            <dl className="mt-8 border-t border-line">
              {CONTACT_TOPICS.map((topic) => (
                <div key={topic.id} className="border-b border-line py-6">
                  <dt className="font-display text-h3 text-ink">
                    {topic.label}
                  </dt>
                  <dd className="mt-2 text-body-sm text-cocoa">
                    {topic.detail}
                  </dd>
                  <dd className="mt-3">
                    <a
                      href={`mailto:${topic.email}`}
                      className="meta-label inline-flex min-h-11 items-center gap-2 text-ink underline-offset-4 transition-colors duration-(--dur-fast) hover:text-cocoa hover:underline"
                    >
                      <Envelope size={14} weight="light" aria-hidden="true" />
                      {topic.email}
                    </a>
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-12 border-t border-line pt-8">
              <h2 className="meta-label text-cocoa">Butik</h2>
              <p className="mt-4 flex items-start gap-3 text-body text-cocoa">
                <MapPin
                  size={18}
                  weight="light"
                  aria-hidden="true"
                  className="mt-1 shrink-0 text-ink"
                />
                <span>
                  Maisara Studio
                  <br />
                  No. 21, Jalan Tan Hiok Nee,
                  <br />
                  80000 Johor Bahru, Johor
                </span>
              </p>
              <p className="mt-4 flex items-start gap-3 text-body text-cocoa">
                <Clock
                  size={18}
                  weight="light"
                  aria-hidden="true"
                  className="mt-1 shrink-0 text-ink"
                />
                <span>
                  Isnin hingga Sabtu, 10 pagi hingga 6 petang. Tutup pada hari
                  Ahad dan cuti umum.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}