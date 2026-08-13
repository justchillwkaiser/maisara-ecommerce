import Link from "next/link";

import { AdminProductTable } from "@/components/admin/product-table";
import { listAdminProducts } from "@/server/services/product.service";

/**
 * Senarai produk admin (UX.md section 4 - Produk, DESIGN.md 8).
 * Jadual semua produk (aktif + tidak aktif) dengan search ringkas.
 */
export default async function AdminProdukPage() {
  const products = await listAdminProducts();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-medium text-ink">Produk</h2>
          <p className="mt-1 text-sm text-ink-soft">
            {products.length} produk dalam katalog
          </p>
        </div>
        <Link
          href="/admin/produk/baru"
          className="inline-flex h-10 items-center rounded-full bg-gold px-6 text-sm font-medium text-card transition-colors hover:bg-gold-deep"
        >
          Tambah Produk
        </Link>
      </div>

      <AdminProductTable products={products} />
    </div>
  );
}
