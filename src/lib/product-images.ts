/**
 * MAISARA IMAGE SYSTEM — satu sumber untuk semua imej sebenar.
 *
 * Aset fotografi jenama berada dalam `public/products` (potret produk 4:5) dan
 * `public/editorial` (editorial 16:9). Tiada imej stok, tiada imej berwatermark
 * dan tiada URL luar digunakan.
 *
 * Galeri produk mengikut konsep yang diminta reka bentuk (spesifikasi 16):
 *   01 HERO       imej kategori yang jelas menunjukkan produk
 *   02 DETAIL     potret makro kain dan jahitan
 *   03 LIFESTYLE  model memakai, suasana sebenar
 * Semua produk dalam satu kategori berkongsi set ini kerana jenama memiliki
 * tiga sudut bagi setiap jenis pakaian. Ganti dengan fotografi setiap produk
 * apabila ia tersedia — hanya peta di bawah perlu dikemas kini.
 */

/* --- Fotografi produk (4:5) --------------------------------------------- */

const HERO_BAJU_KURUNG = "/products/maisara-01.jpg";
const HERO_DRESS = "/products/maisara-02.jpg";
const HERO_TUDUNG = "/products/maisara-03.jpg";
const DETAIL_FABRIC = "/products/maisara-04.jpg";
const LIFESTYLE_ROOM = "/products/maisara-05.jpg";
const LIFESTYLE_WALK = "/products/maisara-06.jpg";

/** Galeri HERO / DETAIL / LIFESTYLE bagi setiap kategori. */
export const CATEGORY_GALLERY = {
  tudung: [HERO_TUDUNG, DETAIL_FABRIC, LIFESTYLE_ROOM],
  "baju-kurung": [HERO_BAJU_KURUNG, DETAIL_FABRIC, LIFESTYLE_ROOM],
  dress: [HERO_DRESS, DETAIL_FABRIC, LIFESTYLE_WALK],
  abaya: [LIFESTYLE_WALK, DETAIL_FABRIC, LIFESTYLE_ROOM],
  aksesori: [HERO_TUDUNG, DETAIL_FABRIC, LIFESTYLE_WALK],
} as const satisfies Record<string, readonly [string, string, string]>;

/** Imej lalai kategori — dipakai apabila produk tidak membawa imej sendiri. */
export const CATEGORY_IMAGES: Record<string, string> = {
  tudung: HERO_TUDUNG,
  "baju-kurung": HERO_BAJU_KURUNG,
  dress: HERO_DRESS,
  abaya: LIFESTYLE_WALK,
  aksesori: HERO_TUDUNG,
};

/**
 * Kategori sebenar setiap slug. Ditulis secara eksplisit kerana nama slug
 * tidak boleh dipercayai: `tudung-pin-set` ialah aksesori dan `shawl-magnet-set`
 * juga aksesori, manakala `shawl-silk-premium` ialah tudung.
 */
export const PRODUCT_CATEGORY: Record<string, keyof typeof CATEGORY_GALLERY> = {
  "tudung-bella-voal": "tudung",
  "tudung-sekolah-arissa": "tudung",
  "shawl-silk-premium": "tudung",
  "tudung-bawal-cotton": "tudung",
  "tudung-satin-luxe": "tudung",

  "baju-kurung-cik-puan": "baju-kurung",
  "baju-kurung-melati": "baju-kurung",
  "baju-kurung-sofea": "baju-kurung",
  "baju-kurung-pahang-lace": "baju-kurung",
  "baju-kurung-ameena": "baju-kurung",

  "dress-kasual-dahlia": "dress",
  "dress-raya-satin": "dress",
  "dress-midi-serenity": "dress",
  "dress-kaftan-zamrud": "dress",

  "abaya-basic-naura": "abaya",
  "abaya-lace-emma": "abaya",
  "abaya-moden-layla": "abaya",
  "abaya-premium-sarah": "abaya",

  "brooch-emas-gold": "aksesori",
  "shawl-magnet-set": "aksesori",
  "tudung-pin-set": "aksesori",
  "handbag-serut-kecil": "aksesori",
};

/** Galeri setiap produk, diterbitkan daripada kategori sebenar produk. */
export const PRODUCT_IMAGES: Record<string, string[]> = Object.fromEntries(
  Object.entries(PRODUCT_CATEGORY).map(([slug, category]) => [
    slug,
    [...CATEGORY_GALLERY[category]],
  ]),
);

/* --- Fotografi editorial (16:9) ----------------------------------------- */

export const EDITORIAL_IMAGES = {
  /** Panorama tiga rupa baju kurung. */
  lookbook: "/editorial/lookbook.jpg",
  /** Atelier: mesin jahit, meja kain, kerja tangan. */
  atelier: "/editorial/atelier.jpg",
  /** Kebaya hijau dalam rumah kayu berukir. */
  heritage: "/editorial/heritage.jpg",
  /** Makro linen berjahit tangan. */
  stitch: "/editorial/stitch.jpg",
  /** Model menyelar tudung di rumah. */
  everyday: "/editorial/everyday.jpg",
  /** Linen terjemur di atas batu. */
  drape: "/editorial/drape.jpg",
  /** Kain terlipat di birai plaster, cahaya tingkap. */
  fold: "/editorial/fold.jpg",
  /** Set berlapis coklat, tingkap rangka gelap. */
  signature: "/editorial/signature.jpg",
} as const;

export type EditorialImage = keyof typeof EDITORIAL_IMAGES;

/* --- Pembantu ----------------------------------------------------------- */

/**
 * Galeri produk: guna fotografi sebenar yang ada dan ulang bila perlu supaya
 * bilangan imej sentiasa konsisten. Pulangkan array kosong apabila produk
 * tidak dikenali — pemanggil memaparkan placeholder sistem.
 */
export function imagesFor(slug: string, count: number): string[] {
  const images = PRODUCT_IMAGES[slug];
  if (!images || images.length === 0) return [];
  if (images.length >= count) return images.slice(0, count);

  const out: string[] = [];
  for (let i = 0; i < count; i += 1) out.push(images[i % images.length]);
  return out;
}

/**
 * Imej utama kad produk: imej pertama galeri, atau imej kategori sebagai
 * sandaran yang masih milik sistem visual MAISARA.
 */
export function primaryImageFor(slug: string, categorySlug?: string): string | null {
  const images = PRODUCT_IMAGES[slug];
  if (images && images.length > 0) return images[0];

  const category = categorySlug ?? PRODUCT_CATEGORY[slug];
  if (category) {
    const categoryImage = CATEGORY_IMAGES[category];
    if (categoryImage) return categoryImage;
  }

  return null;
}

/** Imej hover kad produk: imej kedua galeri, null apabila tiada. */
export function hoverImageFor(slug: string): string | null {
  const images = PRODUCT_IMAGES[slug];
  return images && images.length > 1 ? images[1] : null;
}

/** Imej wira kategori untuk kad kategori dan navigasi. */
export function categoryImageFor(categorySlug: string): string | null {
  return CATEGORY_IMAGES[categorySlug] ?? null;
}
