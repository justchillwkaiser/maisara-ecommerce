"use client";

import { Star } from "@phosphor-icons/react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

interface ReviewFormProps {
  productId: string;
}

/**
 * Form ulasan (UX.md Flow D, DESIGN.md 7.5).
 * Rating 1-5 + komen (10-1000 aksara). Hanya untuk user berdaftar;
 * server enforce syarat order COMPLETED (403 ORDER_NOT_COMPLETED).
 */
export function ReviewForm({ productId }: ReviewFormProps) {
  const { data: session } = authClient.useSession();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  if (!session) {
    return (
      <div className="rounded-2xl border border-line bg-card p-8 text-center">
        <p className="font-serif text-xl font-semibold text-ink">Tulis ulasan anda</p>
        <p className="mt-2 text-sm text-ink-soft">
          Log masuk untuk berkongsi pengalaman anda dengan produk ini.
        </p>
        <Link
          href={`/log-masuk?next=${encodeURIComponent(pathname)}`}
          className="mt-5 inline-flex h-11 items-center rounded-full bg-gold px-7 text-sm font-medium text-card transition-colors hover:bg-gold-deep"
        >
          Log Masuk
        </Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Pilih rating dahulu.");
      return;
    }
    if (comment.trim().length < 10) {
      toast.error("Ulasan sekurang-kurangnya 10 aksara.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment: comment.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error?.message ?? "Gagal menghantar ulasan.");
        return;
      }
      toast.success("Ulasan dihantar. Menunggu kelulusan.");
      setRating(0);
      setComment("");
      router.refresh();
    } catch {
      toast.error("Ralat rangkaian. Sila cuba sebentar lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  const activeRating = hoverRating || rating;

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-line bg-card p-8"
    >
      <p className="font-serif text-xl font-semibold text-ink">Tulis ulasan anda</p>

      <div className="mt-4 flex items-center gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHoverRating(n)}
            onMouseLeave={() => setHoverRating(0)}
            aria-label={`${n} bintang`}
            className="p-1 transition-transform active:scale-90"
          >
            <Star
              size={26}
              weight={activeRating >= n ? "fill" : "regular"}
              className={activeRating >= n ? "text-gold" : "text-ink-soft/50"}
            />
          </button>
        ))}
      </div>

      <label className="mt-5 block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Ulasan anda</span>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Kongsi pengalaman anda dengan produk ini..."
          className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm text-ink placeholder:text-ink-soft/60 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
        />
        <span className="mt-1 block text-xs text-ink-soft">
          Minimum 10 aksara. Ulasan akan dipaparkan selepas kelulusan.
        </span>
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 inline-flex h-11 items-center rounded-full bg-gold px-7 text-sm font-medium text-card transition-colors hover:bg-gold-deep disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Menghantar..." : "Hantar Ulasan"}
      </button>
    </form>
  );
}
