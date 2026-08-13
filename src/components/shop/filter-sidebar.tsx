import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * Sidebar filter katalog (DESIGN.md 8 - Katalog). Server component.
 * Semua filter berbentuk link/query (searchParams) supaya shareable dan
 * server-rendered. Mobile di-drawer oleh FilterDrawer.
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

/** Warna swatch (padanan harmoni dengan palet warm Maisara; fallback neutral). */
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

function swatchHex(color: string): string {
  return COLOR_HEX[color] ?? "#D8CFC2";
}

/** Bina href /koleksi?params dengan satu key di-set atau dibuang. */
function withParam(current: SidebarParams, key: keyof SidebarParams, value?: string): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(current)) {
    if (v) params.set(k, v);
  }
  if (value) {
    params.set(key, value);
  } else {
    params.delete(key);
  }
  const qs = params.toString();
  return qs ? `/koleksi?${qs}` : "/koleksi";
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 text-xs font-semibold tracking-[0.14em] text-ink-soft uppercase">
      {children}
    </h3>
  );
}

/** Radio kategori: titik bulat + label; aktif gold. */
function CategoryLink({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-checked={active}
      role="radio"
      className={cn(
        "flex items-center gap-2.5 py-1 text-sm transition-colors hover:text-gold-deep",
        active ? "font-medium text-gold-deep" : "text-ink",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-4 rounded-full border transition-colors",
          active
            ? "border-gold bg-gold"
            : "border-line bg-card group-hover:border-gold",
        )}
      />
      {label}
    </Link>
  );
}

export function FilterSidebar({
  current,
  categories,
  colors,
  sizes,
  className,
}: FilterSidebarProps) {
  const hasActiveFilter =
    current.category || current.minPrice || current.maxPrice || current.color || current.size;

  return (
    <div className={cn("space-y-8", className)}>
      {/* Kategori */}
      <section>
        <SectionTitle>Kategori</SectionTitle>
        <div role="radiogroup" aria-label="Kategori" className="flex flex-col">
          <CategoryLink
            label="Semua Kategori"
            href={withParam(current, "category")}
            active={!current.category}
          />
          {categories.map((category) => (
            <CategoryLink
              key={category.slug}
              label={category.name}
              href={withParam(current, "category", category.slug)}
              active={current.category === category.slug}
            />
          ))}
        </div>
      </section>

      {/* Harga (form GET; hidden inputs kekalkan filter lain) */}
      <section>
        <SectionTitle>Harga</SectionTitle>
        <form action="/koleksi" method="get" className="space-y-3">
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
              className="h-10 w-full min-w-0 rounded-xl border border-line bg-card px-3 text-sm outline-none placeholder:text-ink-soft/70 focus-visible:border-gold focus-visible:ring-3 focus-visible:ring-gold/25"
            />
            <span aria-hidden="true" className="text-ink-soft">
              -
            </span>
            <input
              type="number"
              name="maxPrice"
              inputMode="decimal"
              min={0}
              placeholder="Maks"
              defaultValue={current.maxPrice}
              aria-label="Harga maksimum"
              className="h-10 w-full min-w-0 rounded-xl border border-line bg-card px-3 text-sm outline-none placeholder:text-ink-soft/70 focus-visible:border-gold focus-visible:ring-3 focus-visible:ring-gold/25"
            />
          </div>
          <button
            type="submit"
            className="h-9 w-full rounded-full border border-line bg-card px-4 text-sm font-medium text-ink transition-colors hover:border-gold hover:text-gold-deep"
          >
            Guna Julat
          </button>
        </form>
      </section>

      {/* Warna: swatch bulat */}
      {colors.length > 0 && (
        <section>
          <SectionTitle>Warna</SectionTitle>
          <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Warna">
            {colors.map((color) => {
              const active = current.color === color;
              return (
                <Link
                  key={color}
                  href={withParam(current, "color", active ? undefined : color)}
                  role="radio"
                  aria-checked={active}
                  aria-label={`Warna ${color}`}
                  title={color}
                  className={cn(
                    "size-8 rounded-full border transition-transform hover:scale-105",
                    active ? "border-gold ring-2 ring-gold/40 ring-offset-2 ring-offset-bg" : "border-line",
                  )}
                  style={{ backgroundColor: swatchHex(color) }}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Saiz: pill chips */}
      {sizes.length > 0 && (
        <section>
          <SectionTitle>Saiz</SectionTitle>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Saiz">
            {sizes.map((size) => {
              const active = current.size === size;
              return (
                <Link
                  key={size}
                  href={withParam(current, "size", active ? undefined : size)}
                  role="radio"
                  aria-checked={active}
                  className={cn(
                    "min-w-10 rounded-full border px-3 py-1.5 text-center text-sm transition-colors",
                    active
                      ? "border-gold bg-gold-tint font-medium text-gold-deep"
                      : "border-line bg-card text-ink hover:border-gold hover:text-gold-deep",
                  )}
                >
                  {size}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {hasActiveFilter && (
        <Link
          href="/koleksi"
          className="inline-block text-sm font-medium text-gold-deep underline-offset-4 hover:underline"
        >
          Reset Tapisan
        </Link>
      )}
    </div>
  );
}
