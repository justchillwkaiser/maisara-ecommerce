import Image, { type ImageProps } from "next/image";

import { cn } from "@/lib/utils";

/**
 * Placeholder imej yang disengajakan (spesifikasi 23).
 *
 * Bila imej produk tiada, kita TIDAK guna blok warna rawak atau imej stok.
 * Placeholder ini ialah permukaan BONE dengan garis halus dan label mono kecil,
 * jadi ia kelihatan seperti keputusan reka bentuk, bukan UI yang belum siap.
 */
export function ImagePlaceholder({
  label = "Imej belum tersedia",
  className,
  ...props
}: React.ComponentProps<"div"> & { label?: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "flex size-full flex-col items-center justify-center gap-3",
        "border border-line bg-bone",
        className,
      )}
      {...props}
    >
      <span aria-hidden="true" className="h-px w-8 bg-line-strong" />
      <span className="meta-label text-cocoa">{label}</span>
      <span aria-hidden="true" className="h-px w-8 bg-line-strong" />
    </div>
  );
}

export interface ImageFrameProps extends React.ComponentProps<"div"> {
  /** Nisbah aspek CSS, cth. "4 / 5". Imej produk MAISARA ialah 4:5. */
  ratio?: string;
  /** Radius mengikut skala sistem (imej produk: 0–4px). */
  rounded?: "none" | "xs" | "sm" | "md";
}

const RADIUS: Record<NonNullable<ImageFrameProps["rounded"]>, string> = {
  none: "rounded-none",
  xs: "rounded-xs",
  sm: "rounded-sm",
  md: "rounded-md",
};

/**
 * Bingkai imej: mengunci nisbah aspek dan crop supaya semua imej produk
 * konsisten dan tidak pernah herot. Semua imej produk mesti melalui bingkai
 * ini dan bukan <Image> mentah.
 */
export function ImageFrame({
  ratio = "4 / 5",
  rounded = "sm",
  className,
  style,
  children,
  ...props
}: ImageFrameProps) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden bg-bone",
        RADIUS[rounded],
        className,
      )}
      style={{ aspectRatio: ratio, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}

export interface FramedImageProps extends Omit<ImageProps, "fill" | "width" | "height" | "src"> {
  /** Imej; `null` memaparkan placeholder sistem. */
  src: string | null;
  ratio?: string;
  rounded?: ImageFrameProps["rounded"];
  frameClassName?: string;
  /** Dipapar bila `src` kosong. */
  placeholderLabel?: string;
}

/**
 * <Image> dengan bingkai nisbah aspek tetap. `sizes` wajib diberi oleh
 * pemanggil supaya pelayar memilih saiz fail yang betul.
 */
export function FramedImage({
  ratio = "4 / 5",
  rounded = "sm",
  frameClassName,
  className,
  placeholderLabel,
  src,
  alt,
  preload = false,
  ...props
}: FramedImageProps) {
  return (
    <ImageFrame ratio={ratio} rounded={rounded} className={frameClassName}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          preload={preload}
          fetchPriority={preload ? "high" : "auto"}
          className={cn("object-cover", className)}
          {...props}
        />
      ) : (
        <ImagePlaceholder label={placeholderLabel} />
      )}
    </ImageFrame>
  );
}

/**
 * Imej editorial lebar penuh.
 *
 * Menggunakan dimensi intrinsik (bukan `fill`) supaya pelayar tahu nisbah
 * aspek sebelum imej dimuatkan dan tiada anjakan susun atur berlaku. Semua
 * fotografi editorial jenama ialah 1408x768.
 */
export function WideImage({
  src,
  alt,
  preload = false,
  sizes = "(min-width: 1360px) 1360px, 100vw",
  className,
  frameClassName,
}: {
  src: string;
  alt: string;
  preload?: boolean;
  sizes?: string;
  className?: string;
  frameClassName?: string;
}) {
  return (
    <figure
      className={cn(
        "overflow-hidden rounded-sm border border-line bg-bone",
        frameClassName,
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={1408}
        height={768}
        preload={preload}
        fetchPriority={preload ? "high" : "auto"}
        sizes={sizes}
        className={cn("h-auto w-full object-cover", className)}
      />
    </figure>
  );
}
