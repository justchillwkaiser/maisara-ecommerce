"use client";

import { Eye, EyeSlash } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

/**
 * Aksi moderasi review (API.md section 6 - PATCH /api/reviews/[id]).
 * Approve (APPROVED) / Sembunyikan (HIDDEN) -> toast + refresh senarai.
 */
export function AdminReviewActions({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  async function moderate(status: "APPROVED" | "HIDDEN") {
    setPending(status);
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        cache: "no-store",
      });
      const body = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(
          typeof body?.error?.message === "string" && body.error.message.length > 0
            ? body.error.message
            : "Gagal mengemas kini ulasan.",
        );
        return;
      }

      toast.success(status === "APPROVED" ? "Ulasan diluluskan." : "Ulasan disembunyikan.");
      router.refresh();
    } catch {
      toast.error("Ralat dalaman. Sila cuba sebentar lagi.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => void moderate("APPROVED")}
        disabled={pending !== null}
        className={cn(
          "inline-flex h-8 items-center gap-1.5 rounded-full px-4 text-xs font-medium transition-colors disabled:opacity-50",
          "bg-success/10 text-success hover:bg-success/20",
        )}
      >
        <Eye size={14} />
        Approve
      </button>
      <button
        type="button"
        onClick={() => void moderate("HIDDEN")}
        disabled={pending !== null}
        className={cn(
          "inline-flex h-8 items-center gap-1.5 rounded-full px-4 text-xs font-medium transition-colors disabled:opacity-50",
          "bg-danger/10 text-danger hover:bg-danger/20",
        )}
      >
        <EyeSlash size={14} />
        Sembunyikan
      </button>
    </div>
  );
}
