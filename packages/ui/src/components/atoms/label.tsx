import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const labelVariants = cva(
  "select-none font-medium leading-none text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
  {
    variants: {
      size: {
        default: "text-sm",
        sm: "text-xs",
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
