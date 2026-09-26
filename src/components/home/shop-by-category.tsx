import Link from "next/link";

import { Reveal } from "@/components/shop/reveal";
import { FramedImage } from "@/components/ui/image-frame";
import { SectionHeading } from "@/components/ui/section-heading";
import type { HomepageCategory } from "@/lib/homepage";
import { categoryImageFor } from "@/lib/product-images";
import { cn } from "@/lib/utils";

/**
 * Beli mengikut kategori (spesifikasi 12).
 *
 * Lima kategori sebenar dengan kiraan produk sebenar. Susun atur tidak
 * rata: dua petak tinggi diikuti tiga petak lebih kecil, supaya seksyen ini
 * membaca sebagai komposisi editorial dan bukan grid kad yang seragam.
 */
export function ShopByCategory({ categories }: { categories: HomepageCategory[] }) {
  if (categories.length === 0) return null;

  const [lead, second, ...rest] = categories;

  return (
    <section className="border-b border-line bg-bone">
      <div className="shell py-(--space-section)">
        <Reveal>
          <SectionHeading
            eyebrow="02 · Kategori"
            title="Cari mengikut keperluan"
            description="Setiap kategori disusun mengikut bahan dan potongan, bukan mengikut musim."
            size="display-m"
          />
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-x-(--gutter) gap-y-10 lg:grid-cols-12">
          {[lead, second].filter(Boolean).map((category, index) => (
            <Reveal
              key={category.slug}
              delay={0.05 * index}
              className="col-span-2 lg:col-span-6"
            >
              <CategoryTile
                category={category}
                sizes="(min-width: 1024px) 48vw, 100vw"
                size="large"
              />
            </Reveal>
          ))}

          {rest.map((category, index) => (
            <Reveal
              key={category.slug}
              delay={0.05 * (index + 2)}
              className="lg:col-span-4"
            >
              <CategoryTile
                category={category}
                sizes="(min-width: 1024px) 32vw, 50vw"
                size="small"
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryTile({
  category,
  sizes,
  size,
}: {
  category: HomepageCategory;
  sizes: string;
  size: "large" | "small";
}) {
  const image = category.image ?? categoryImageFor(category.slug);

  return (
    <Link href={`/koleksi/${category.slug}`} className="group block">
      <FramedImage
        src={image}
        alt={`Koleksi ${category.name}`}
        ratio="4 / 5"
        placeholderLabel={category.name}
        sizes={sizes}
        className={cn(
          "transition-transform duration-(--dur-editorial) ease-out",
          "motion-safe:group-hover:scale-[1.03]",
        )}
      />
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3
          className={cn(
            "font-display text-ink",
            size === "large" ? "text-h3" : "text-xl",
          )}
        >
          {category.name}
        </h3>
        <span className="meta-label shrink-0 text-cocoa">
          {category.productCount} kepingan
        </span>
      </div>
    </Link>
  );
}
