"use client";

import { Trash } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

/**
 * Butang buang item dari halaman /akaun/wishlist.
 * DELETE /api/wishlist/[productId] kemudian refresh halaman (server component
 * membaca semula senarai wishlist).
 */
export function WishlistRemoveButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleRemove() {
    if (pending) return;
    setPending(true);
    try {
      const response = await fetch(`/api/wishlist/${productId}`, { method: "DELETE" });
      if (!response.ok && response.status !== 204) {
        throw new Error("Gagal membuang dari wishlist.");
      }
      toast.success("Dibuang dari wishlist");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ralat wishlist. Sila cuba lagi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleRemove()}
      disabled={pending}
      className="inline-flex h-11 items-center gap-1.5 rounded-xs border border-line px-4 font-mono text-[0.625rem] tracking-[0.12em] uppercase text-cocoa transition-colors duration-(--dur-fast) hover:border-oxblood hover:text-oxblood disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Trash size={14} />
      {pending ? "Membuang..." : "Buang"}
    </button>
  );
}
