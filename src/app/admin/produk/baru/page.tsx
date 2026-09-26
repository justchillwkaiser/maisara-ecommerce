import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

import { ProductForm } from "@/components/admin/product-form";
import { listCategories } from "@/server/services/product.service";

/**
 * Tambah produk baru (UX.md Flow E - Admin kelola produk).
 * Borang penuh: info asas, imej, variants + stok.
 */
export default async function AdminProdukBaruPage() {
  const categories = await listCategories();

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/produk"
          className="meta-label inline-flex items-center gap-2 text-cocoa transition-colors duration-(--dur-fast) hover:text-ink"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Kembali ke Produk
        </Link>
        <h2 className="mt-4 font-display text-h3 text-ink">Tambah Produk</h2>
        <p className="mt-2 text-body-sm text-cocoa">
          Lengkapkan maklumat produk dan sekurang-kurangnya satu variant.
        </p>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}
