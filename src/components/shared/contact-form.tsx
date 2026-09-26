"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle, PaperPlaneTilt } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Bentuk medan diselaraskan dengan `@/components/ui/input`: 44px tinggi,
 * radius 2px, fokus 2px. Textarea dan select tiada komponen kongsi, jadi
 * kelasnya disalin di sini supaya ketiga-tiga medan kelihatan sama.
 */
const FIELD_CLASS = "mt-3 h-11 rounded-xs";
const BOX_CLASS =
  "mt-3 w-full rounded-xs border border-line bg-paper-lift px-3 py-3 text-base text-ink transition-colors outline-none placeholder:text-cocoa/70 focus-visible:border-ink focus-visible:ring-3 focus-visible:ring-ink/25 aria-invalid:border-danger aria-invalid:ring-3 aria-invalid:ring-danger/20";

interface ContactTopic {
  id: string;
  label: string;
  detail: string;
}

type FieldName = "name" | "email" | "topic" | "message";
type FieldValues = Record<FieldName, string>;
type FieldErrors = Partial<Record<FieldName, string>>;

/** Validasi klien: sama syarat seperti schema Zod di pelayan. */
function validate(values: FieldValues): FieldErrors {
  const errors: FieldErrors = {};

  if (values.name.trim().length < 2) {
    errors.name = "Nama sekurang-kurangnya 2 aksara.";
  } else if (values.name.trim().length > 80) {
    errors.name = "Nama maksimum 80 aksara.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Sila masukkan alamat e-mel yang sah.";
  } else if (values.email.trim().length > 160) {
    errors.email = "E-mel maksimum 160 aksara.";
  }
  if (values.topic.length === 0) {
    errors.topic = "Sila pilih topik pertanyaan.";
  }
  if (values.message.trim().length < 10) {
    errors.message = "Mesej sekurang-kurangnya 10 aksara.";
  } else if (values.message.trim().length > 2000) {
    errors.message = "Mesej maksimum 2000 aksara.";
  }

  return errors;
}

/**
 * Borang Hubungi Kami (spesifikasi 18).
 *
 * Aliran kejayaan hanya berlaku apabila pelayan benar-benar menghantar mesej.
 * Jawapan bukan kejayaan (contohnya apabila tiada provider e-mel dikonfigurasi)
 * dipaparkan sebagai ralat bersama alamat e-mel sebenar, jadi pelanggan tidak
 * pernah diberitahu sesuatu yang tidak berlaku.
 */
