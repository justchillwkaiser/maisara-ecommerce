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
 * Susun katalog. Select asli (papan kekunci mudah alih kekal asli) dengan
 * bingkai hairline 2px dan label mono; pilihan menulis `sort` ke searchParams
 * supaya URL kekal shareable.
 */
export function SortSelect({ current, value, className }: SortSelectProps) {
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(next: string) {
    const params = new URLSearchParams();
    for (const [key, param] of Object.entries(current)) {
      if (param && key !== "sort") params.set(key, param);
    }
    if (next !== "popular") params.set("sort", next);
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  }

  return (
    <label className={cn("flex items-center gap-3", className)}>
      <span className="meta-label text-cocoa">Susun</span>
      <span className="relative inline-flex items-center">
        <select
          value={value}
          onChange={(event) => handleChange(event.target.value)}
          className="h-11 cursor-pointer appearance-none rounded-xs border border-line bg-paper-lift pr-10 pl-4 font-mono text-body-sm text-ink outline-none transition-colors duration-(--dur-fast) ease-out focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/30"
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
          className="pointer-events-none absolute right-3.5 text-cocoa"
        />
      </span>
    </label>
  );
}