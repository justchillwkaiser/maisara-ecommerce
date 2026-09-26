"use client";

import { Star } from "@phosphor-icons/react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { authClient } from "@/lib/auth-client";

interface ReviewFormProps {
  productId: string;
}

/**
 * Form ulasan (spesifikasi 15). Rating 1-5 + komen (10-1000 aksara).
 * Hanya untuk user berdaftar; server enforce syarat order COMPLETED
 * (403 ORDER_NOT_COMPLETED). Keadaan belum log masuk kekal seperti asal,
 * hanya dipaparkan melalui EmptyState supaya konsisten dengan seluruh laman.
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
      <EmptyState
        density="panel"
        title="Tulis ulasan anda"
        description="Log masuk untuk berkongsi pengalaman anda dengan produk ini."
        action={{
          label: "Log Masuk",
          href: `/log-masuk?next=${encodeURIComponent(pathname)}`,
        }}
      />
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
    <form onSubmit={onSubmit} className="border border-line bg-paper-lift p-6 md:p-8">
      <p className="font-display text-h3 text-ink">Tulis ulasan anda</p>

      <div role="radiogroup" aria-label="Rating" className="mt-6">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHoverRating(n)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`${n} bintang`}
              className="flex size-11 items-center justify-center transition-transform duration-(--dur-fast) motion-safe:active:scale-90"
            >
              <Star
                size={22}
                weight={activeRating >= n ? "fill" : "regular"}
                className={activeRating >= n ? "text-brass" : "text-line-strong"}
              />
            </button>
          ))}
        </div>
        {rating > 0 ? (
          <p className="mt-1 font-mono text-body-sm text-cocoa">{rating} / 5</p>
        ) : null}
      </div>

      <label className="mt-6 block">
        <span className="meta-label text-ink">Ulasan anda</span>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Kongsi pengalaman anda dengan produk ini..."
          className="mt-2 w-full rounded-xs border border-line bg-paper px-4 py-3 text-body-sm text-ink placeholder:text-cocoa/70"
        />
        <span className="mt-2 block text-body-sm text-cocoa">
          Minimum 10 aksara. Ulasan akan dipaparkan selepas kelulusan.
        </span>
      </label>

      <Button type="submit" size="lg" disabled={submitting} className="mt-6 w-full">
        {submitting ? "Menghantar..." : "Hantar Ulasan"}
      </Button>
    </form>
  );
}
