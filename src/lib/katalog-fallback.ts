import type { ProductListResult, ProductSummary } from "@/server/services/product.service";
import type { ProductQuery } from "@/lib/validations/product";

/**
 * Fallback katalog = data seed (prisma/seed.ts) supaya halaman koleksi kekal
 * hijau walaupun DATABASE_URL tidak boleh dicapai (cth. dev machine offline).
 * Bila DB hidup, service sebenar (product.service.ts) digunakan.
 * Corak sama seperti lib/categories.ts dan components/shop/featured-products.tsx.
 */

type VariantSeed = { color: string; size: string | null; stock: number };
type ProductSeed = {
  name: string;
  slug: string;
  price: string;
  cat: string;
  feat: boolean;
  v: VariantSeed[];
};

const FALLBACK_PRODUCTS: ProductSeed[] = [
  { name: "Tudung Bella Voal Premium", slug: "tudung-bella-voal", price: "39.90", cat: "tudung", feat: true, v: [{ color: "Sage", size: null, stock: 42 }, { color: "Ivory", size: null, stock: 35 }, { color: "Mocha", size: null, stock: 3 }, { color: "Black", size: null, stock: 0 }] },
  { name: "Tudung Sekolah Arissa", slug: "tudung-sekolah-arissa", price: "29.90", cat: "tudung", feat: false, v: [{ color: "Navy", size: null, stock: 80 }, { color: "Black", size: null, stock: 64 }, { color: "Cream", size: null, stock: 2 }] },
  { name: "Shawl Silk Premium", slug: "shawl-silk-premium", price: "89.00", cat: "tudung", feat: true, v: [{ color: "Emerald", size: null, stock: 18 }, { color: "Burgundy", size: null, stock: 12 }, { color: "Gold", size: null, stock: 5 }, { color: "Black", size: null, stock: 26 }] },
  { name: "Tudung Bawal Cotton", slug: "tudung-bawal-cotton", price: "19.90", cat: "tudung", feat: false, v: [{ color: "Ivory", size: null, stock: 55 }, { color: "Mocha", size: null, stock: 47 }, { color: "Rose", size: null, stock: 0 }] },
  { name: "Tudung Satin Luxe", slug: "tudung-satin-luxe", price: "59.00", cat: "tudung", feat: false, v: [{ color: "Dusty Pink", size: null, stock: 22 }, { color: "Taupe", size: null, stock: 4 }, { color: "Black", size: null, stock: 31 }] },
  { name: "Baju Kurung Moden Cik Puan", slug: "baju-kurung-cik-puan", price: "159.00", cat: "baju-kurung", feat: true, v: [{ color: "Sage", size: "S", stock: 8 }, { color: "Sage", size: "M", stock: 12 }, { color: "Mocha", size: "S", stock: 6 }, { color: "Mocha", size: "M", stock: 9 }] },
  { name: "Baju Kurung Tradisional Melati", slug: "baju-kurung-melati", price: "139.00", cat: "baju-kurung", feat: false, v: [{ color: "Ivory", size: "S", stock: 15 }, { color: "Ivory", size: "M", stock: 4 }, { color: "Ivory", size: "L", stock: 11 }] },
  { name: "Baju Kurung Moden Sofea", slug: "baju-kurung-sofea", price: "149.00", cat: "baju-kurung", feat: false, v: [{ color: "Dusty Pink", size: "S", stock: 7 }, { color: "Dusty Pink", size: "M", stock: 13 }, { color: "Navy", size: "S", stock: 0 }, { color: "Navy", size: "M", stock: 5 }] },
  { name: "Baju Kurung Pahang Lace", slug: "baju-kurung-pahang-lace", price: "169.00", cat: "baju-kurung", feat: false, v: [{ color: "Cream", size: "M", stock: 10 }, { color: "Cream", size: "L", stock: 6 }, { color: "Beige", size: "M", stock: 2 }] },
  { name: "Baju Kurung Moden Ameena", slug: "baju-kurung-ameena", price: "179.00", cat: "baju-kurung", feat: false, v: [{ color: "Emerald", size: "S", stock: 9 }, { color: "Emerald", size: "M", stock: 14 }, { color: "Emerald", size: "L", stock: 7 }, { color: "Black", size: "M", stock: 0 }] },
  { name: "Dress Kasual Dahlia", slug: "dress-kasual-dahlia", price: "129.00", cat: "dress", feat: false, v: [{ color: "Mocha", size: "S", stock: 16 }, { color: "Mocha", size: "M", stock: 21 }, { color: "Sage", size: "S", stock: 4 }, { color: "Sage", size: "M", stock: 18 }] },
  { name: "Dress Raya Satin", slug: "dress-raya-satin", price: "199.00", cat: "dress", feat: true, v: [{ color: "Ivory", size: "S", stock: 12 }, { color: "Ivory", size: "M", stock: 8 }, { color: "Ivory", size: "L", stock: 5 }, { color: "Gold", size: "M", stock: 3 }] },
  { name: "Dress Midi Serenity", slug: "dress-midi-serenity", price: "149.00", cat: "dress", feat: false, v: [{ color: "Navy", size: "S", stock: 20 }, { color: "Navy", size: "M", stock: 15 }, { color: "Taupe", size: "M", stock: 1 }, { color: "Taupe", size: "L", stock: 0 }] },
  { name: "Dress Kaftan Zamrud", slug: "dress-kaftan-zamrud", price: "189.00", cat: "dress", feat: false, v: [{ color: "Emerald", size: "M", stock: 13 }, { color: "Emerald", size: "L", stock: 9 }, { color: "Black", size: "M", stock: 11 }] },
  { name: "Abaya Basic Naura", slug: "abaya-basic-naura", price: "249.00", cat: "abaya", feat: false, v: [{ color: "Black", size: "S", stock: 25 }, { color: "Black", size: "M", stock: 30 }, { color: "Black", size: "L", stock: 18 }] },
  { name: "Abaya Lace Emma", slug: "abaya-lace-emma", price: "299.00", cat: "abaya", feat: false, v: [{ color: "Black", size: "S", stock: 6 }, { color: "Black", size: "M", stock: 9 }, { color: "Navy", size: "S", stock: 2 }, { color: "Navy", size: "M", stock: 0 }] },
  { name: "Abaya Moden Layla", slug: "abaya-moden-layla", price: "269.00", cat: "abaya", feat: false, v: [{ color: "Mocha", size: "M", stock: 12 }, { color: "Mocha", size: "L", stock: 7 }, { color: "Black", size: "L", stock: 4 }] },
  { name: "Abaya Premium Sarah", slug: "abaya-premium-sarah", price: "399.00", cat: "abaya", feat: false, v: [{ color: "Black", size: "S", stock: 5 }, { color: "Black", size: "M", stock: 8 }, { color: "Black", size: "L", stock: 3 }] },
  { name: "Brooch Emas Gold", slug: "brooch-emas-gold", price: "29.90", cat: "aksesori", feat: false, v: [{ color: "Gold", size: null, stock: 40 }, { color: "Rose Gold", size: null, stock: 2 }] },
  { name: "Shawl Magnet Set", slug: "shawl-magnet-set", price: "24.90", cat: "aksesori", feat: false, v: [{ color: "Ivory", size: null, stock: 33 }, { color: "Black", size: null, stock: 0 }] },
  { name: "Tudung Pin Set", slug: "tudung-pin-set", price: "19.90", cat: "aksesori", feat: false, v: [{ color: "Gold", size: null, stock: 60 }, { color: "Silver", size: null, stock: 28 }] },
  { name: "Handbag Serut Kecil", slug: "handbag-serut-kecil", price: "89.00", cat: "aksesori", feat: false, v: [{ color: "Mocha", size: null, stock: 15 }, { color: "Black", size: null, stock: 4 }, { color: "Cream", size: null, stock: 9 }] },
];

