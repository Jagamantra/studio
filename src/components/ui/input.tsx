import * as React from "react"

import { cn } from "@/lib/utils"

// Add asChild to the props interface, making it optional
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  asChild?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  // Destructure asChild out so it's not passed to the native input
  ({ className, type, asChild, ...props }, ref) => {
    // The asChild prop is consumed here. If Input were to use Slot itself, it would use it.
    // Since Input directly renders an <input>, asChild's primary role here is to be extracted from ...props.
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

