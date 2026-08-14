"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { productCreateSchema, type ProductCreateInput } from "@/lib/validations/product";
import { cn } from "@/lib/utils";

/** Slug auto-generate (sama dengan service: lowercase, hyphen). */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface ProductFormVariant {
  id?: string;
  color: string | null;
  size: string | null;
  sku: string;
  stock: number;
}

export interface ProductFormProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  images: string[];
  categoryId: string;
  featured: boolean;
  isActive: boolean;
  variants: ProductFormVariant[];
}

interface ProductFormProps {
  categories: Array<{ id: string; name: string }>;
  product?: ProductFormProduct;
}

/**
 * Borang produk admin (DESIGN.md 8 - Admin Panel, UX.md Flow E).
 * Info asas + variants dynamic list (min 1). Submit -> POST /api/products
 * (baru) atau PATCH /api/products/[id] (edit). SKU_EXISTS -> toast + inline.
 */
export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = Boolean(product);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [imagesText, setImagesText] = useState(product?.images.join("\n") ?? "");

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProductCreateInput>({
    // zod v4 coerce (price) menyebabkan input/output type divergence;
    // validasi runtime tetap betul via zodResolver.
    resolver: zodResolver(productCreateSchema) as never,
    defaultValues: {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      description: product?.description ?? "",
      price: product ? Number(product.price) : undefined,
      categoryId: product?.categoryId ?? "",
      featured: product?.featured ?? false,
      variants:
        product && product.variants.length > 0
          ? product.variants.map((variant) => ({
              color: variant.color ?? "",
              size: variant.size ?? "",
              sku: variant.sku,
              stock: variant.stock,
            }))
          : [{ color: "", size: "", sku: "", stock: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "variants" });
  // eslint-disable-next-line react-hooks/incompatible-library -- watch() react-hook-form memang tak boleh dimemoize (false positive React Compiler)
  const name = watch("name");
  const slug = watch("slug") ?? "";
  const slugPreview = slug.trim() ? slug.trim() : slugify(name ?? "");

  async function onSubmit(data: ProductCreateInput) {
    setSubmitting(true);
    setApiError(null);
    try {
      const payload = {
        ...data,
        images: imagesText
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
        ...(isEdit ? { isActive } : {}),
      };

      const response = await fetch(isEdit ? `/api/products/${product!.id}` : "/api/products", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          typeof body?.error?.message === "string" && body.error.message.length > 0
            ? body.error.message
            : "Gagal menyimpan produk. Sila cuba lagi.";
        toast.error(message);
        if (body?.error?.code === "SKU_EXISTS" || body?.error?.code === "SLUG_EXISTS") {
          setApiError(message);
        }
        return;
      }

      toast.success(isEdit ? "Produk dikemas kini." : "Produk berjaya ditambah.");
      router.push("/admin/produk");
      router.refresh();
    } catch {
      toast.error("Ralat dalaman. Sila cuba sebentar lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
      {apiError && (
        <div
          role="alert"
          className="rounded-2xl border border-danger/30 bg-danger/5 px-5 py-4 text-sm text-danger"
        >
          {apiError}
        </div>
      )}

      {/* Info asas */}
      <section aria-label="Info asas" className="rounded-2xl border border-line bg-card p-6">
        <h2 className="font-serif text-lg font-medium text-ink">Info Asas</h2>

        <div className="mt-5 grid gap-5">
          <div className="grid gap-1.5">
            <label htmlFor="p-name" className="text-sm font-medium text-ink">
              Nama Produk
            </label>
            <Input
              id="p-name"
              placeholder="cth. Tudung Bawal Premium"
              aria-invalid={Boolean(errors.name)}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-danger">{errors.name.message}</p>
            )}
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="p-slug" className="text-sm font-medium text-ink">
              Slug (URL)
            </label>
            <Input
              id="p-slug"
              placeholder={slugPreview || "auto-generate dari nama"}
              aria-invalid={Boolean(errors.slug)}
              {...register("slug")}
            />
            <p className="text-xs text-ink-soft">
              Kosongkan untuk auto-generate:{" "}
              <span className="tabular-nums text-gold-deep">/produk/{slugPreview || "..."}</span>
            </p>
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="p-desc" className="text-sm font-medium text-ink">
              Penerangan
            </label>
            <textarea
              id="p-desc"
              rows={4}
              placeholder="Penerangan produk sekurang-kurangnya 10 aksara."
              aria-invalid={Boolean(errors.description)}
              className="w-full min-w-0 rounded-xl border border-line bg-card px-3 py-2.5 text-base transition-colors outline-none placeholder:text-ink-soft/70 focus-visible:border-gold focus-visible:ring-3 focus-visible:ring-gold/25 aria-invalid:border-danger md:text-sm"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-danger">{errors.description.message}</p>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <label htmlFor="p-price" className="text-sm font-medium text-ink">
                Harga (RM)
              </label>
              <Input
                id="p-price"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="49.00"
                aria-invalid={Boolean(errors.price)}
                {...register("price", { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="text-xs text-danger">{errors.price.message}</p>
              )}
            </div>

            <div className="grid gap-1.5">
              <label htmlFor="p-category" className="text-sm font-medium text-ink">
                Kategori
              </label>
              <select
                id="p-category"
                aria-invalid={Boolean(errors.categoryId)}
                className="h-10 w-full rounded-xl border border-line bg-card px-3 text-sm transition-colors outline-none focus-visible:border-gold focus-visible:ring-3 focus-visible:ring-gold/25 aria-invalid:border-danger"
                {...register("categoryId")}
              >
                <option value="">Pilih kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-xs text-danger">{errors.categoryId.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <Controller
              control={control}
              name="featured"
              render={({ field }) => (
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                    className="size-4 accent-[var(--gold)]"
                  />
                  Papar sebagai produk pilihan (featured)
                </label>
              )}
            />

            {isEdit && (
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(event) => setIsActive(event.target.checked)}
                  className="size-4 accent-[var(--gold)]"
                />
                Produk aktif (paparkan di kedai)
              </label>
            )}
          </div>
        </div>
      </section>

      {/* Imej */}
      <section aria-label="Imej" className="rounded-2xl border border-line bg-card p-6">
        <h2 className="font-serif text-lg font-medium text-ink">Imej</h2>
        <div className="mt-5 grid gap-1.5">
          <label htmlFor="p-images" className="text-sm font-medium text-ink">
            URL Imej
          </label>
          <textarea
            id="p-images"
            rows={3}
            placeholder={"Satu URL setiap baris\nhttps://example.com/imej-1.jpg"}
            className="w-full min-w-0 rounded-xl border border-line bg-card px-3 py-2.5 text-base transition-colors outline-none placeholder:text-ink-soft/70 focus-visible:border-gold focus-visible:ring-3 focus-visible:ring-gold/25 md:text-sm"
            value={imagesText}
            onChange={(event) => setImagesText(event.target.value)}
          />
          <p className="text-xs text-ink-soft">
            Imej pertama digunakan sebagai gambar utama produk.
          </p>
        </div>
      </section>

      {/* Variants */}
      <section aria-label="Variants" className="rounded-2xl border border-line bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-medium text-ink">Variants & Stok</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ color: "", size: "", sku: "", stock: 0 })}
          >
            <Plus />
            Tambah Variant
          </Button>
        </div>

        {typeof errors.variants?.message === "string" && (
          <p className="mt-3 text-xs text-danger">{errors.variants.message}</p>
        )}

        <ul className="mt-5 space-y-4">
          {fields.map((field, index) => {
            const variantErrors = errors.variants?.[index];
            return (
              <li
                key={field.id}
                className="rounded-xl border border-line bg-surface/40 p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium tracking-wide text-ink-soft uppercase">
                    Variant {index + 1}
                  </p>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={fields.length <= 1}
                    aria-label="Buang variant"
                    className="flex size-7 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-danger/10 hover:text-danger disabled:pointer-events-none disabled:opacity-40"
                  >
                    <Trash size={15} />
                  </button>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="grid gap-1">
                    <label
                      htmlFor={`v-${index}-color`}
                      className="text-xs font-medium text-ink-soft"
                    >
                      Warna
                    </label>
                    <Input
                      id={`v-${index}-color`}
                      placeholder="Sage"
                      {...register(`variants.${index}.color`)}
                    />
                  </div>
                  <div className="grid gap-1">
                    <label
                      htmlFor={`v-${index}-size`}
                      className="text-xs font-medium text-ink-soft"
                    >
                      Saiz
                    </label>
                    <Input
                      id={`v-${index}-size`}
                      placeholder="M (kosong jika tiada)"
                      {...register(`variants.${index}.size`)}
                    />
                  </div>
                  <div className="grid gap-1">
                    <label
                      htmlFor={`v-${index}-sku`}
                      className="text-xs font-medium text-ink-soft"
                    >
                      SKU
                    </label>
                    <Input
                      id={`v-${index}-sku`}
                      placeholder="MAI-BAWAL-SAGE"
                      aria-invalid={Boolean(variantErrors?.sku)}
                      {...register(`variants.${index}.sku`)}
                    />
                    {variantErrors?.sku && (
                      <p className="text-xs text-danger">{variantErrors.sku.message}</p>
                    )}
                  </div>
                  <div className="grid gap-1">
                    <label
                      htmlFor={`v-${index}-stock`}
                      className="text-xs font-medium text-ink-soft"
                    >
                      Stok
                    </label>
                    <Input
                      id={`v-${index}-stock`}
                      type="number"
                      min="0"
                      step="1"
                      aria-invalid={Boolean(variantErrors?.stock)}
                      {...register(`variants.${index}.stock`, { valueAsNumber: true })}
                    />
                    {variantErrors?.stock && (
                      <p className="text-xs text-danger">{variantErrors.stock.message}</p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Produk"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/produk")}
          className={cn("text-ink-soft hover:text-ink")}
        >
          Batal
        </Button>
      </div>
    </form>
  );
}
