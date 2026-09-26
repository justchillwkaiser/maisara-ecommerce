"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { CaretLeft } from "@phosphor-icons/react";
import { useForm, type FieldErrors } from "react-hook-form";
import { toast } from "sonner";

import { useCart, type CartItemView } from "@/components/shared/cart-context";
import { Button } from "@/components/ui/button";
import { FramedImage } from "@/components/ui/image-frame";
import { Input } from "@/components/ui/input";
import { formatRM } from "@/lib/format";
import { shippingMethods, shippingRates, statesList } from "@/lib/shipping";
import { cn } from "@/lib/utils";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations/order";

/**
 * Borang checkout (spesifikasi 14 + 30).
 * 3 langkah satu halaman: Alamat -> Penghantaran -> Semakan & Bayar.
 * Harga dikira server (POST /api/orders); borang hanya tunjuk kos
 * penghantaran ikut negeri terpilih sebagai anggaran.
 */

const STEPS = ["Alamat", "Penghantaran", "Semakan & Bayar"] as const;

type AddressFieldName =
  | "shippingAddress.name"
  | "shippingAddress.phone"
  | "shippingAddress.postcode"
  | "shippingAddress.address";

interface AddressField {
  name: AddressFieldName;
  id: string;
  label: string;
  placeholder: string;
  type?: "text" | "tel";
  inputMode?: "text" | "tel" | "numeric";
  /** Ruang lebar penuh pada skrin >= sm. */
  full?: boolean;
}

/**
 * Ruang alamat dalam satu senarai supaya label, id dan pengikatan ralat
 * tidak disalin empat kali dan tidak boleh menyimpang.
 */
const ADDRESS_FIELDS: readonly AddressField[] = [
  {
    name: "shippingAddress.name",
    id: "shipping-name",
    label: "Nama Penerima",
    placeholder: "Nama penuh",
    full: true,
  },
  {
    name: "shippingAddress.phone",
    id: "shipping-phone",
    label: "Nombor Telefon",
    placeholder: "0123456789",
    type: "tel",
    inputMode: "tel",
  },
  {
    name: "shippingAddress.postcode",
    id: "shipping-postcode",
    label: "Poskod",
    placeholder: "40000",
    inputMode: "numeric",
  },
  {
    name: "shippingAddress.address",
    id: "shipping-address",
    label: "Alamat Lengkap",
    placeholder: "No. rumah, nama jalan, taman",
    full: true,
  },
];

const ADDRESS_FIELD_NAMES = ADDRESS_FIELDS.map((field) => field.name);

/**
 * Mesej ralat untuk satu path. Ralat react-hook-form bersarang ialah objek
 * FieldError, bukan string, jadi mesej perlu diambil dari `.message`.
 */
function errorMessage(
  errors: FieldErrors<CheckoutInput>,
  path: string,
): string | undefined {
  const leaf = path
    .split(".")
    .reduce<unknown>(
      (acc, part) =>
        acc && typeof acc === "object"
          ? (acc as Record<string, unknown>)[part]
          : undefined,
      errors,
    );
  if (!leaf || typeof leaf !== "object" || !("message" in leaf)) return undefined;
  const message = (leaf as { message?: unknown }).message;
  return typeof message === "string" ? message : undefined;
}

interface CheckoutFormProps {
  items: CartItemView[];
  subtotal: string;
}