export const FALLBACK_COLORS = ["Sage", "Ivory", "Mocha", "Black", "Emerald", "Rose"];
export const FALLBACK_SIZES = ["S", "M", "L"];

export const FALLBACK_CATEGORIES: { name: string; slug: string }[] = [
  { name: "Tudung", slug: "tudung" },
  { name: "Baju Kurung", slug: "baju-kurung" },
  { name: "Dress", slug: "dress" },
  { name: "Abaya", slug: "abaya" },
  { name: "Aksesori", slug: "aksesori" },
];

function toSummary(product: ProductSeed): ProductSummary {
  const colors = [...new Set(product.v.map((variant) => variant.color).filter(Boolean))] as string[];
  const sizes = [...new Set(product.v.map((variant) => variant.size).filter(Boolean))] as string[];
  const stocks = product.v.map((variant) => variant.stock);

  return {
    id: product.slug,
    name: product.name,
    slug: product.slug,
    price: product.price,
    image: `https://picsum.photos/seed/maisara-${product.slug}/600/750`,
    category: { name: FALLBACK_CATEGORIES.find((c) => c.slug === product.cat)?.name ?? product.cat, slug: product.cat },
    colors,
    sizes,
    minStock: stocks.length > 0 ? Math.min(...stocks) : 0,
    avgRating: null,
    reviewCount: 0,
  };
}

/** Versi fallback listProducts - mirror filter/sort/pagination service sebenar. */
export function fallbackListProducts(query: ProductQuery): ProductListResult {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 12;

  let filtered = FALLBACK_PRODUCTS.filter((product) => {
    if (query.category && product.cat !== query.category) return false;
    if (query.search) {
      const needle = query.search.toLowerCase();
      if (!product.name.toLowerCase().includes(needle)) return false;
    }
    if (query.minPrice != null && Number(product.price) < query.minPrice) return false;
    if (query.maxPrice != null && Number(product.price) > query.maxPrice) return false;
    if (query.color && !product.v.some((variant) => variant.color === query.color)) return false;
    if (query.size && !product.v.some((variant) => variant.size === query.size)) return false;
    return true;
  });

  switch (query.sort ?? "popular") {
    case "price-asc":
      filtered = [...filtered].sort((a, b) => Number(a.price) - Number(b.price));
      break;
    case "price-desc":
      filtered = [...filtered].sort((a, b) => Number(b.price) - Number(a.price));
      break;
    case "newest":
      filtered = [...filtered].reverse();
      break;
    default:
      // popular: kekal susunan seed (featured dahulu)
      filtered = [...filtered].sort((a, b) => Number(b.feat) - Number(a.feat));
  }

  const total = filtered.length;
  const items = filtered.slice((page - 1) * pageSize, page * pageSize).map(toSummary);

  return { items, total, page, pageSize };
}
