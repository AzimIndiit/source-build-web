import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-figma-sm border border-figma-border-secondary bg-figma-white px-figma-xl py-figma-lg text-figma-sm font-helvetica placeholder:text-figma-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-figma-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-figma-disabled",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }