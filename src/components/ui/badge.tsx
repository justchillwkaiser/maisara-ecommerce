import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * Badge MAISARA. Radius 2px — bukan pill (spesifikasi 09).
 * Warna dipilih daripada token sistem sahaja.
 */
const badgeVariants = cva(
  [
    "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 rounded-xs border px-2 py-1",
    "font-mono text-[0.625rem] leading-none tracking-[0.12em] uppercase whitespace-nowrap",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "border-transparent bg-ink text-paper",
        outline: "border-line-strong text-cocoa",
        muted: "border-transparent bg-bone text-cocoa",
        brass: "border-brass/40 bg-transparent text-cocoa",
        clay: "border-clay/50 bg-transparent text-cocoa",
        olive: "border-olive/45 bg-transparent text-cocoa",
        danger: "border-oxblood/45 bg-transparent text-oxblood",
      },
    },
    defaultVariants: {
      variant: "outline",
    },
  },
);

function Badge({
  className,
  variant = "outline",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
