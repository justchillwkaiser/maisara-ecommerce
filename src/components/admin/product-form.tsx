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

/** Medan admin: 44px, radius 2px, fokus 2px — sama untuk input dan textarea. */
const fieldClass = "h-11 rounded-xs focus-visible:ring-2";
const textareaClass =
  "w-full min-w-0 rounded-xs border border-line bg-paper-lift px-3 py-2.5 text-body-sm text-ink transition-colors outline-none placeholder:text-cocoa/60 focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/20 aria-invalid:border-danger";

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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8"
      noValidate
      aria-busy={submitting}
    >
      {apiError && (
        <div
          role="alert"
          aria-live="polite"
          className="border border-danger/40 bg-bone px-5 py-4 text-body-sm text-oxblood"
        >
          {apiError}
        </div>
      )}

      {/* Info asas */}
      <section aria-labelledby="pf-info" className="border border-line bg-paper-lift p-6">
        <h2 id="pf-info" className="font-display text-h3 text-ink">
          Info Asas
        </h2>

        <div className="mt-6 grid gap-6">
          <div className="grid gap-2">
            <label htmlFor="p-name" className="meta-label text-cocoa">
              Nama Produk
            </label>
            <Input
              id="p-name"
              placeholder="cth. Tudung Bawal Cotton"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "p-name-error" : undefined}
              className={fieldClass}
              {...register("name")}
            />
            {errors.name && (
              <p id="p-name-error" className="text-body-sm text-oxblood">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <label htmlFor="p-slug" className="meta-label text-cocoa">
              Slug (URL)
            </label>
            <Input
              id="p-slug"
              placeholder={slugPreview || "auto-generate dari nama"}
              aria-invalid={Boolean(errors.slug)}
              aria-describedby="p-slug-hint"
              className={fieldClass}
              {...register("slug")}
            />
            <p id="p-slug-hint" className="text-body-sm text-cocoa">
              Kosongkan untuk auto-generate:{" "}
              <span className="font-mono tabular-nums text-ink">
                /produk/{slugPreview || "..."}
              </span>
            </p>
          </div>

          <div className="grid gap-2">
            <label htmlFor="p-desc" className="meta-label text-cocoa">
              Penerangan
            </label>
            <textarea
              id="p-desc"
              rows={4}
              placeholder="Penerangan produk sekurang-kurangnya 10 aksara."
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? "p-desc-error" : undefined}
              className={textareaClass}
              {...register("description")}
            />
            {errors.description && (
              <p id="p-desc-error" className="text-body-sm text-oxblood">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="p-price" className="meta-label text-cocoa">
                Harga (RM)
              </label>
              <Input
                id="p-price"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="49.00"
                aria-invalid={Boolean(errors.price)}
                aria-describedby={errors.price ? "p-price-error" : undefined}
                className={cn(fieldClass, "tabular-nums")}
                {...register("price", { valueAsNumber: true })}
              />
              {errors.price && (
                <p id="p-price-error" className="text-body-sm text-oxblood">
                  {errors.price.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <label htmlFor="p-category" className="meta-label text-cocoa">
                Kategori
              </label>
              <select
                id="p-category"
                aria-invalid={Boolean(errors.categoryId)}
                aria-describedby={errors.categoryId ? "p-category-error" : undefined}
                className="h-11 w-full rounded-xs border border-line bg-paper-lift px-3 text-body-sm text-ink transition-colors outline-none focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/20 aria-invalid:border-danger"
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
                <p id="p-category-error" className="text-body-sm text-oxblood">
                  {errors.categoryId.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <Controller
              control={control}
              name="featured"
              render={({ field }) => (
                <label className="flex cursor-pointer items-center gap-2.5 text-body-sm text-ink">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                    className="size-4 accent-[var(--ink)]"
                  />
                  Papar sebagai produk pilihan (featured)
                </label>
              )}
            />

            {isEdit && (
              <label className="flex cursor-pointer items-center gap-2.5 text-body-sm text-ink">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(event) => setIsActive(event.target.checked)}
                  className="size-4 accent-[var(--ink)]"
                />
                Produk aktif (paparkan di kedai)
              </label>
            )}
          </div>
        </div>
      </section>

      {/* Imej */}
      <section aria-labelledby="pf-imej" className="border border-line bg-paper-lift p-6">
        <h2 id="pf-imej" className="font-display text-h3 text-ink">
          Imej
        </h2>
        <div className="mt-6 grid gap-2">
          <label htmlFor="p-images" className="meta-label text-cocoa">
            URL Imej
          </label>
          <textarea
            id="p-images"
            rows={3}
            placeholder={"Satu URL setiap baris\n/products/maisara-01.jpg"}
            aria-describedby="p-images-hint"
            className={textareaClass}
            value={imagesText}
            onChange={(event) => setImagesText(event.target.value)}
          />
          <p id="p-images-hint" className="text-body-sm text-cocoa">
            Imej pertama digunakan sebagai gambar utama produk.
          </p>
        </div>
      </section>

      {/* Variants */}
      <section aria-labelledby="pf-variants" className="border border-line bg-paper-lift p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="pf-variants" className="font-display text-h3 text-ink">
            Variants &amp; Stok
          </h2>
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
          <p className="mt-3 text-body-sm text-oxblood">{errors.variants.message}</p>
        )}

        <ul className="mt-6 space-y-4">
          {fields.map((field, index) => {
            const variantErrors = errors.variants?.[index];
            return (
              <li key={field.id} className="border border-line bg-bone/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="meta-label text-cocoa">Variant {index + 1}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => remove(index)}
                    disabled={fields.length <= 1}
                    aria-label={`Buang variant ${index + 1}`}
                    className="text-cocoa hover:text-oxblood"
                  >
                    <Trash />
                  </Button>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="grid gap-2">
                    <label
                      htmlFor={`v-${index}-color`}
                      className="meta-label text-cocoa"
                    >
                      Warna
                    </label>
                    <Input
                      id={`v-${index}-color`}
                      placeholder="Sage"
                      className={fieldClass}
                      {...register(`variants.${index}.color`)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor={`v-${index}-size`} className="meta-label text-cocoa">
                      Saiz
                    </label>
                    <Input
                      id={`v-${index}-size`}
                      placeholder="M (kosong jika tiada)"
                      className={fieldClass}
                      {...register(`variants.${index}.size`)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor={`v-${index}-sku`} className="meta-label text-cocoa">
                      SKU
                    </label>
                    <Input
                      id={`v-${index}-sku`}
                      placeholder="MAI-BAWAL-SAGE"
                      aria-invalid={Boolean(variantErrors?.sku)}
                      aria-describedby={
                        variantErrors?.sku ? `v-${index}-sku-error` : undefined
                      }
                      className={cn(fieldClass, "font-mono")}
                      {...register(`variants.${index}.sku`)}
                    />
                    {variantErrors?.sku && (
                      <p
                        id={`v-${index}-sku-error`}
                        className="text-body-sm text-oxblood"
                      >
                        {variantErrors.sku.message}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor={`v-${index}-stock`} className="meta-label text-cocoa">
                      Stok
                    </label>
                    <Input
                      id={`v-${index}-stock`}
                      type="number"
                      min="0"
                      step="1"
                      aria-invalid={Boolean(variantErrors?.stock)}
                      aria-describedby={
                        variantErrors?.stock ? `v-${index}-stock-error` : undefined
                      }
                      className={cn(fieldClass, "tabular-nums")}
                      {...register(`variants.${index}.stock`, { valueAsNumber: true })}
                    />
                    {variantErrors?.stock && (
                      <p
                        id={`v-${index}-stock-error`}
                        className="text-body-sm text-oxblood"
                      >
                        {variantErrors.stock.message}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={submitting} aria-busy={submitting}>
          {submitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Produk"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/produk")}
          className="text-cocoa hover:text-ink"
        >
          Batal
        </Button>
      </div>
    </form>
  );
}
