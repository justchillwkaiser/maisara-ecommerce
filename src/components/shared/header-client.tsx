"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import type { NavCategory } from "@/lib/categories";
import { PRIMARY_NAV } from "@/lib/site";
import { cn } from "@/lib/utils";

import type { HeaderUser } from "./auth-nav";

interface HeaderClientProps {
  categories: NavCategory[];
  user: HeaderUser | null;
}

/** Bezier lembut (spesifikasi 09). */
const EASE = [0.16, 1, 0.3, 1] as const;

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
/** Titik putus `lg` Tailwind (64rem): had atas kewujudan panel menu mudah alih. */
const LG_QUERY = "(min-width: 64rem)";

/**
 * Panel menu menutup viewport sepenuhnya, jadi header mesti kekal paper
 * semasa panel terbuka — jika tidak butang MENU/Beg hilang di atas panel.
 * HeaderClient (anak HeaderShell) melaporkan keadaan buka melalui context
 * ini supaya props HeaderClient kekal tidak berubah.
 */
const MenuOpenContext = createContext<((open: boolean) => void) | null>(null);

/**
 * Cangkerang header (spesifikasi 11).
 *
 * Hanya homepage mempunyai hero gelap penuh-bleed. Di situ header
 * dilepaskan daripada aliran (fixed) dan bertindih dengan hero: telus
 * (`data-state="top"`) selagi belum skrol, kemudian bertukar kepada paper
 * (`data-state="scrolled"`). Laluan lain kekal sticky dan terus paper supaya
 * teks sentiasa boleh dibaca. Anak-anak header mewarisi keadaan ini melalui
 * varian `group-data-[state=top]`.
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      data-state={menuOpen ? "menu-open" : "idle"}
      className={cn(
        "group sticky top-0 z-50 w-full border-b border-line bg-paper/95",
        "supports-backdrop-filter:backdrop-blur-[2px]",
      )}
    >
      <MenuOpenContext.Provider value={setMenuOpen}>
        {children}
      </MenuOpenContext.Provider>
    </header>
  );
}

/**
 * Menu mudah alih Maisara: butang MENU dalam header + panel penuh skrin
 * dengan stagger reveal. Reduced motion: semua animasi collapse ke static.
 */
