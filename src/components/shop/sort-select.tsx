"use client";

import { CaretDown } from "@phosphor-icons/react";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

import type { SidebarParams } from "./filter-sidebar";

const SORT_OPTIONS = [
  { value: "popular", label: "Popular" },
  { value: "price-asc", label: "Harga: Rendah ke Tinggi" },
  { value: "price-desc", label: "Harga: Tinggi ke Rendah" },
  { value: "newest", label: "Terbaru" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

interface SortSelectProps {
  current: SidebarParams;
  value: SortValue;
  className?: string;
}

/**
 * Dropdown susun katalog (DESIGN.md 8 - Katalog). Native select distyled
 * ringan; pilihan update searchParams sort=... supaya URL shareable.
 */
export function SortSelect({ current, value, className }: SortSelectProps) {
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(next: string) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(current)) {
      if (v && k !== "sort") params.set(k, v);
    }
    if (next !== "popular") params.set("sort", next);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <label className={cn("relative inline-flex items-center", className)}>
      <span className="sr-only">Susun produk</span>
      <select
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        className="h-10 cursor-pointer appearance-none rounded-full border border-line bg-card pr-9 pl-4 text-sm font-medium text-ink outline-none transition-colors focus-visible:border-gold focus-visible:ring-3 focus-visible:ring-gold/25"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <CaretDown
        size={14}
        aria-hidden="true"
        className="pointer-events-none absolute right-3.5 text-ink-soft"
      />
    </label>
  );
}
