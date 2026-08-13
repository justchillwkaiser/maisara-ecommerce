import Link from "next/link";

import { ProductForm } from "@/components/admin/product-form";
import { listCategories } from "@/server/services/product.service";

/**
 * Tambah produk baru (UX.md Flow E - Admin kelola produk).
 * Borang penuh: info asas, imej, variants + stok.
 */
export default async function AdminProdukBaruPage() {
  const categories = await listCategories();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/produk"
          className="text-sm font-medium text-gold hover:text-gold-deep"
        >
          Kembali ke Produk
        </Link>
        <h2 className="mt-2 font-serif text-2xl font-medium text-ink">Tambah Produk</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Lengkapkan maklumat produk dan sekurang-kurangnya satu variant.
        </p>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}
