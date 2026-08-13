"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { List, X } from "@phosphor-icons/react";

import type { NavCategory } from "@/lib/categories";
import { cn } from "@/lib/utils";

interface HeaderClientProps {
  categories: NavCategory[];
}

/** Bezier lembut (DESIGN.md 9). */
const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Menu mobile Maisara: hamburger morph (List -> X) + overlay full-screen
 * dengan stagger reveal. Reduced motion: semua animasi collapse ke static.
 */
export function HeaderClient({ categories }: HeaderClientProps) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const router = useRouter();

  // Kunci scroll body bila overlay terbuka.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Tutup bila Escape ditekan.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const navigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const stagger = (index: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: reduceMotion
      ? { duration: 0 }
      : { duration: 0.6, delay: index * 0.06, ease: EASE },
    exit: reduceMotion ? undefined : { opacity: 0, y: 8 },
  });

  return (
    <>
      {/* Hamburger morph */}
      <button
        type="button"
        aria-label={open ? "Tutup menu" : "Buka menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-gold-tint hover:text-gold-deep lg:hidden"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={reduceMotion ? false : { rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={reduceMotion ? undefined : { rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex"
            >
              <X size={24} weight="bold" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={reduceMotion ? false : { rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={reduceMotion ? undefined : { rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex"
            >
              <List size={24} weight="bold" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Overlay full-screen */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-bg/95 backdrop-blur lg:hidden"
          >
            <nav
              aria-label="Menu utama"
              className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col px-4 pb-10 pt-24 md:px-8"
            >
              <ul className="space-y-1">
                <motion.li {...stagger(0)}>
                  <Link
                    href="/koleksi"
                    onClick={() => navigate("/koleksi")}
                    className="block py-2 font-serif text-3xl font-medium text-ink transition-colors hover:text-gold-deep"
                  >
                    Semua Koleksi
                  </Link>
                </motion.li>
                {categories.map((category, index) => (
                  <motion.li key={category.slug} {...stagger(index + 1)}>
                    <Link
                      href={`/koleksi/${category.slug}`}
                      onClick={() => navigate(`/koleksi/${category.slug}`)}
                      className="block py-2 font-serif text-3xl font-medium text-ink-soft transition-colors hover:text-gold-deep"
                    >
                      {category.name}
                    </Link>
                  </motion.li>
                ))}
                <motion.li {...stagger(categories.length + 1)}>
                  <Link
                    href="/kisah-kami"
                    onClick={() => navigate("/kisah-kami")}
                    className="block py-2 font-serif text-3xl font-medium text-ink-soft transition-colors hover:text-gold-deep"
                  >
                    Kisah Kami
                  </Link>
                </motion.li>
              </ul>

              {/* Aksi bawah */}
              <motion.div
                {...stagger(categories.length + 2)}
                className="mt-auto flex flex-col gap-3 pt-12"
              >
                <Link
                  href="/log-masuk"
                  onClick={() => navigate("/log-masuk")}
                  className="flex h-12 items-center justify-center rounded-full bg-gold px-6 text-sm font-medium text-card transition-colors hover:bg-gold-deep"
                >
                  Log Masuk
                </Link>
                <Link
                  href="/koleksi?search="
                  onClick={() => navigate("/koleksi?search=")}
                  className={cn(
                    "flex h-12 items-center justify-center rounded-full border border-ink/20",
                    "text-sm font-medium text-ink transition-colors hover:border-gold hover:text-gold-deep",
                  )}
                >
                  Cari Produk
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
