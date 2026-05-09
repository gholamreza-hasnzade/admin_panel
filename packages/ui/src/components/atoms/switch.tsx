"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";
import { Label } from "./label";

const switchVariants = cva(
  [
    "peer group relative inline-flex shrink-0 cursor-pointer items-center rounded-full border transition-[color,box-shadow,border-color,background-color,opacity]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "h-5 w-9",
        default: "h-6 w-11",
        lg: "h-7 w-12",
      },
      state: {
        default: "border-input bg-muted data-[state=checked]:border-primary data-[state=checked]:bg-primary",
        error:
          "border-destructive bg-muted data-[state=checked]:border-destructive data-[state=checked]:bg-destructive",
        success:
          "border-emerald-500 bg-emerald-500/10 data-[state=checked]:border-emerald-600 data-[state=checked]:bg-emerald-600",
        warning:
          "border-amber-500 bg-amber-500/10 data-[state=checked]:border-amber-500 data-[state=checked]:bg-amber-500",
      },
    },
    defaultVariants: {
      size: "default",
      state: "default",
    },
  },
);

const switchThumbVariants = cva("block rounded-full bg-white shadow-sm transition-transform", {
  variants: {
    size: {
      sm: "size-4 data-[state=checked]:-translate-x-4 data-[state=unchecked]:-translate-x-0.5",
      default: "size-5 data-[state=checked]:-translate-x-5 data-[state=unchecked]:-translate-x-0.5",
      lg: "size-6 data-[state=checked]:-translate-x-5 data-[state=unchecked]:-translate-x-0.5",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export type SwitchProps = React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> &
  VariantProps<typeof switchVariants> & {
    label?: React.ReactNode;
    hint?: React.ReactNode;
    error?: React.ReactNode;
    containerClassName?: string;
  };

const Switch = React.forwardRef<React.ComponentRef<typeof SwitchPrimitive.Root>, SwitchProps>(
  (
    {
      className,
      containerClassName,
      size,
      state,
      label,
      hint,
      error,
      id,
      required,
      disabled,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const switchId = id ?? generatedId;
    const hintId = hint ? `${switchId}-hint` : undefined;
    const errorId = error ? `${switchId}-error` : undefined;
    const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
    const fieldState = error ? "error" : state ?? "default";
    const labelSize = size === "sm" ? "sm" : "default";

    return (
      <div className={cn("flex w-full flex-col gap-1.5", containerClassName)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5 text-right">
            {label ? (
              <Label htmlFor={switchId} size={labelSize} className={cn(disabled && "cursor-not-allowed opacity-70")}>
                {label}
                {required ? (
                  <span className="ms-1 font-semibold text-red-600 dark:text-red-400" aria-hidden>
                    *
                  </span>
                ) : null}
              </Label>
            ) : null}
            {!error && hint ? (
              <p id={hintId} className={cn("text-muted-foreground", size === "sm" ? "text-[11px]" : "text-xs")}>
                {hint}
              </p>
            ) : null}
          </div>

          <SwitchPrimitive.Root
            ref={ref}
            id={switchId}
            dir="rtl"
            disabled={disabled}
            required={required}
            aria-describedby={describedBy}
            className={cn(switchVariants({ size, state: fieldState }), "hover:opacity-90", className)}
            {...props}
          >
            <SwitchPrimitive.Thumb className={cn(switchThumbVariants({ size }))} />
          </SwitchPrimitive.Root>
        </div>

        {error ? (
          <p id={errorId} className="text-xs text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
Switch.displayName = "Switch";

export { Switch, switchThumbVariants, switchVariants };
