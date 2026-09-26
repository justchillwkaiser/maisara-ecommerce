"use client";

import Link from "next/link";
import { Check, X } from "@phosphor-icons/react";
import { useId } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useKoleksiResults, type KoleksiAvailability } from "./load-more";

/**
 * Rail tapisan katalog + token tapisan yang dipakai.
 *
 * Semua tapisan kekal sebagai pautan query (`/koleksi?…`) supaya URL boleh
 * dikongsi dan penapisan kekal di server. Hanya ketersediaan yang berpindah ke
 * klien kerana `listProducts` tiada parameter stok.
 */

export interface SidebarParams {
  category?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  color?: string;
  size?: string;
  sort?: string;
}

export interface SidebarCategory {
  name: string;
  slug: string;
}

interface FilterSidebarProps {
  current: SidebarParams;
  categories: SidebarCategory[];
  colors: string[];
  sizes: string[];
  className?: string;
}

/** Warna swatch sebenar bagi nama warna katalog. Bukan token reka bentuk:
 *  ini data warna produk, bukan warna sistem visual. */
const COLOR_HEX: Record<string, string> = {
  Sage: "#A8B5A0",
  Ivory: "#F2EDE2",
  Mocha: "#8B6F55",
  Black: "#2C2622",
  Emerald: "#2F6B4F",
  Rose: "#C98A8A",
  Navy: "#2F3A56",
  Gold: "#C9A227",
  Cream: "#F1E8D8",
  Burgundy: "#6E2A3A",
  "Dusty Pink": "#D9A7A7",
  Taupe: "#A08C7A",
  Beige: "#D8C7B0",
  Silver: "#C0C0C8",
  "Rose Gold": "#B76E79",
};

/**
 * Bina href /koleksi dengan beberapa key di-set (nilai) atau dibuang (null).
 * Susunan query kekal mengikut `current` supaya URL stabil dan shareable.
 */
function filterHref(
  current: SidebarParams,
  changes: Partial<Record<keyof SidebarParams, string | null>>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(current)) {
    if (value) params.set(key, value);
  }
  for (const [key, value] of Object.entries(changes)) {
    if (value) params.set(key, value);
    else params.delete(key);
  }
  const queryString = params.toString();
  return queryString ? `/koleksi?${queryString}` : "/koleksi";
}

/** Baris kawalan: sasaran 44px, sudut 2px. */
const ROW_CLASSES =
  "flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xs border border-transparent px-2 text-body-sm text-ink transition-colors duration-(--dur-fast) ease-out hover:bg-bone focus-within:border-ink";

const TOKEN_CLASSES =
  "inline-flex min-h-11 items-center gap-2 rounded-xs border border-line bg-paper-lift px-3 text-body-sm text-ink transition-colors duration-(--dur-fast) ease-out hover:border-ink hover:bg-bone";

/** Penanda pilihan: petak 2px radius dengan tanda semak — jelas tanpa warna. */
function FilterMarker({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-xs border transition-colors duration-(--dur-fast) ease-out",
        active ? "border-ink bg-ink text-paper" : "border-line-strong bg-paper-lift",
      )}
    >
      {active ? <Check size={11} weight="bold" /> : null}
    </span>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId} className="border-t border-line pt-6 first:border-t-0 first:pt-0">
      <p id={titleId} className="meta-label mb-3 text-cocoa">
        {title}
      </p>
      {children}
    </section>
  );
}

function OptionRow({
  href,
  active,
  children,
  label,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      aria-label={label}
      className={cn(ROW_CLASSES, active && "bg-bone")}
    >
      {children}
    </Link>
  );
}

