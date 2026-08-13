import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductForm } from "@/components/admin/product-form";
import { ApiError } from "@/lib/errors";
import { getAdminProduct, listCategories } from "@/server/services/product.service";

interface AdminProdukEditPageProps {
  params: Promise<{ id: string }>;
}

/** Edit produk sedia ada (PATCH /api/products/[id] dari borang). */
export default async function AdminProdukEditPage({ params }: AdminProdukEditPageProps) {
  const { id } = await params;

  let product;
  try {
    product = await getAdminProduct(id);
  } catch (error) {
    if (error instanceof ApiError && error.code === "NOT_FOUND") {
      notFound();
    }
    throw error;
  }

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
        <h2 className="mt-2 font-serif text-2xl font-medium text-ink">Edit Produk</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Kemas kini maklumat produk, variants dan stok.
        </p>
      </div>

      <ProductForm categories={categories} product={product} />
    </div>
  );
}
