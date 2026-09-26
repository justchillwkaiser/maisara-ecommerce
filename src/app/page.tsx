import { BrandStatement } from "@/components/home/brand-statement";
import { BrandStory } from "@/components/home/brand-story";
import { Craft } from "@/components/home/craft";
import { CustomerVoice } from "@/components/home/customer-voice";
import { EditorialStory } from "@/components/home/editorial-story";
import { Hero } from "@/components/home/hero";
import { JournalTeaser } from "@/components/home/journal-teaser";
import { NewCollection } from "@/components/home/new-collection";
import { Newsletter } from "@/components/home/newsletter";
import { ShopByCategory } from "@/components/home/shop-by-category";
import { Signature } from "@/components/home/signature";
import { TrustStrip } from "@/components/shared/trust-strip";
import {
  getHomepageCategories,
  getHomepageProducts,
  getHomepageReviews,
} from "@/lib/homepage";

/**
 * Homepage MAISARA (spesifikasi 12).
 *
 * Susunan seksyen mengikut reka bentuk yang diluluskan:
 *   01 hero · 02 pernyataan jenama · 03 koleksi baharu · 04 kategori
 *   05 editorial bahan · 06 signature (gelap) · 07 cara kami membuat
 *   08 cerita jenama · 09 suara pelanggan · 10 journal · 11 surat berita
 * Footer di-render oleh layout, dan jalur kepercayaan diletakkan sebelum
 * footer supaya ia membaca sebagai nota penutup.
 *
 * Semua data diambil sekali di sini dan dihantar ke seksyen sebagai props,
 * jadi setiap seksyen kekal sebagai komponen persembahan.
 */
export default async function Home() {
  const [products, categories, reviews] = await Promise.all([
    getHomepageProducts(),
    getHomepageCategories(),
    getHomepageReviews(),
  ]);

  return (
    <>
      <Hero />
      <BrandStatement />
      <NewCollection products={products} />
      <ShopByCategory categories={categories} />
      <EditorialStory />
      <Signature />
      <Craft />
      <BrandStory />
      <CustomerVoice reviews={reviews} />
      <JournalTeaser />
      <TrustStrip />
      <Newsletter />
    </>
  );
}
