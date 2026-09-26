"use client";

import { Eye, EyeSlash } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/**
 * Aksi moderasi review (API.md section 6 - PATCH /api/reviews/[id]).
 * Approve (APPROVED) / Sembunyikan (HIDDEN) -> toast + refresh senarai.
 *
 * Tona affirmative memakai aksen `olive` sistem (token `success` lama sudah
 * tiada); teks kekal `ink` supaya kontras pada tint nipis kekal sah.
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
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => void moderate("APPROVED")}
        disabled={pending !== null}
        className="bg-olive/10 text-ink hover:bg-olive/20"
      >
        <Eye />
        Lulus
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => void moderate("HIDDEN")}
        disabled={pending !== null}
        className="bg-oxblood/10 text-oxblood hover:bg-oxblood/20"
      >
        <EyeSlash />
        Sembunyikan
      </Button>
    </div>
  );
}
