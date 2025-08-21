import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-figma-md text-figma-sm leading-none font-helvetica font-medium text-figma-text-primary select-none",
        "group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-figma-disabled",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-figma-disabled",
        className
      )}
      {...props}
    />
  )
}

export { Label }
