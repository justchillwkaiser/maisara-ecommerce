"use client";

import { useId, useState } from "react";

import { Button } from "@/components/ui/button";

type Status = "idle" | "submitting" | "success" | "error";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Langganan surat berita (spesifikasi 12).
 *
 * Borang ini tidak pernah melaporkan kejayaan yang tidak berlaku. Apabila
 * pelayan belum dikonfigurasi dengan penyedia e-mel, `POST /api/newsletter`
 * memulangkan `{ ok: false }` dengan mesej yang mengandungi alamat sebenar
 * untuk dihubungi, dan borang memaparkan mesej itu seadanya.
 */
export function Newsletter() {
  const emailId = useId();
  const statusId = useId();
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    if (!EMAIL_PATTERN.test(email.trim())) {
      setStatus("error");
      setFeedback("Sila masukkan alamat e-mel yang sah.");
      return;
    }

    setStatus("submitting");
    setFeedback("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), company }),
        cache: "no-store",
      });

      const body: unknown = await response.json().catch(() => null);
      const parsed = body as { ok?: boolean; message?: string } | null;

      if (response.ok && parsed?.ok === true) {
        setStatus("success");
        setFeedback("Terima kasih. Kami akan menghantar catatan seterusnya kepada anda.");
        setEmail("");
        return;
      }

      setStatus("error");
      setFeedback(
        parsed?.message ??
          "Kami tidak dapat mendaftarkan e-mel anda sekarang. Sila cuba sebentar lagi.",
      );
    } catch (caught) {
      console.error("[newsletter] permintaan gagal:", caught);
      setStatus("error");
      setFeedback(
        "Ralat rangkaian. Sila periksa sambungan anda dan cuba sebentar lagi.",
      );
    }
  }

  return (
    <section className="bg-ink text-paper">
      <div className="shell py-(--space-section)">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-(--gutter)">
          <div className="lg:col-span-5">
            <p className="meta-label text-brass">09 · Surat berita</p>
            <h2 className="mt-6 text-display-m text-paper">
              Catatan baharu, sekali sebulan.
            </h2>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <p className="max-w-md text-body-lg text-paper/75">
              Kami hantar apabila ada kepingan baharu atau catatan yang berguna.
              Tiada surat mingguan, dan anda boleh berhenti bila-bila masa.
            </p>

            <form onSubmit={handleSubmit} noValidate className="mt-8">
              <label htmlFor={emailId} className="meta-label block text-paper/75">
                Alamat e-mel
              </label>

              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <input
                  id={emailId}
                  type="email"
                  name="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (status !== "idle") {
                      setStatus("idle");
                      setFeedback("");
                    }
                  }}
                  autoComplete="email"
                  required
                  maxLength={160}
                  aria-invalid={status === "error"}
                  aria-describedby={feedback ? statusId : undefined}
                  placeholder="nama@contoh.com"
                  className="h-11 w-full rounded-xs border border-paper/25 bg-transparent px-4 text-body text-paper outline-none transition-colors duration-(--dur-fast) placeholder:text-paper/40 focus-visible:border-paper sm:max-w-xs"
                />

                <Button
                  type="submit"
                  size="lg"
                  disabled={status === "submitting"}
                  aria-busy={status === "submitting"}
                  className="border border-paper bg-paper text-ink hover:bg-transparent hover:text-paper"
                >
                  {status === "submitting" ? "Menghantar" : "Langgan"}
                </Button>
              </div>

              {/* Honeypot: tersembunyi daripada pengguna dan pembaca skrin. */}
              <div aria-hidden="true" className="sr-only">
                <label htmlFor={`${emailId}-company`}>Syarikat</label>
                <input
                  id={`${emailId}-company`}
                  type="text"
                  name="company"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <p
                id={statusId}
                role="status"
                aria-live="polite"
                className={
                  status === "error"
                    ? "mt-4 text-body-sm text-clay"
                    : "mt-4 text-body-sm text-paper/75"
                }
              >
                {feedback}
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
