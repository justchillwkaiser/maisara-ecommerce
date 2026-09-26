import Link from "next/link";

import { AdminProductTable } from "@/components/admin/product-table";
import { Button } from "@/components/ui/button";
import { listAdminProducts } from "@/server/services/product.service";

/**
 * Senarai produk admin (UX.md section 4 - Produk, DESIGN.md 8).
 * Jadual semua produk (aktif + tidak aktif) dengan search ringkas.
 */
export default async function AdminProdukPage() {
  const products = await listAdminProducts();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-h3 text-ink">Produk</h2>
          <p className="mt-2 text-body-sm text-cocoa">
            {products.length} produk dalam katalog
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/produk/baru">Tambah Produk</Link>
        </Button>
      </div>

      <AdminProductTable products={products} />
    </div>
  );
}
