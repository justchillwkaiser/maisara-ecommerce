"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { CaretLeft, Check } from "@phosphor-icons/react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CartItemView } from "@/components/shared/cart-context";
import { formatRM } from "@/lib/format";
import { shippingMethods, shippingRates, statesList } from "@/lib/shipping";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations/order";
import { cn } from "@/lib/utils";

/**
 * Borang checkout (DESIGN.md 8, UX.md 4).
 * 3 langkah satu halaman: Alamat -> Penghantaran -> Semakan & Bayar.
 * Harga dikira server (POST /api/orders); borang hanya tunjuk kos
 * penghantaran ikut negeri terpilih sebagai anggaran.
 */

const STEPS = ["Alamat", "Penghantaran", "Semakan & Bayar"] as const;

const ADDRESS_FIELDS = [
  "shippingAddress.name",
  "shippingAddress.phone",
  "shippingAddress.address",
  "shippingAddress.state",
  "shippingAddress.postcode",
] as const;

interface CheckoutFormProps {
  items: CartItemView[];
  subtotal: string;
}

export function CheckoutForm({ items, subtotal }: CheckoutFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { shippingMethod: "J&T Express" },
  });

  const methods = shippingMethods();
  // eslint-disable-next-line react-hooks/incompatible-library -- watch() react-hook-form memang tak boleh dimemoize (false positive React Compiler)
  const state = watch("shippingAddress.state");
  const shippingMethod = watch("shippingMethod");
  const address = watch("shippingAddress");

  const subtotalNum = useMemo(() => Number(subtotal), [subtotal]);
  const shippingFee = state ? shippingRates(shippingMethod, state) : null;
  const total = shippingFee != null ? subtotalNum + shippingFee : subtotalNum;

  async function nextStep() {
    if (step === 0) {
      const ok = await trigger([...ADDRESS_FIELDS]);
      if (ok) setStep(1);
    } else if (step === 1) {
      const ok = await trigger("shippingMethod");
      if (ok) setStep(2);
    }
  }

  async function onSubmit(data: CheckoutInput) {
    setSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        cache: "no-store",
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message = body?.error?.message;
        toast.error(
          typeof message === "string" && message.length > 0
            ? message
            : "Gagal mencipta order. Sila cuba lagi.",
        );
        return;
      }

      const result = (await response.json()) as { redirectUrl: string };
      router.push(result.redirectUrl);
    } catch {
      toast.error("Ralat dalaman. Sila cuba sebentar lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  const fieldError = (key: (typeof ADDRESS_FIELDS)[number]) => {
    const message = key.split(".").reduce<unknown>((acc, part) => {
      if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[part];
      return undefined;
    }, errors);
    return typeof message === "string" ? message : undefined;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-10 lg:grid-cols-[1fr_360px]">
      {/* Kiri: borang berperingkat */}
      <div>
        {/* Progress indicator halus (DESIGN.md 8: nama sebenar, bukan Step 1/2/3) */}
        <ol className="flex items-center gap-2">
          {STEPS.map((label, index) => {
            const done = index < step;
            const active = index === step;
            return (
              <li key={label} className="flex flex-1 items-center gap-2">
                <button
                  type="button"
                  onClick={() => index < step && setStep(index)}
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-medium transition-colors",
                    done && "cursor-pointer text-gold-deep",
                    active && "text-ink",
                    !done && !active && "text-ink-soft/60",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full border text-[10px]",
                      done && "border-gold bg-gold text-card",
                      active && "border-gold text-gold",
                      !done && !active && "border-line text-ink-soft/60",
                    )}
                  >
                    {done ? <Check size={12} /> : index + 1}
                  </span>
                  <span className="hidden sm:inline">{label}</span>
                </button>
                {index < STEPS.length - 1 && (
                  <span
                    className={cn(
                      "h-px flex-1",
                      index < step ? "bg-gold" : "bg-line",
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>

        <div className="mt-8">
          {/* Langkah 1: Alamat */}
          {step === 0 && (
            <section aria-labelledby="checkout-alamat">
              <h2 id="checkout-alamat" className="font-serif text-2xl text-ink">
                Alamat Penghantaran
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="shipping-name" className="mb-1.5 block text-sm text-ink">
                    Nama Penerima
                  </label>
                  <Input
                    id="shipping-name"
                    placeholder="Nama penuh"
                    aria-invalid={Boolean(errors.shippingAddress?.name)}
                    {...register("shippingAddress.name")}
                  />
                  {fieldError("shippingAddress.name") && (
                    <p className="mt-1 text-xs text-danger">
                      {fieldError("shippingAddress.name")}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="shipping-phone" className="mb-1.5 block text-sm text-ink">
                    Nombor Telefon
                  </label>
                  <Input
                    id="shipping-phone"
                    type="tel"
                    placeholder="0123456789"
                    aria-invalid={Boolean(errors.shippingAddress?.phone)}
                    {...register("shippingAddress.phone")}
                  />
                  {fieldError("shippingAddress.phone") && (
                    <p className="mt-1 text-xs text-danger">
                      {fieldError("shippingAddress.phone")}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="shipping-postcode" className="mb-1.5 block text-sm text-ink">
                    Poskod
                  </label>
                  <Input
                    id="shipping-postcode"
                    inputMode="numeric"
                    placeholder="40000"
                    aria-invalid={Boolean(errors.shippingAddress?.postcode)}
                    {...register("shippingAddress.postcode")}
                  />
                  {fieldError("shippingAddress.postcode") && (
                    <p className="mt-1 text-xs text-danger">
                      {fieldError("shippingAddress.postcode")}
                    </p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="shipping-address" className="mb-1.5 block text-sm text-ink">
                    Alamat Lengkap
                  </label>
                  <Input
                    id="shipping-address"
                    placeholder="No. rumah, nama jalan, taman"
                    aria-invalid={Boolean(errors.shippingAddress?.address)}
                    {...register("shippingAddress.address")}
                  />
                  {fieldError("shippingAddress.address") && (
                    <p className="mt-1 text-xs text-danger">
                      {fieldError("shippingAddress.address")}
                    </p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="shipping-state" className="mb-1.5 block text-sm text-ink">
                    Negeri
                  </label>
                  <select
                    id="shipping-state"
                    aria-invalid={Boolean(errors.shippingAddress?.state)}
                    className={cn(
                      "h-10 w-full rounded-xl border border-line bg-card px-3 text-sm text-ink outline-none transition-colors",
                      "focus-visible:border-gold focus-visible:ring-3 focus-visible:ring-gold/25",
                      "aria-invalid:border-danger aria-invalid:ring-3 aria-invalid:ring-danger/20",
                    )}
                    {...register("shippingAddress.state")}
                  >
                    <option value="">Pilih negeri</option>
                    {statesList.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {fieldError("shippingAddress.state") && (
                    <p className="mt-1 text-xs text-danger">
                      {fieldError("shippingAddress.state")}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <Button type="button" size="lg" onClick={() => void nextStep()}>
                  Teruskan
                </Button>
              </div>
            </section>
          )}

          {/* Langkah 2: Penghantaran */}
          {step === 1 && (
            <section aria-labelledby="checkout-shipping">
              <h2 id="checkout-shipping" className="font-serif text-2xl text-ink">
                Kaedah Penghantaran
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                {state ? `Kos untuk penghantaran ke ${state}.` : "Pilih negeri dahulu di langkah Alamat."}
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {methods.map((method) => {
                  const active = shippingMethod === method.id;
                  const fee = state ? shippingRates(method.id, state) : null;
                  return (
                    <label
                      key={method.id}
                      className={cn(
                        "cursor-pointer rounded-2xl border p-4 transition-all",
                        active
                          ? "border-gold bg-gold-tint/40 ring-1 ring-gold/30"
                          : "border-line hover:border-gold/50",
                      )}
                    >
                      <input
                        type="radio"
                        value={method.id}
                        className="sr-only"
                        {...register("shippingMethod")}
                      />
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-ink">{method.label}</span>
                        <span className="text-sm font-medium text-gold-deep tabular-nums">
                          {fee != null ? formatRM(fee) : "Pilih negeri"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-ink-soft">{method.eta}</p>
                    </label>
                  );
                })}
              </div>
              {errors.shippingMethod && (
                <p className="mt-2 text-xs text-danger">{errors.shippingMethod.message}</p>
              )}
              <div className="mt-8 flex items-center justify-between">
                <Button type="button" variant="ghost" onClick={() => setStep(0)}>
                  <CaretLeft size={16} /> Kembali
                </Button>
                <Button type="button" size="lg" onClick={() => void nextStep()}>
                  Teruskan
                </Button>
              </div>
            </section>
          )}

          {/* Langkah 3: Semakan & Bayar */}
          {step === 2 && (
            <section aria-labelledby="checkout-review">
              <h2 id="checkout-review" className="font-serif text-2xl text-ink">
                Semakan &amp; Bayar
              </h2>
              <div className="mt-5 rounded-2xl border border-line p-5">
                <h3 className="text-xs font-medium tracking-wide text-ink-soft uppercase">
                  Alamat Penghantaran
                </h3>
                <p className="mt-2 text-sm text-ink">
                  {address?.name}
                  <span className="text-ink-soft">, {address?.phone}</span>
                </p>
                <p className="mt-1 text-sm text-ink-soft">
                  {address?.address}, {address?.postcode} {address?.state}
                </p>
                <div className="mt-4 border-t border-line pt-4">
                  <h3 className="text-xs font-medium tracking-wide text-ink-soft uppercase">
                    Penghantaran
                  </h3>
                  <p className="mt-2 text-sm text-ink">
                    {shippingMethod}
                    <span className="text-ink-soft">, {formatRM(shippingFee ?? 0)}</span>
                  </p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                  <CaretLeft size={16} /> Kembali
                </Button>
                <Button type="submit" size="lg" disabled={submitting}>
                  {submitting ? "Memproses..." : "Bayar Sekarang"}
                </Button>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Kanan: ringkasan order (sticky) */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-line bg-card p-5">
          <h2 className="text-sm font-medium text-ink">Ringkasan Order</h2>
          <ul className="mt-4 space-y-4">
            {items.map((item) => (
              <li key={item.id} className="flex gap-3">
                <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-gold-tint">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.product.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink">{item.product.name}</p>
                  <p className="text-xs text-ink-soft">
                    {[item.variant.color, item.variant.size].filter(Boolean).join(" / ") || "Standard"}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    {item.quantity} x {formatRM(item.unitPrice)}
                  </p>
                </div>
                <p className="text-sm font-medium text-ink tabular-nums">
                  {formatRM(item.lineTotal)}
                </p>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between text-ink-soft">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{formatRM(subtotal)}</dd>
            </div>
            <div className="flex justify-between text-ink-soft">
              <dt>Penghantaran</dt>
              <dd className="tabular-nums">
                {shippingFee != null ? formatRM(shippingFee) : "Belum dipilih"}
              </dd>
            </div>
            <div className="flex justify-between border-t border-line pt-2 text-base font-medium text-ink">
              <dt>Jumlah</dt>
              <dd className="tabular-nums">{formatRM(total)}</dd>
            </div>
          </dl>
        </div>
      </aside>
    </form>
  );
}
