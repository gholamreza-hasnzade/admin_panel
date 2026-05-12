"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const badgeVariants = cva(
  [
    "inline-flex items-center justify-center rounded-full border font-medium touch-manipulation",
    "transition-[color,background-color,border-color,opacity]",
    "whitespace-nowrap",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border bg-transparent text-foreground",
        success: "border-transparent bg-emerald-600/15 text-emerald-700 dark:text-emerald-400",
        warning: "border-transparent bg-amber-500/20 text-amber-700 dark:text-amber-400",
        destructive: "border-transparent bg-destructive/15 text-destructive",
        info: "border-transparent bg-sky-600/15 text-sky-700 dark:text-sky-400",
      },
      size: {
        sm: "h-4 min-h-4 px-1.5 text-[10px] leading-none sm:h-5 sm:min-h-5 sm:px-2 sm:text-[11px]",
        default:
          "h-5 min-h-5 px-2 text-[10px] leading-none sm:h-6 sm:min-h-6 sm:px-2.5 sm:text-xs",
        lg: "h-6 min-h-6 px-2.5 text-xs leading-none sm:h-7 sm:min-h-7 sm:px-3 sm:text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ variant, size }), className)} {...props} />
  ),
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
