import type {
  ProductDetail,
  ProductListResult,
  ProductSummary,
  ProductVariantDetail,
} from "@/server/services/product.service";
import type { ProductQuery } from "@/lib/validations/product";

/**
 * Fallback katalog = data seed (prisma/seed.ts) supaya halaman kekal hijau
 * walaupun DATABASE_URL tidak boleh dicapai (cth. dev machine offline).
 * Bila DB hidup, service sebenar (product.service.ts) digunakan.
 * Corak sama seperti lib/categories.ts dan components/shop/featured-products.tsx.
 */

type VariantSeed = { color: string; size: string | null; stock: number };
type ProductSeed = {
  name: string;
  slug: string;
  desc: string;
  price: string;
  cat: string;
  feat: boolean;
  imgs: number;
  v: VariantSeed[];
};

const FALLBACK_PRODUCTS: ProductSeed[] = [
  { name: "Tudung Bella Voal Premium", slug: "tudung-bella-voal", desc: "Voal premium dengan tekstur lembut, tidak panas dan mudah dibentuk. Sesuai untuk kegunaan harian dan majlis.", price: "39.90", cat: "tudung", feat: true, imgs: 4, v: [{ color: "Sage", size: null, stock: 42 }, { color: "Ivory", size: null, stock: 35 }, { color: "Mocha", size: null, stock: 3 }, { color: "Black", size: null, stock: 0 }] },
  { name: "Tudung Sekolah Arissa", slug: "tudung-sekolah-arissa", desc: "Tudung sekolah daripada kain cotton yang selesa dan mudah diselenggara. Sesuai untuk pelajar dan kegunaan harian.", price: "29.90", cat: "tudung", feat: false, imgs: 2, v: [{ color: "Navy", size: null, stock: 80 }, { color: "Black", size: null, stock: 64 }, { color: "Cream", size: null, stock: 2 }] },
  { name: "Shawl Silk Premium", slug: "shawl-silk-premium", desc: "Shawl sutera premium dengan kemasan mewah dan jatuhan kain yang cantik. Pilihan terbaik untuk majlis rasmi.", price: "89.00", cat: "tudung", feat: true, imgs: 3, v: [{ color: "Emerald", size: null, stock: 18 }, { color: "Burgundy", size: null, stock: 12 }, { color: "Gold", size: null, stock: 5 }, { color: "Black", size: null, stock: 26 }] },
  { name: "Tudung Bawal Cotton", slug: "tudung-bawal-cotton", desc: "Tudung bawal daripada kain cotton lembut yang sejuk dipakai. Sesuai untuk aktiviti harian dan cuaca panas.", price: "19.90", cat: "tudung", feat: false, imgs: 2, v: [{ color: "Ivory", size: null, stock: 55 }, { color: "Mocha", size: null, stock: 47 }, { color: "Rose", size: null, stock: 0 }] },
  { name: "Tudung Satin Luxe", slug: "tudung-satin-luxe", desc: "Tudung satin dengan kilauan lembut dan tekstur licin. Memberikan sentuhan elegan pada sebarang gaya.", price: "59.00", cat: "tudung", feat: false, imgs: 3, v: [{ color: "Dusty Pink", size: null, stock: 22 }, { color: "Taupe", size: null, stock: 4 }, { color: "Black", size: null, stock: 31 }] },
  { name: "Baju Kurung Moden Cik Puan", slug: "baju-kurung-cik-puan", desc: "Baju kurung moden dengan potongan kontemporari dan kain berkualiti. Sesuai untuk kerja dan majlis santai.", price: "159.00", cat: "baju-kurung", feat: true, imgs: 4, v: [{ color: "Sage", size: "S", stock: 8 }, { color: "Sage", size: "M", stock: 12 }, { color: "Mocha", size: "S", stock: 6 }, { color: "Mocha", size: "M", stock: 9 }] },
  { name: "Baju Kurung Tradisional Melati", slug: "baju-kurung-melati", desc: "Baju kurung tradisional dengan potongan klasik dan selesa. Sesuai untuk majlis rasmi dan kegunaan harian.", price: "139.00", cat: "baju-kurung", feat: false, imgs: 3, v: [{ color: "Ivory", size: "S", stock: 15 }, { color: "Ivory", size: "M", stock: 4 }, { color: "Ivory", size: "L", stock: 11 }] },
  { name: "Baju Kurung Moden Sofea", slug: "baju-kurung-sofea", desc: "Baju kurung moden dengan butiran lace halus dan potongan yang menyerlahkan siluet. Pilihan untuk majlis.", price: "149.00", cat: "baju-kurung", feat: false, imgs: 3, v: [{ color: "Dusty Pink", size: "S", stock: 7 }, { color: "Dusty Pink", size: "M", stock: 13 }, { color: "Navy", size: "S", stock: 0 }, { color: "Navy", size: "M", stock: 5 }] },
  { name: "Baju Kurung Pahang Lace", slug: "baju-kurung-pahang-lace", desc: "Baju kurung Pahang dengan lace halus di bahagian lengan dan dada. Kemasan kemas untuk majlis rasmi.", price: "169.00", cat: "baju-kurung", feat: false, imgs: 2, v: [{ color: "Cream", size: "M", stock: 10 }, { color: "Cream", size: "L", stock: 6 }, { color: "Beige", size: "M", stock: 2 }] },
  { name: "Baju Kurung Moden Ameena", slug: "baju-kurung-ameena", desc: "Baju kurung moden dengan warna pekat dan fabrik tebal yang kemas. Sesuai untuk suasana formal.", price: "179.00", cat: "baju-kurung", feat: false, imgs: 3, v: [{ color: "Emerald", size: "S", stock: 9 }, { color: "Emerald", size: "M", stock: 14 }, { color: "Emerald", size: "L", stock: 7 }, { color: "Black", size: "M", stock: 0 }] },
  { name: "Dress Kasual Dahlia", slug: "dress-kasual-dahlia", desc: "Dress kasual dengan potongan A-line yang selesa. Sesuai untuk santai, kerja dan acara separa formal.", price: "129.00", cat: "dress", feat: false, imgs: 3, v: [{ color: "Mocha", size: "S", stock: 16 }, { color: "Mocha", size: "M", stock: 21 }, { color: "Sage", size: "S", stock: 4 }, { color: "Sage", size: "M", stock: 18 }] },
  { name: "Dress Raya Satin", slug: "dress-raya-satin", desc: "Dress satin mewah dengan kilauan elegan, sesuai untuk Hari Raya dan majlis istimewa. Potongan flattering.", price: "199.00", cat: "dress", feat: true, imgs: 4, v: [{ color: "Ivory", size: "S", stock: 12 }, { color: "Ivory", size: "M", stock: 8 }, { color: "Ivory", size: "L", stock: 5 }, { color: "Gold", size: "M", stock: 3 }] },
  { name: "Dress Midi Serenity", slug: "dress-midi-serenity", desc: "Dress midi dengan potongan lembut dan kain yang menyerap peluh. Selesa dipakai sepanjang hari.", price: "149.00", cat: "dress", feat: false, imgs: 3, v: [{ color: "Navy", size: "S", stock: 20 }, { color: "Navy", size: "M", stock: 15 }, { color: "Taupe", size: "M", stock: 1 }, { color: "Taupe", size: "L", stock: 0 }] },
  { name: "Dress Kaftan Zamrud", slug: "dress-kaftan-zamrud", desc: "Kaftan dress longgar dengan warna zamrud yang kaya. Sesuai untuk majlis dan percutian.", price: "189.00", cat: "dress", feat: false, imgs: 2, v: [{ color: "Emerald", size: "M", stock: 13 }, { color: "Emerald", size: "L", stock: 9 }, { color: "Black", size: "M", stock: 11 }] },
  { name: "Abaya Basic Naura", slug: "abaya-basic-naura", desc: "Abaya basic dengan potongan lurus dan kemasan kemas. Essential item yang wajib ada untuk gaya harian.", price: "249.00", cat: "abaya", feat: false, imgs: 3, v: [{ color: "Black", size: "S", stock: 25 }, { color: "Black", size: "M", stock: 30 }, { color: "Black", size: "L", stock: 18 }] },
  { name: "Abaya Lace Emma", slug: "abaya-lace-emma", desc: "Abaya dengan lace halus di bahagian tepi dan lengan. Gabungan elegan antara tradisional dan moden.", price: "299.00", cat: "abaya", feat: false, imgs: 4, v: [{ color: "Black", size: "S", stock: 6 }, { color: "Black", size: "M", stock: 9 }, { color: "Navy", size: "S", stock: 2 }, { color: "Navy", size: "M", stock: 0 }] },
  { name: "Abaya Moden Layla", slug: "abaya-moden-layla", desc: "Abaya moden dengan zip tersembunyi dan potongan yang kemas. Sesuai untuk kerja dan acara rasmi.", price: "269.00", cat: "abaya", feat: false, imgs: 3, v: [{ color: "Mocha", size: "M", stock: 12 }, { color: "Mocha", size: "L", stock: 7 }, { color: "Black", size: "L", stock: 4 }] },
  { name: "Abaya Premium Sarah", slug: "abaya-premium-sarah", desc: "Abaya premium daripada fabrik high-twist yang kalis kedut. Kemasan eksklusif untuk penampilan terbaik.", price: "399.00", cat: "abaya", feat: false, imgs: 3, v: [{ color: "Black", size: "S", stock: 5 }, { color: "Black", size: "M", stock: 8 }, { color: "Black", size: "L", stock: 3 }] },
  { name: "Brooch Emas Gold", slug: "brooch-emas-gold", desc: "Brooch emas dengan reka bentuk bunga halus. Pelengkap sempurna untuk tudung dan baju kurung.", price: "29.90", cat: "aksesori", feat: false, imgs: 2, v: [{ color: "Gold", size: null, stock: 40 }, { color: "Rose Gold", size: null, stock: 2 }] },
  { name: "Shawl Magnet Set", slug: "shawl-magnet-set", desc: "Set magnet shawl yang mudah digunakan, tidak perlu pin. Sesuai untuk gaya hijab harian yang cepat.", price: "24.90", cat: "aksesori", feat: false, imgs: 2, v: [{ color: "Ivory", size: null, stock: 33 }, { color: "Black", size: null, stock: 0 }] },
  { name: "Tudung Pin Set", slug: "tudung-pin-set", desc: "Set pin tudung dengan kemasan berkilat dan tahan karat. Datang dalam pek pelbagai reka bentuk.", price: "19.90", cat: "aksesori", feat: false, imgs: 2, v: [{ color: "Gold", size: null, stock: 60 }, { color: "Silver", size: null, stock: 28 }] },
  { name: "Handbag Serut Kecil", slug: "handbag-serut-kecil", desc: "Handbag serut bersaiz kecil dengan tali boleh laras. Sesuai untuk majlis dan kegunaan harian.", price: "89.00", cat: "aksesori", feat: false, imgs: 3, v: [{ color: "Mocha", size: null, stock: 15 }, { color: "Black", size: null, stock: 4 }, { color: "Cream", size: null, stock: 9 }] },
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

/** Review APPROVED seed (fallback PDP) - sama dengan prisma/seed.ts. */
const FALLBACK_REVIEWS: Record<
  string,
  { name: string; rating: number; comment: string; createdAt: string }[]
> = {
  "tudung-bella-voal": [
    {
      name: "Nurul Aisyah",
      rating: 5,
      comment: "Kain selesa dan jahitan kemas. Recommended!",
      createdAt: "2026-08-05",
    },
  ],
  "baju-kurung-cik-puan": [
    {
      name: "Nurul Aisyah",
      rating: 4,
      comment: "Potongan moden dan kain tebal. Sesuai untuk kerja harian.",
      createdAt: "2026-08-04",
    },
  ],
  "dress-raya-satin": [
    {
      name: "Aina Sofea",
      rating: 5,
      comment: "Material premium dan jatuh kain sangat cantik. Memang sesuai untuk majlis.",
      createdAt: "2026-08-03",
    },
  ],
};

function fallbackImage(slug: string, index: number): string {
  return `https://picsum.photos/seed/maisara-${slug}-${index + 1}/600/750`;
}

function toSummary(product: ProductSeed): ProductSummary {
  const colors = [...new Set(product.v.map((variant) => variant.color).filter(Boolean))] as string[];
  const sizes = [...new Set(product.v.map((variant) => variant.size).filter(Boolean))] as string[];
  const stocks = product.v.map((variant) => variant.stock);

  return {
    id: product.slug,
    name: product.name,
    slug: product.slug,
    price: product.price,
    image: fallbackImage(product.slug, 0),
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

/**
 * Versi fallback getProductBySlug - mirror service sebenar. Terima slug ATAU
 * id (fallback guna slug sebagai id), supaya route API /api/products/[id]
 * boleh guna fungsi sama. Return null jika tiada.
 */
export function fallbackGetProductDetail(idOrSlug: string): ProductDetail | null {
  // Fallback guna slug sebagai id, jadi kedua-dua lookup adalah pada slug.
  const product = FALLBACK_PRODUCTS.find((item) => item.slug === idOrSlug);
  if (!product) return null;

  const categoryName =
    FALLBACK_CATEGORIES.find((c) => c.slug === product.cat)?.name ?? product.cat;

  const variants: ProductVariantDetail[] = product.v.map((variant, i) => ({
    id: `${product.slug}-v${i + 1}`,
    color: variant.color,
    size: variant.size,
    sku: `${product.slug.toUpperCase()}-${variant.color?.replace(/\s+/g, "-").toUpperCase() ?? "NA"}`,
    stock: variant.stock,
  }));

  const reviews = (FALLBACK_REVIEWS[product.slug] ?? []).map((review) => ({
    id: `${product.slug}-r-${review.name}`,
    rating: review.rating,
    comment: review.comment,
    createdAt: new Date(review.createdAt),
    user: { name: review.name },
  }));

  const avgRating =
    reviews.length > 0
      ? Math.round(
          (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) * 10,
        ) / 10
      : null;

  return {
    id: product.slug,
    name: product.name,
    slug: product.slug,
    description: product.desc,
    price: product.price,
    images: Array.from({ length: product.imgs }, (_, i) => fallbackImage(product.slug, i)),
    category: { id: product.cat, name: categoryName, slug: product.cat },
    variants,
    reviews,
    avgRating,
    reviewCount: reviews.length,
  };
}

/** Produk berkaitan (PDP): kategori sama, exclude semasa, limit 4. */
export function fallbackRelatedProducts(slug: string, categorySlug: string): ProductSummary[] {
  return FALLBACK_PRODUCTS.filter(
    (product) => product.cat === categorySlug && product.slug !== slug,
  )
    .slice(0, 4)
    .map(toSummary);
}
