"use client";

import { Heart } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

/**
 * Butang wishlist (DESIGN.md 8 - PDP "Tambah ke Cart + wishlist icon").
 * Toggle POST/DELETE /api/wishlist; ikon Heart gold penuh bila aktif.
 * Jika belum log masuk, redirect ke /log-masuk?next=... (UX.md Flow C).
 * Motion: scale ringan (whileTap) - DESIGN.md 9 (reduced motion -> statik).
 */
export function WishlistButton({
  productId,
  className,
}: {
  productId: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const reduceMotion = useReducedMotion();

  const [active, setActive] = useState(false);
  const [pending, setPending] = useState(false);

  // active hanya bermakna bila user log masuk; derive semasa render
  // (React Compiler: elak setState synchronous dalam effect).
  const isActive = session?.user ? active : false;

  // Sync state awal: jika log masuk, semak produk dalam wishlist user.
  useEffect(() => {
    let cancelled = false;
    if (!session?.user) return;
    fetch("/api/wishlist", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((data) => {
        if (cancelled) return;
        const items: Array<{ product: { id: string } }> = data?.items ?? [];
        setActive(items.some((item) => item.product.id === productId));
      })
      .catch(() => {
        /* senyap: state kekal default */
      });
    return () => {
      cancelled = true;
    };
  }, [session?.user, productId]);

  async function handleToggle() {
    if (pending) return;

    if (!session?.user) {
      const next = pathname ? encodeURIComponent(pathname) : "";
      router.push(`/log-masuk?next=${next}`);
      return;
    }

    setPending(true);
    try {
      if (isActive) {
        const response = await fetch(`/api/wishlist/${productId}`, { method: "DELETE" });
        if (!response.ok && response.status !== 204) {
          throw new Error("Gagal mengemas kini wishlist.");
        }
        setActive(false);
        toast.success("Dibuang dari wishlist");
      } else {
        const response = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as
            | { error?: { message?: string } }
            | null;
          throw new Error(data?.error?.message ?? "Gagal menambah ke wishlist.");
        }
        setActive(true);
        toast.success("Ditambah ke wishlist");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ralat wishlist. Sila cuba lagi.");
    } finally {
      setPending(false);
    }
  }

  const motionProps = reduceMotion
    ? {}
    : { whileTap: { scale: 0.85 }, transition: { duration: 0.15 } };

  return (
    <motion.button
      type="button"
      onClick={() => void handleToggle()}
      disabled={pending || isPending}
      aria-label={isActive ? "Buang dari wishlist" : "Simpan ke wishlist"}
      aria-pressed={isActive}
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors",
        isActive
          ? "border-gold bg-gold-tint text-gold-deep"
          : "border-line text-ink-soft hover:border-gold hover:text-gold-deep",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...motionProps}
    >
      <Heart size={20} weight={isActive ? "fill" : "regular"} />
    </motion.button>
  );
}
