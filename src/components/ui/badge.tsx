import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-figma-sm px-figma-md py-figma-xs text-figma-xs font-helvetica font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-figma-primary focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-figma-primary text-figma-white hover:opacity-figma-hover",
        secondary:
          "border-transparent bg-figma-background text-figma-text-primary hover:bg-figma-background/80",
        destructive:
          "border-transparent bg-red-500 text-figma-white hover:bg-red-500/80",
        outline: "text-figma-text-primary border border-figma-border-secondary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }