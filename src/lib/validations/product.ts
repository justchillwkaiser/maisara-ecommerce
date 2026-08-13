import { z } from "zod";

/**
 * Validasi query katalog (API.md section 2 - GET /api/products).
 * Semua param optional; coerce untuk nilai dari URLSearchParams (string).
 */
export const productSortValues = ["popular", "price-asc", "price-desc", "newest"] as const;
export type ProductSort = (typeof productSortValues)[number];

/**
 * Query katalog sebagai interface longgar: semua field optional supaya
 * service boleh dipanggil terus (cth. listProducts({ page: 1, pageSize: 12 })).
 * Output schema (dengan default) tetap assignable kepada interface ini.
 */
export interface ProductQuery {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  size?: string;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
}

export const productQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  sort: z.enum(productSortValues).default("popular"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(24).default(12),
});

export type ProductQueryParsed = z.infer<typeof productQuerySchema>;

/**
 * Validasi create produk admin (API.md section 7 - POST /api/products).
 * Digunakan oleh Task 12; disediakan awal supaya kontrak lengkap.
 */
export const productCreateSchema = z.object({
  name: z.string().min(3, "Nama produk sekurang-kurangnya 3 aksara."),
  slug: z.string().optional(),
  description: z.string().min(10, "Penerangan sekurang-kurangnya 10 aksara."),
  price: z.coerce
    .number()
    .positive("Harga mesti positif.")
    .max(99999.99, "Harga maksimum RM 99,999.99."),
  categoryId: z.string().min(1, "Kategori diperlukan."),
  images: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  variants: z
    .array(
      z.object({
        color: z.string().optional(),
        size: z.string().optional(),
        sku: z.string().min(2, "SKU sekurang-kurangnya 2 aksara."),
        stock: z.number().int().min(0).default(0),
      }),
    )
    .default([]),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;

/**
 * Validasi update produk admin (API.md section 7 - PATCH /api/products/[id]).
 * Semua field optional; `isActive` hanya untuk edit (soft delete toggle).
 * `variants` optional - jika hadir, senarai variants digantikan (sync ikut SKU).
 */
export const productUpdateSchema = z.object({
  name: z.string().min(3, "Nama produk sekurang-kurangnya 3 aksara.").optional(),
  slug: z.string().optional(),
  description: z.string().min(10, "Penerangan sekurang-kurangnya 10 aksara.").optional(),
  price: z.coerce
    .number()
    .positive("Harga mesti positif.")
    .max(99999.99, "Harga maksimum RM 99,999.99.")
    .optional(),
  categoryId: z.string().min(1, "Kategori diperlukan.").optional(),
  images: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  variants: z
    .array(
      z.object({
        color: z.string().optional(),
        size: z.string().optional(),
        sku: z.string().min(2, "SKU sekurang-kurangnya 2 aksara."),
        stock: z.number().int().min(0).default(0),
      }),
    )
    .optional(),
});

export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
