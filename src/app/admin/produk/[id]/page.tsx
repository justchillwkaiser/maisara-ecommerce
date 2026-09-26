import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

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
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/produk"
          className="meta-label inline-flex items-center gap-2 text-cocoa transition-colors duration-(--dur-fast) hover:text-ink"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Kembali ke Produk
        </Link>
        <h2 className="mt-4 font-display text-h3 text-ink">Edit Produk</h2>
        <p className="mt-2 text-body-sm text-cocoa">
          Kemas kini maklumat produk, variants dan stok.
        </p>
      </div>

      <ProductForm categories={categories} product={product} />
    </div>
  );
}