export function CheckoutForm({ items, subtotal }: CheckoutFormProps) {
  const router = useRouter();
  // Server mengosongkan beg apabila order dicipta; state cart klien perlu
  // disegerakkan supaya badge/drawer tidak menunjukkan item lama.
  const { refresh: refreshCart } = useCart();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  /** Bertambah setiap kali validasi gagal; mencetuskan fokus ke ringkasan ralat. */
  const [focusRequest, setFocusRequest] = useState(0);
  const summaryRef = useRef<HTMLDivElement>(null);

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

  const stateError = errorMessage(errors, "shippingAddress.state");

  /**
   * Ringkasan ralat langkah semasa (spesifikasi 25): senarai pautan ke ruang
   * yang bermasalah, diumumkan sebagai alert dan difokus selepas validasi gagal.
   */
  const errorSummary = useMemo(() => {
    if (step === 0) {
      return ADDRESS_FIELDS.flatMap((field) => {
        const message = errorMessage(errors, field.name);
        return message ? [{ id: field.id, label: field.label, message }] : [];
      });
    }
    if (step === 1 && errors.shippingMethod?.message) {
      return [
        {
          id: "shipping-method-0",
          label: "Kaedah Penghantaran",
          message: errors.shippingMethod.message,
        },
      ];
    }
    return [];
  }, [errors, step]);

  useEffect(() => {
    if (focusRequest > 0 && errorSummary.length > 0) summaryRef.current?.focus();
  }, [focusRequest, errorSummary.length]);

  async function nextStep() {
    if (step === 0) {
      const ok = await trigger(ADDRESS_FIELD_NAMES);
      if (ok) setStep(1);
      else setFocusRequest((count) => count + 1);
    } else if (step === 1) {
      const ok = await trigger("shippingMethod");
      if (ok) setStep(2);
      else setFocusRequest((count) => count + 1);
    }
  }

  /** Validasi gagal semasa hantar: bawa pengguna ke langkah yang bermasalah. */
  function onInvalid(formErrors: FieldErrors<CheckoutInput>) {
    const hasAddressError = ADDRESS_FIELDS.some((field) =>
      errorMessage(formErrors, field.name),
    );
    if (hasAddressError) setStep(0);
    else if (formErrors.shippingMethod) setStep(1);
    else return;
    setFocusRequest((count) => count + 1);
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
        // Sesi tamat semasa mengisi borang: hantar semula ke log masuk
        // dengan pulangan ke checkout (cart di DB kekal).
        if (response.status === 401) {
          router.push("/log-masuk?next=/checkout");
          return;
        }
        // Beg berubah semasa checkout (checkout lain sudah guna item yang
        // sama): segerakkan beg + papar semula halaman supaya pengguna
        // melihat keadaan sebenar.
        if (body?.error?.code === "CART_CHANGED") {
          void refreshCart();
          router.refresh();
        }
        return;
      }

      const result = (await response.json()) as { redirectUrl: string };
      void refreshCart();
      router.push(result.redirectUrl);
    } catch {
      toast.error("Ralat dalaman. Sila cuba sebentar lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      noValidate
      aria-busy={submitting || undefined}
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14"
    >
      {/* Kiri: borang berperingkat */}
      <div className="min-w-0">
        {/* Penunjuk langkah: label mono, bukan "Step 1/2/3". */}
        <ol className="flex flex-wrap items-center gap-x-5">
          {STEPS.map((label, index) => {
            const done = index < step;
            const active = index === step;
            const marker = `0${index + 1}`;
            return (
              <li key={label} className="flex items-center gap-5">
                {done ? (
                  <button
                    type="button"
                    onClick={() => setStep(index)}
                    className="group inline-flex h-11 items-center gap-2.5 text-ink transition-colors duration-(--dur-fast) hover:text-cocoa"
                  >
                    <span className="meta-label text-cocoa">{marker}</span>
                    <span className="meta-label underline-offset-4 group-hover:underline">
                      {label}
                    </span>
                  </button>
                ) : (
                  <span
                    aria-current={active ? "step" : undefined}
                    className={cn(
                      "inline-flex h-11 items-center gap-2.5",
                      active ? "text-ink" : "text-cocoa/55",
                    )}
                  >
                    <span className="meta-label">{marker}</span>
                    <span className="meta-label">{label}</span>
                  </span>
                )}
                {index < STEPS.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="hidden h-px w-6 bg-line sm:block"
                  />
                ) : null}
              </li>
            );
          })}
        </ol>

        {errorSummary.length > 0 ? (
          <div
            ref={summaryRef}
            tabIndex={-1}
            role="alert"
            aria-labelledby="checkout-error-summary"
            className="mt-8 border border-oxblood/40 bg-paper-lift p-5"
          >
            <p id="checkout-error-summary" className="meta-label text-oxblood">
              Sila semak {errorSummary.length} ruangan
            </p>
            <ul className="mt-3 space-y-2">
              {errorSummary.map((entry) => (
                <li key={entry.id}>
                  <a
                    href={`#${entry.id}`}
                    className="text-body-sm text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink"
                  >
                    {entry.label}:{" "}
                    <span className="text-cocoa">{entry.message}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Langkah 1: Alamat */}
        {step === 0 ? (
          <fieldset className="mt-8 min-w-0">
            <legend className="sr-only">Langkah 1 — Alamat penghantaran</legend>
            <div className="border-t border-line pt-7">
              <p className="meta-label text-cocoa">{`01 / ${STEPS[0]}`}</p>
              <h2 className="mt-3 text-h3 text-ink">Alamat Penghantaran</h2>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {ADDRESS_FIELDS.map((field) => {
                  const message = errorMessage(errors, field.name);
                  const errorId = `${field.id}-error`;
                  return (
                    <div
                      key={field.id}
                      className={cn(
                        "flex flex-col gap-2",
                        field.full && "sm:col-span-2",
                      )}
                    >
                      <label
                        htmlFor={field.id}
                        className="meta-label text-cocoa"
                      >
                        {field.label}
                      </label>
                      <Input
                        id={field.id}
                        type={field.type}
                        inputMode={field.inputMode}
                        placeholder={field.placeholder}
                        aria-invalid={message ? true : undefined}
                        aria-describedby={message ? errorId : undefined}
                        className="h-11 rounded-xs"
                        {...register(field.name)}
                      />
                      {message ? (
                        <p id={errorId} className="text-body-sm text-oxblood">
                          {message}
                        </p>
                      ) : null}
                    </div>
                  );
                })}

                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label htmlFor="shipping-state" className="meta-label text-cocoa">
                    Negeri
                  </label>
                  <select
                    id="shipping-state"
                    aria-invalid={stateError ? true : undefined}
                    aria-describedby={stateError ? "shipping-state-error" : undefined}
                    className={cn(
                      "h-11 w-full rounded-xs border border-line bg-paper-lift px-3 text-body-sm text-ink",
                      "outline-none transition-colors duration-(--dur-fast)",
                      "focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/25",
                      "aria-invalid:border-oxblood aria-invalid:ring-2 aria-invalid:ring-oxblood/20",
                    )}
                    {...register("shippingAddress.state")}
                  >
                    <option value="">Pilih negeri</option>
                    {statesList.map((stateName) => (
                      <option key={stateName} value={stateName}>
                        {stateName}
                      </option>
                    ))}
                  </select>
                  {stateError ? (
                    <p id="shipping-state-error" className="text-body-sm text-oxblood">
                      {stateError}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button type="button" size="lg" onClick={() => void nextStep()}>
                  Teruskan
                </Button>
              </div>
            </div>
          </fieldset>
        ) : null}

        {/* Langkah 2: Penghantaran */}
        {step === 1 ? (
          <fieldset className="mt-8 min-w-0">
            <legend className="sr-only">Langkah 2 — Kaedah penghantaran</legend>
            <div className="border-t border-line pt-7">
              <p className="meta-label text-cocoa">{`02 / ${STEPS[1]}`}</p>
              <h2 className="mt-3 text-h3 text-ink">Kaedah Penghantaran</h2>
              <p className="mt-3 text-body-sm text-cocoa">
                {state
                  ? `Kos untuk penghantaran ke ${state}.`
                  : "Pilih negeri dahulu di langkah Alamat."}
              </p>

              <div className="mt-6 grid gap-px border border-line bg-line sm:grid-cols-2">
                {methods.map((method, index) => {
                  const active = shippingMethod === method.id;
                  const fee = state ? shippingRates(method.id, state) : null;
                  return (
                    <label
                      key={method.id}
                      className={cn(
                        "flex cursor-pointer flex-col gap-2 bg-paper-lift p-5",
                        "transition-colors duration-(--dur-fast)",
                        "focus-within:ring-2 focus-within:ring-ink",
                        active ? "bg-bone" : "hover:bg-bone/60",
                      )}
                    >
                      <input
                        id={`shipping-method-${index}`}
                        type="radio"
                        value={method.id}
                        className="sr-only"
                        {...register("shippingMethod")}
                      />
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="flex items-center gap-3">
                          <span
                            aria-hidden="true"
                            className={cn(
                              "size-2 shrink-0 rounded-full",
                              active ? "bg-ink" : "border border-line-strong",
                            )}
                          />
                          <span className="font-display text-lg leading-tight text-ink">
                            {method.label}
                          </span>
                        </span>
                        <span className="font-mono text-body-sm tabular-nums text-ink">
                          {fee != null ? formatRM(fee) : "Pilih negeri"}
                        </span>
                      </span>
                      <span className="meta-label pl-5 text-cocoa">
                        {method.eta}
                      </span>
                    </label>
                  );
                })}
              </div>
              {errors.shippingMethod ? (
                <p className="mt-3 text-body-sm text-oxblood">
                  {errors.shippingMethod.message}
                </p>
              ) : null}

              <div className="mt-8 flex items-center justify-between gap-4">
                <Button type="button" variant="ghost" onClick={() => setStep(0)}>
                  <CaretLeft size={16} aria-hidden="true" /> Kembali
                </Button>
                <Button type="button" size="lg" onClick={() => void nextStep()}>
                  Teruskan
                </Button>
              </div>
            </div>
          </fieldset>
        ) : null}

        {/* Langkah 3: Semakan & Bayar */}
        {step === 2 ? (
          <fieldset className="mt-8 min-w-0">
            <legend className="sr-only">Langkah 3 — Semakan dan bayaran</legend>
            <div className="border-t border-line pt-7">
              <p className="meta-label text-cocoa">{`03 / ${STEPS[2]}`}</p>
              <h2 className="mt-3 text-h3 text-ink">Semakan &amp; Bayar</h2>

              <dl className="mt-6 divide-y divide-line border-y border-line">
                <div className="flex flex-col gap-2 py-5">
                  <dt className="meta-label text-cocoa">Alamat Penghantaran</dt>
                  <dd className="text-body-sm text-ink">
                    {address?.name}
                    <span className="text-cocoa">, {address?.phone}</span>
                  </dd>
                  <dd className="text-body-sm text-cocoa">
                    {address?.address}, {address?.postcode} {address?.state}
                  </dd>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-3 py-5">
                  <dt className="meta-label text-cocoa">Penghantaran</dt>
                  <dd className="text-body-sm text-ink">
                    {shippingMethod}
                    <span className="text-cocoa">
                      , {formatRM(shippingFee ?? 0)}
                    </span>
                  </dd>
                </div>
              </dl>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                  <CaretLeft size={16} aria-hidden="true" /> Kembali
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting}
                  aria-busy={submitting || undefined}
                >
                  {submitting ? "Memproses…" : "Bayar Sekarang"}
                </Button>
              </div>
            </div>
          </fieldset>
        ) : null}
      </div>

      {/* Kanan: ringkasan order (sticky) */}
      <aside
        aria-labelledby="ringkasan-order-checkout"
        className="lg:sticky lg:top-24 lg:self-start"
      >
        <div className="border border-line bg-bone p-6">
          <h2 id="ringkasan-order-checkout" className="meta-label text-cocoa">
            Ringkasan Order
          </h2>

          <ul className="mt-5 divide-y divide-line border-y border-line">
            {items.map((item) => (
              <li key={item.id} className="flex gap-4 py-4">
                <FramedImage
                  src={item.image}
                  alt=""
                  sizes="48px"
                  rounded="xs"
                  frameClassName="w-12 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-body leading-snug text-ink">
                    {item.product.name}
                  </p>
                  <p className="meta-label mt-1 text-cocoa">
                    {[item.variant.color, item.variant.size]
                      .filter(Boolean)
                      .join(" / ") || "Standard"}
                  </p>
                  <p className="mt-1 font-mono text-body-sm tabular-nums text-cocoa">
                    {item.quantity} × {formatRM(item.unitPrice)}
                  </p>
                </div>
                <p className="font-mono text-body-sm tabular-nums text-ink">
                  {formatRM(item.lineTotal)}
                </p>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-2.5">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-body-sm text-cocoa">Subtotal</dt>
              <dd className="font-mono text-body-sm tabular-nums text-ink">
                {formatRM(subtotal)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-body-sm text-cocoa">Penghantaran</dt>
              <dd className="font-mono text-body-sm tabular-nums text-ink">
                {shippingFee != null ? formatRM(shippingFee) : "Belum dipilih"}
              </dd>
            </div>
          </dl>

          <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-line-strong pt-5">
            <span className="meta-label text-cocoa">Jumlah</span>
            <span className="font-display text-h3 tabular-nums text-ink">
              {formatRM(total)}
            </span>
          </div>
        </div>
      </aside>
    </form>
  );
}