/** Kumpulan ketersediaan — tapisan klien atas set yang sudah dimuatkan. */
export function KoleksiAvailabilityFilter() {
  const { availability, setAvailability, availableCount, loaded } = useKoleksiResults();

  const options: { value: KoleksiAvailability; label: string }[] = [
    { value: "all", label: "Semua produk" },
    { value: "in-stock", label: "Ada stok sahaja" },
  ];

  return (
    <div>
      <div role="radiogroup" aria-label="Ketersediaan" className="flex flex-col">
        {options.map((option) => {
          const active = availability === option.value;
          return (
            <label key={option.value} className={cn(ROW_CLASSES, active && "bg-bone")}>
              <input
                type="radio"
                name="ketersediaan"
                value={option.value}
                checked={active}
                onChange={() => setAvailability(option.value)}
                className="sr-only"
              />
              <FilterMarker active={active} />
              <span>{option.label}</span>
              {option.value === "in-stock" ? (
                <span className="ml-auto font-mono text-meta tabular-nums text-cocoa">
                  {availableCount}
                </span>
              ) : null}
            </label>
          );
        })}
      </div>
      <p className="mt-3 text-body-sm text-cocoa">
        Menapis {loaded.length} produk yang sudah dimuatkan.
      </p>
    </div>
  );
}

/** Butang "Kosongkan": tapisan URL dibuang melalui pautan, tapisan klien melalui state. */
export function KoleksiResetControl({
  baseCount,
  className,
}: {
  baseCount: number;
  className?: string;
}) {
  const { availability, setAvailability } = useKoleksiResults();

  if (baseCount > 0) {
    return (
      <Button variant="outline" asChild className={className}>
        <Link href="/koleksi">Kosongkan</Link>
      </Button>
    );
  }

  if (availability === "in-stock") {
    return (
      <Button
        variant="outline"
        type="button"
        className={className}
        onClick={() => setAvailability("all")}
      >
        Kosongkan
      </Button>
    );
  }

  return null;
}

function priceLabel(current: SidebarParams): string {
  if (current.minPrice && current.maxPrice) {
    return `Harga RM ${current.minPrice} – RM ${current.maxPrice}`;
  }
  if (current.minPrice) return `Harga dari RM ${current.minPrice}`;
  return `Harga hingga RM ${current.maxPrice}`;
}

interface KoleksiFilterTokensProps {
  current: SidebarParams;
  categories: SidebarCategory[];
}

/** Token tapisan yang sedang dipakai, setiap satu boleh dibuang. */
export function KoleksiFilterTokens({ current, categories }: KoleksiFilterTokensProps) {
  const { availability, setAvailability } = useKoleksiResults();

  const tokens: { key: string; label: string; href?: string; onRemove?: () => void }[] = [];

  if (current.category) {
    const name = categories.find((category) => category.slug === current.category)?.name;
    tokens.push({
      key: "category",
      label: name ?? current.category,
      href: filterHref(current, { category: null }),
    });
  }
  if (current.size) {
    tokens.push({
      key: "size",
      label: `Saiz ${current.size}`,
      href: filterHref(current, { size: null }),
    });
  }
  if (current.color) {
    tokens.push({
      key: "color",
      label: `Warna ${current.color}`,
      href: filterHref(current, { color: null }),
    });
  }
  if (current.minPrice || current.maxPrice) {
    tokens.push({
      key: "price",
      label: priceLabel(current),
      href: filterHref(current, { minPrice: null, maxPrice: null }),
    });
  }
  if (current.search) {
    tokens.push({
      key: "search",
      label: `Carian “${current.search}”`,
      href: filterHref(current, { search: null }),
    });
  }
  if (availability === "in-stock") {
    tokens.push({
      key: "availability",
      label: "Ada stok sahaja",
      onRemove: () => setAvailability("all"),
    });
  }

  if (tokens.length === 0) return null;

  const urlFilterCount = tokens.filter((token) => token.key !== "availability").length;

  return (
    <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-line pb-6">
      <ul className="flex flex-wrap items-center gap-2">
        {tokens.map((token) => (
          <li key={token.key}>
            {token.href ? (
              <Link
                href={token.href}
                aria-label={`Buang tapisan ${token.label}`}
                className={TOKEN_CLASSES}
              >
                {token.label}
                <X size={12} weight="bold" aria-hidden="true" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={token.onRemove}
                aria-label={`Buang tapisan ${token.label}`}
                className={TOKEN_CLASSES}
              >
                {token.label}
                <X size={12} weight="bold" aria-hidden="true" />
              </button>
            )}
          </li>
        ))}
      </ul>
      <KoleksiResetControl baseCount={urlFilterCount} className="ml-auto" />
    </div>
  );
}

