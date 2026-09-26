import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * MAISARA button.
 *
 * Radius is deliberately near-square (2px) per the design system: this is an
 * editorial label, not a SaaS control. Sizes are built around the 44px minimum
 * touch target; only the explicitly compact sizes drop below it, and those are
 * reserved for dense surfaces such as the admin tables and the quantity stepper.
 */
const buttonVariants = cva(
  [
    "group/button inline-flex shrink-0 items-center justify-center rounded-xs border border-transparent",
    "font-medium uppercase tracking-[0.14em] whitespace-nowrap",
    "transition-[background-color,border-color,color,opacity] duration-(--dur-base) ease-out",
    "outline-none select-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
    "disabled:pointer-events-none disabled:opacity-45",
    "aria-invalid:border-oxblood aria-invalid:ring-oxblood/30",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-ink text-paper hover:bg-cocoa",
        outline:
          "border-ink/25 text-ink hover:border-ink hover:bg-bone",
        secondary: "bg-bone text-ink hover:bg-bone-deep",
        ghost: "text-ink hover:bg-bone",
        destructive: "bg-oxblood text-paper hover:bg-oxblood/85",
        link: "text-ink underline-offset-4 hover:underline",
      },
      size: {
        // 44px default target.
        default: "h-11 gap-2 px-6 text-[0.6875rem]",
        sm: "h-9 gap-1.5 px-4 text-[0.625rem]",
        lg: "h-13 gap-2.5 px-8 text-xs",
        // Compact controls — dense/admin surfaces only.
        xs: "h-7 gap-1 px-2.5 text-[0.625rem] [&_svg:not([class*='size-'])]:size-3",
        icon: "size-11",
        "icon-sm": "size-9",
        "icon-xs": "size-7",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
