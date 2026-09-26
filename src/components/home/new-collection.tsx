import Link from "next/link";

import { ProductCard } from "@/components/shop/product-card";
import { Reveal } from "@/components/shop/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { EmptyState } from "@/components/ui/empty-state";
import type { ProductSummary } from "@/server/services/product.service";
import { cn } from "@/lib/utils";

/**
 * Koleksi baharu (spesifikasi 12).
 *
 * Susun atur editorial tidak simetri: satu kad utama bersaiz besar diikuti
 * tiga kad lebih kecil. Grid seragam 4 lajur akan menjadikan seksyen ini sama
 * seperti katalog, jadi hierarki sengaja tidak rata.
 */
export function NewCollection({ products }: { products: ProductSummary[] }) {
  return (
    <section className="border-b border-line bg-paper">
      <div className="shell py-(--space-section)">
        <Reveal>
          <SectionHeading
            eyebrow="01 · Koleksi baharu"
            title="Kepingan terkini"
            description="Ditambah ke katalog dalam beberapa minggu lepas. Setiap satu disemak sebelum dihantar."
            size="display-m"
            action={
              <Link
                href="/koleksi"
                className="meta-label text-cocoa underline-offset-4 transition-colors duration-(--dur-fast) hover:text-ink hover:underline"
              >
                Lihat semua
              </Link>
            }
          />
        </Reveal>

        {products.length === 0 ? (
          <EmptyState
            className="mt-12"
            eyebrow="Katalog"
            title="Tiada kepingan buat masa ini."
            description="Koleksi seterusnya sedang disiapkan. Lihat kembali tidak lama lagi."
            action={{ label: "Lihat koleksi", href: "/koleksi" }}
          />
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-x-(--gutter) gap-y-12 lg:grid-cols-12">
            {products.map((product, index) => {
              // Susunan berselang-seli 7/5 kemudian 5/7: setiap kad kekal
              // cukup besar untuk nama dan harga terbaca, tetapi grid tidak
              // pernah rata seperti katalog.
              const span = index % 2 === 0 ? "lg:col-span-7" : "lg:col-span-5";
              const sizes =
                index % 2 === 0
                  ? "(min-width: 1024px) 56vw, 50vw"
                  : "(min-width: 1024px) 40vw, 50vw";

              return (
                <Reveal
                  key={product.slug}
                  delay={0.06 * index}
                  className={cn("col-span-2", span)}
                >
                  <ProductCard product={product} sizes={sizes} />
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
