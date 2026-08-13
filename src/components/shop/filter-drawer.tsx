"use client";

import { Funnel, X } from "@phosphor-icons/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/**
 * Drawer tapisan mobile (DESIGN.md 8 - Katalog): butang "Tapisan" membuka
 * sheet; FilterSidebar (server component) di-render sebagai children.
 */
export function FilterDrawer({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden" data-icon="inline-start">
          <Funnel size={14} />
          Tapisan
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[85%] overflow-y-auto bg-bg sm:max-w-sm">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between font-serif text-2xl font-semibold text-ink">
            Tapisan
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Tutup tapisan"
              onClick={() => setOpen(false)}
            >
              <X size={16} />
            </Button>
          </SheetTitle>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  );
}