export function HeaderClient({ categories, user }: HeaderClientProps) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const wasOpen = useRef(false);
  const setMenuOpen = useContext(MenuOpenContext);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  // Header kekal paper selagi panel terbuka.
  useEffect(() => {
    setMenuOpen?.(open);
  }, [open, setMenuOpen]);

  // Kunci scroll body bila panel terbuka.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Fokus masuk ke pautan pertama panel semasa dibuka, kembali ke butang
  // header semasa ditutup.
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      firstLinkRef.current?.focus();
      return;
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      triggerRef.current?.focus();
    }
  }, [open]);

  // Panel hanya wujud di bawah `lg` (lihat `lg:hidden` pada panel). Bila
  // viewport melebar melepasi had itu — putaran peranti atau tetingkap
  // dibesarkan — panel menjadi `display:none`. State mesti ditutup serta-merta:
  // jika tidak perangkap Tab di bawah akan terus `preventDefault()` dan cuba
  // memfokus pautan yang tersembunyi, jadi kekunci Tab mati sepenuhnya.
  useEffect(() => {
    if (!open) return;
    const wide = window.matchMedia(LG_QUERY);
    if (wide.matches) {
      setOpen(false);
      return;
    }
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    wide.addEventListener("change", onChange);
    return () => wide.removeEventListener("change", onChange);
  }, [open]);
  // Escape menutup panel; Tab dikunci dalam panel (dialog modal).
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      // Panel tersembunyi (cth. viewport sudah `lg`) tiada item boleh fokus:
      // jangan telan kekunci Tab.
      if (!panel || panel.clientHeight === 0) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (!panel.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }
      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
        return;
      }
      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const navigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const stagger = (index: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: reduceMotion
      ? { duration: 0 }
      : { duration: 0.35, delay: index * 0.04, ease: EASE },
    exit: reduceMotion ? undefined : { opacity: 0, y: 8 },
  });

  // "Koleksi" sudah menjadi kumpulan kategori di atas, jadi ia tidak diulang
  // dalam senarai pautan biasa.
  const navItems = PRIMARY_NAV.filter((item) => item.href !== "/koleksi");

  return (
    <>
      {/*
        Satu-satunya kawalan tutup: butang header (MENU → "Tutup ×") kekal di
        atas panel kerana panel dirender pada z-40 di bawah header (z-50).
        Tiada butang tutup kedua di dalam panel.
      */}
      <button
        ref={triggerRef}
        type="button"
        aria-label={open ? "Tutup menu" : "Buka menu"}
        aria-expanded={open}
        aria-controls="menu-mudah-alih"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "meta-label flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xs px-2 text-ink",
          "transition-colors duration-(--dur-fast) hover:bg-bone lg:hidden",
          "group-data-[state=top]:text-paper group-data-[state=top]:hover:bg-paper/10",
        )}
      >
        {open ? (
          <>
            Tutup
            <X size={16} weight="bold" aria-hidden="true" />
          </>
        ) : (
          "MENU"
        )}
      </button>
      {/* Panel di-portal ke body: `backdrop-filter` pada header mewujudkan
          containing block untuk keturunan position:fixed, jadi panel yang
          dirender dalam header akan resolve inset terhadap header (64/72px)
          dan bukan viewport. Portal melepaskan panel daripada header. Panel
          kekal pada z-40, di bawah header (z-50), supaya butang "Tutup" di
          header sentiasa kekal di atas dan boleh diklik. */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                key="overlay"
                ref={panelRef}
                id="menu-mudah-alih"
                role="dialog"
                aria-modal="true"
                aria-label="Menu"
                tabIndex={-1}
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="fixed inset-0 z-40 overflow-y-auto bg-paper-lift outline-none lg:hidden"
              >
                <nav
                  aria-label="Menu utama"
                  className="flex min-h-full w-full flex-col px-5 pt-20 pb-10 md:pt-24"
                >
                  <p className="meta-label text-cocoa">Menu</p>
                  <div className="mt-6">
                    <p className="meta-label text-cocoa">Koleksi</p>
                    <ul className="mt-3 space-y-1">
                      <motion.li {...stagger(0)}>
                        <Link
                          ref={firstLinkRef}
                          href="/koleksi"
                          onClick={() => navigate("/koleksi")}
                          className="flex min-h-11 items-center font-display text-h2 text-ink transition-colors duration-(--dur-fast) hover:text-cocoa"
                        >
                          Semua Koleksi
                        </Link>
                      </motion.li>
                      {categories.map((category, index) => (
                        <motion.li key={category.slug} {...stagger(index + 1)}>
                          <Link
                            href={`/koleksi/${category.slug}`}
                            onClick={() => navigate(`/koleksi/${category.slug}`)}
                            className="flex min-h-11 items-center font-display text-h2 text-cocoa transition-colors duration-(--dur-fast) hover:text-ink"
                          >
                            {category.name}
                          </Link>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-10">
                    <p className="meta-label text-cocoa">Laman</p>
                    <ul className="mt-3 space-y-1">
                      {navItems.map((item, index) => (
                        <motion.li
                          key={item.href}
                          {...stagger(categories.length + 1 + index)}
                        >
                          <Link
                            href={item.href}
                            onClick={() => navigate(item.href)}
                            className="flex min-h-11 items-center text-body-lg text-ink transition-colors duration-(--dur-fast) hover:text-cocoa"
                          >
                            {item.label}
                          </Link>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Aksi bawah */}
                  <motion.div
                    {...stagger(categories.length + navItems.length + 1)}
                    className="mt-auto flex flex-col gap-2 pt-12"
                  >
                    {user ? (
                      <>
                        <Button asChild>
                          <Link href="/akaun" onClick={() => navigate("/akaun")}>
                            {user.name?.trim() ? user.name : user.email} · Akaun Saya
                          </Link>
                        </Button>
                        {user.role === "ADMIN" && (
                          <Button asChild variant="outline">
                            <Link href="/admin" onClick={() => navigate("/admin")}>
                              Panel Admin
                            </Link>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          className="hover:border-danger hover:text-danger"
                          onClick={() => void handleSignOut()}
                        >
                          Log Keluar
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button asChild>
                          <Link href="/log-masuk" onClick={() => navigate("/log-masuk")}>
                            Log Masuk
                          </Link>
                        </Button>
                        <Button asChild variant="outline">
                          <Link href="/daftar" onClick={() => navigate("/daftar")}>
                            Daftar
                          </Link>
                        </Button>
                      </>
                    )}
                    <Button asChild variant="ghost">
                      <Link
                        href="/koleksi?search="
                        onClick={() => navigate("/koleksi?search=")}
                      >
                        Cari Produk
                      </Link>
                    </Button>
                  </motion.div>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
