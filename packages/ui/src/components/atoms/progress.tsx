"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const progressVariants = cva("relative w-full overflow-hidden rounded-full bg-muted", {
  variants: {
    size: {
      sm: "h-1.5",
      default: "h-2.5",
      lg: "h-3.5",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const progressIndicatorVariants = cva("h-full w-full flex-1 transition-transform", {
  variants: {
    variant: {
      default: "bg-primary",
      success: "bg-emerald-500",
      warning: "bg-amber-500",
      destructive: "bg-destructive",
      info: "bg-sky-500",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export type ProgressProps = React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> &
  VariantProps<typeof progressVariants> &
  VariantProps<typeof progressIndicatorVariants> & {
    max?: number;
    showValueLabel?: boolean;
    labelClassName?: string;
  };

const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(
  (
    {
      className,
      size,
      variant,
      value = 0,
      max = 100,
      showValueLabel = false,
      labelClassName,
      ...props
    },
    ref,
  ) => {
    const normalizedMax = max <= 0 ? 100 : max;
    const clampedValue = Math.min(Math.max(value ?? 0, 0), normalizedMax);
    const percentage = (clampedValue / normalizedMax) * 100;

    return (
      <div className="w-full space-y-1.5">
        <ProgressPrimitive.Root
          ref={ref}
          max={normalizedMax}
          value={clampedValue}
          className={cn(progressVariants({ size }), className)}
          {...props}
        >
          <ProgressPrimitive.Indicator
            className={cn(progressIndicatorVariants({ variant }))}
            style={{ transform: `translateX(-${100 - percentage}%)` }}
          />
        </ProgressPrimitive.Root>
        {showValueLabel ? (
          <p className={cn("text-xs text-muted-foreground", labelClassName)}>{Math.round(percentage)}%</p>
        ) : null}
      </div>
    );
  },
);

Progress.displayName = "Progress";

export { Progress, progressVariants, progressIndicatorVariants };
