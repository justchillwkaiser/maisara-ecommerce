import { BrandStory } from "@/components/shop/brand-story";
import { CategoryGrid } from "@/components/shop/category-grid";
import { FeaturedProducts } from "@/components/shop/featured-products";
import { Hero } from "@/components/shop/hero";
import { Testimonials } from "@/components/shop/testimonials";

/**
 * Homepage Maisara (DESIGN.md 8 - section order; tiada 2 section sama):
 * 1. Hero editorial split
 * 2. Kategori asymmetric grid
 * 3. Produk featured grid 4
 * 4. Testimoni editorial quote
 * 5. Kisah kami full-width editorial
 * (Footer di-render oleh layout.tsx)
 */
export default function Home() {
  return (
    <>
      <Hero />
      <CategoryGrid />
      <FeaturedProducts />
      <Testimonials />
      <BrandStory />
    </>
  );
}
