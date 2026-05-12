import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const labelVariants = cva(
  "select-none touch-manipulation font-medium text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
  {
    variants: {
      size: {
        default: "text-xs leading-snug sm:text-sm sm:leading-none",
        sm: "text-[11px] leading-snug sm:text-xs sm:leading-none",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> &
  VariantProps<typeof labelVariants>;

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, size, ...props }, ref) => (
    <label ref={ref} data-slot="label" className={cn(labelVariants({ size }), className)} {...props} />
  ),
);
Label.displayName = "Label";

export { Label, labelVariants };