export function ContactForm({
  topics,
  contactEmail,
}: {
  topics: readonly ContactTopic[];
  contactEmail: string;
}) {
  const [values, setValues] = useState<FieldValues>({
    name: "",
    email: "",
    topic: "",
    message: "",
  });
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedTopic = topics.find((topic) => topic.id === values.topic);

  function update(field: FieldName, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setStatus("error");
      setFeedback("Sila betulkan medan yang ditanda sebelum menghantar.");
      return;
    }

    setStatus("sending");
    setFeedback(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          topic: values.topic,
          message: values.message.trim(),
          company: honeypot,
        }),
      });
      const result = (await response.json().catch(() => null)) as {
        ok?: boolean;
        message?: string;
      } | null;

      if (response.ok && result?.ok) {
        setStatus("sent");
        setFeedback("Mesej anda telah dihantar. Kami akan balas dalam 1-2 hari bekerja.");
        setValues({ name: "", email: "", topic: "", message: "" });
        return;
      }

      setStatus("error");
      setFeedback(
        result?.message ??
          "Kami tidak dapat menghantar mesej anda sekarang. Sila cuba sebentar lagi.",
      );
    } catch {
      setStatus("error");
      setFeedback("Masalah sambungan. Sila cuba sebentar lagi.");
    }
  }

  return (
    <div>
      {/* Ruang hidup sentiasa wujud supaya mesej diumumkan tanpa mengalih susun atur. */}
      <div className="min-h-6">
        <p role="status" aria-live="polite" className="text-body-sm text-ink">
          {status === "sent" ? feedback : ""}
        </p>
        {status === "error" && feedback ? (
          <p role="alert" className="text-body-sm text-oxblood">
            {feedback}
          </p>
        ) : null}
      </div>

      {status === "sent" ? (
        <div className="mt-6 border border-line bg-paper-lift p-8">
          <CheckCircle
            size={22}
            weight="light"
            aria-hidden="true"
            className="text-olive"
          />
          <p className="mt-4 max-w-[42ch] font-display text-h3 text-ink">
            Terima kasih. Mesej anda sudah sampai kepada kami.
          </p>
          <p className="mt-4 max-w-[52ch] text-body text-cocoa">
            Kami membaca setiap mesej mengikut urutan diterima dan membalas
            dalam 1-2 hari bekerja. Jika perkara itu mendesak, e-mel terus ke{" "}
            <a
              href={`mailto:${contactEmail}`}
              className="text-ink underline underline-offset-4"
            >
              {contactEmail}
            </a>
            .
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-6"
            onClick={() => {
              setStatus("idle");
              setFeedback(null);
            }}
          >
            Hantar mesej lain
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="mt-6" aria-busy={status === "sending"}>
          <div className="divide-y divide-line border-y border-line">
            <div className="py-5">
              <label htmlFor="contact-name" className="meta-label block text-cocoa">
                Nama
              </label>
              <Input
                id="contact-name"
                name="name"
                type="text"
                maxLength={80}
                autoComplete="name"
                value={values.name}
                onChange={(event) => update("name", event.target.value)}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "contact-name-error" : undefined}
                className={FIELD_CLASS}
              />
              {errors.name ? (
                <p id="contact-name-error" className="mt-2 text-body-sm text-oxblood">
                  {errors.name}
                </p>
              ) : null}
            </div>

            <div className="py-5">
              <label htmlFor="contact-email" className="meta-label block text-cocoa">
                E-mel
              </label>
              <Input
                id="contact-email"
                name="email"
                type="email"
                maxLength={160}
                autoComplete="email"
                placeholder="nama@contoh.com"
                value={values.email}
                onChange={(event) => update("email", event.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "contact-email-error" : undefined}
                className={FIELD_CLASS}
              />
              {errors.email ? (
                <p id="contact-email-error" className="mt-2 text-body-sm text-oxblood">
                  {errors.email}
                </p>
              ) : null}
            </div>

            <div className="py-5">
              <label htmlFor="contact-topic" className="meta-label block text-cocoa">
                Topik
              </label>
              <select
                id="contact-topic"
                name="topic"
                value={values.topic}
                onChange={(event) => update("topic", event.target.value)}
                aria-invalid={Boolean(errors.topic)}
                aria-describedby={`contact-topic-detail${errors.topic ? " contact-topic-error" : ""}`}
                className={cn(BOX_CLASS, "h-11 cursor-pointer py-0")}
              >
                <option value="" disabled>
                  Pilih topik pertanyaan
                </option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.label}
                  </option>
                ))}
              </select>
              <p id="contact-topic-detail" className="mt-2 text-body-sm text-cocoa">
                {selectedTopic?.detail ??
                  "Pilih topik supaya mesej anda sampai ke petugas yang betul."}
              </p>
              {errors.topic ? (
                <p id="contact-topic-error" className="mt-2 text-body-sm text-oxblood">
                  {errors.topic}
                </p>
              ) : null}
            </div>

            <div className="py-5">
              <label htmlFor="contact-message" className="meta-label block text-cocoa">
                Mesej
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={6}
                maxLength={2000}
                value={values.message}
                onChange={(event) => update("message", event.target.value)}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? "contact-message-error" : undefined}
                placeholder="Nombor pesanan, saiz, atau butiran yang membantu kami menjawab."
                className={cn(BOX_CLASS, "min-h-33")}
              />
              {errors.message ? (
                <p id="contact-message-error" className="mt-2 text-body-sm text-oxblood">
                  {errors.message}
                </p>
              ) : null}
            </div>
          </div>

          {/* Honeypot: tidak kelihatan dan tidak boleh difokus, jadi hanya bot mengisinya. */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="contact-company">Syarikat</label>
            <input
              id="contact-company"
              name="company"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(event) => setHoneypot(event.target.value)}
            />
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-[42ch] text-body-sm text-cocoa">
              Kami balas dalam 1-2 hari bekerja. Mesej anda dihantar ke alamat
              sebenar mengikut topik yang dipilih.
            </p>
            <Button type="submit" size="lg" disabled={status === "sending"} aria-busy={status === "sending"}>
              {status === "sending" ? "Menghantar..." : "Hantar Mesej"}
              <PaperPlaneTilt size={16} weight="light" aria-hidden="true" />
            </Button>
          </div>

          {status === "error" ? (
            <p className="mt-4 text-body-sm text-cocoa">
              Anda juga boleh e-mel kami terus di{" "}
              <a
                href={`mailto:${contactEmail}`}
                className="text-ink underline underline-offset-4"
              >
                {contactEmail}
              </a>
              .
            </p>
          ) : null}
        </form>
      )}
    </div>
  );
}