export function FilterSidebar({
  current,
  categories,
  colors,
  sizes,
  className,
}: FilterSidebarProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Group title="Kategori">
        <div className="flex flex-col">
          <OptionRow
            href={filterHref(current, { category: null })}
            active={!current.category}
            label="Semua kategori"
          >
            <FilterMarker active={!current.category} />
            <span className="truncate">Semua kategori</span>
          </OptionRow>
          {categories.map((category) => {
            const active = current.category === category.slug;
            return (
              <OptionRow
                key={category.slug}
                href={filterHref(current, { category: category.slug })}
                active={active}
                label={category.name}
              >
                <FilterMarker active={active} />
                <span className="truncate">{category.name}</span>
              </OptionRow>
            );
          })}
        </div>
      </Group>

      {sizes.length > 0 ? (
        <Group title="Saiz">
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const active = current.size === size;
              return (
                <Link
                  key={size}
                  href={filterHref(current, { size: active ? null : size })}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-xs border px-3 text-body-sm transition-colors duration-(--dur-fast) ease-out",
                    active
                      ? "border-ink bg-ink font-medium text-paper ring-1 ring-ink ring-offset-2 ring-offset-paper"
                      : "border-line bg-paper-lift text-ink hover:border-ink hover:bg-bone",
                  )}
                >
                  {size}
                </Link>
              );
            })}
          </div>
        </Group>
      ) : null}

      {colors.length > 0 ? (
        <Group title="Warna">
          <div className="flex flex-col">
            {colors.map((color) => {
              const active = current.color === color;
              return (
                <OptionRow
                  key={color}
                  href={filterHref(current, { color: active ? null : color })}
                  active={active}
                  label={`Warna ${color}`}
                >
                  <span
                    aria-hidden="true"
                    className="size-4 shrink-0 rounded-xs border border-line-strong"
                    style={{ backgroundColor: COLOR_HEX[color] ?? "#D8CFC2" }}
                  />
                  <span className="truncate">{color}</span>
                  {active ? (
                    <Check size={13} weight="bold" aria-hidden="true" className="ml-auto text-ink" />
                  ) : null}
                </OptionRow>
              );
            })}
          </div>
        </Group>
      ) : null}

      <Group title="Harga">
        <form action="/koleksi" method="get" className="flex flex-col gap-3">
          <input type="hidden" name="category" value={current.category ?? ""} />
          <input type="hidden" name="search" value={current.search ?? ""} />
          <input type="hidden" name="color" value={current.color ?? ""} />
          <input type="hidden" name="size" value={current.size ?? ""} />
          <input type="hidden" name="sort" value={current.sort ?? ""} />
          <div className="flex items-center gap-2">
            <input
              type="number"
              name="minPrice"
              inputMode="decimal"
              min={0}
              placeholder="Min"
              defaultValue={current.minPrice}
              aria-label="Harga minimum"
              className="h-11 w-full min-w-0 rounded-xs border border-line bg-paper-lift px-3 text-body-sm text-ink outline-none placeholder:text-cocoa/70 focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/30"
            />
            <span aria-hidden="true" className="text-cocoa">
              –
            </span>
            <input
              type="number"
              name="maxPrice"
              inputMode="decimal"
              min={0}
              placeholder="Maks"
              defaultValue={current.maxPrice}
              aria-label="Harga maksimum"
              className="h-11 w-full min-w-0 rounded-xs border border-line bg-paper-lift px-3 text-body-sm text-ink outline-none placeholder:text-cocoa/70 focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/30"
            />
          </div>
          <Button type="submit" variant="outline" className="w-full">
            Guna julat
          </Button>
        </form>
      </Group>

      <Group title="Ketersediaan">
        <KoleksiAvailabilityFilter />
      </Group>
    </div>
  );
}