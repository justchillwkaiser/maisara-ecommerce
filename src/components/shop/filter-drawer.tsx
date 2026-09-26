"use client";

import { Funnel, X } from "@phosphor-icons/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { KoleksiResetControl } from "./filter-sidebar";
import { useKoleksiResults } from "./load-more";

/**
 * Drawer tapisan mudah alih: butang "Penapis" membuka bottom sheet yang
 * mengandungi rail tapisan yang sama seperti desktop.
 *
 * Radix Dialog menguruskan focus trap, kunci skrol dan penutupan dengan
 * Escape; butang tutup di header dan footer memberi jalan keluar yang jelas.
 * Bilangan tapisan aktif diumumkan melalui nama boleh akses butang pencetus.
 */
interface FilterDrawerProps {
  /** Bilangan tapisan daripada URL (server); ketersediaan ditambah di sini. */
  baseCount?: number;
  children: React.ReactNode;
}

export function FilterDrawer({ baseCount = 0, children }: FilterDrawerProps) {
  const [open, setOpen] = useState(false);
  const { availability } = useKoleksiResults();

  const appliedCount = baseCount + (availability === "in-stock" ? 1 : 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="lg:hidden"
          aria-label={
            appliedCount > 0 ? `Penapis, ${appliedCount} tapisan aktif` : undefined
          }
        >
          <Funnel size={14} aria-hidden="true" />
          Penapis
          {appliedCount > 0 ? (
            <span
              aria-hidden="true"
              className="inline-flex size-5 items-center justify-center rounded-xs bg-ink font-mono text-meta text-paper"
            >
              {appliedCount}
            </span>
          ) : null}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="max-h-[88vh] gap-0 rounded-t-lg border-t border-line bg-paper p-0"
      >
        <SheetHeader className="flex-row items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <SheetTitle className="font-display text-h3 text-ink">Penapis</SheetTitle>
            <SheetDescription className="mt-1 text-body-sm text-cocoa">
              {appliedCount > 0
                ? `${appliedCount} tapisan sedang digunakan.`
                : "Pilih tapisan untuk menyempitkan koleksi."}
            </SheetDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Tutup penapis"
            onClick={() => setOpen(false)}
          >
            <X size={16} aria-hidden="true" />
          </Button>
        </SheetHeader>

        <div className="overflow-y-auto px-5 py-6">{children}</div>

        <SheetFooter className="mt-auto flex-row gap-3 border-t border-line bg-paper-lift px-5 py-4">
          {appliedCount > 0 ? (
            <KoleksiResetControl baseCount={baseCount} className="flex-1" />
          ) : null}
          <SheetClose asChild>
            <Button className="flex-1">Tutup</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}