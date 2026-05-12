"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cva, type VariantProps } from "class-variance-authority";

import { CheckIcon } from "../../icons";
import { cn } from "../../lib/utils";
import { Label } from "./label";

const checkboxVariants = cva(
  [
    "peer shrink-0 touch-manipulation rounded-sm border transition-[color,box-shadow,border-color,background-color,opacity]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "hover:border-ring/70",
    "data-[state=checked]:hover:opacity-90",
    "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "size-3 sm:size-3.5",
        default: "size-3.5 sm:size-4",
        lg: "size-4 sm:size-5",
      },
      state: {
        default: "border-input bg-background",
        error: "border-destructive data-[state=checked]:bg-destructive data-[state=checked]:border-destructive",
        success: "border-emerald-500 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600",
        warning: "border-amber-500 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500",
      },
    },
    defaultVariants: {
      size: "default",
      state: "default",
    },
  },
);

export type CheckboxProps = Omit<
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
  "size"
> &
  VariantProps<typeof checkboxVariants> & {
    label?: React.ReactNode;
    hint?: React.ReactNode;
    error?: React.ReactNode;
    containerClassName?: string;
  };

const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(
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
    const checkboxId = id ?? generatedId;
    const hintId = hint ? `${checkboxId}-hint` : undefined;
    const errorId = error ? `${checkboxId}-error` : undefined;
    const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
    const fieldState = error ? "error" : state ?? "default";
    const labelSize = size === "sm" ? "sm" : "default";
    const checkIconClass =
      size === "lg"
        ? "size-3.5 sm:size-4"
        : size === "sm"
          ? "size-2.5 sm:size-3"
          : "size-3 sm:size-3.5";

    return (
      <div className={cn("flex w-full flex-col gap-1 sm:gap-1.5", containerClassName)}>
        <div className="flex items-start gap-2 sm:gap-2.5">
          <CheckboxPrimitive.Root
            ref={ref}
            id={checkboxId}
            disabled={disabled}
            required={required}
            aria-describedby={describedBy}
            className={cn(checkboxVariants({ size, state: fieldState }), className)}
            {...props}
          >
            <CheckboxPrimitive.Indicator className="flex items-center justify-center">
              <CheckIcon className={checkIconClass} />
            </CheckboxPrimitive.Indicator>
          </CheckboxPrimitive.Root>

          {label ? (
            <Label
              htmlFor={checkboxId}
              size={labelSize}
              className={cn(disabled && "cursor-not-allowed opacity-70")}
            >
              {label}
              {required ? <span className="ms-1 text-destructive">*</span> : null}
            </Label>
          ) : null}
        </div>

        {error ? (
          <p id={errorId} className="text-[10px] leading-snug text-destructive sm:text-xs">
            {error}
          </p>
        ) : hint ? (
          <p
            id={hintId}
            className={cn(
              "leading-snug text-muted-foreground",
              size === "sm" ? "text-[10px] sm:text-[11px]" : "text-[10px] sm:text-xs",
            )}
          >
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);
Checkbox.displayName = "Checkbox";

export { Checkbox, checkboxVariants };
