"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";
import { Label } from "../atoms/label";

const radioVariants = cva(
  [
    "peer shrink-0 rounded-full border transition-[color,box-shadow,border-color,background-color,opacity]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "hover:border-ring/70",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "size-3.5",
        default: "size-4",
        lg: "size-5",
      },
      state: {
        default: "border-input bg-background",
        error: "border-destructive data-[state=checked]:border-destructive",
        success: "border-emerald-500 data-[state=checked]:border-emerald-600",
        warning: "border-amber-500 data-[state=checked]:border-amber-500",
      },
    },
    defaultVariants: {
      size: "default",
      state: "default",
    },
  },
);

const radioIndicatorVariants = cva("rounded-full", {
  variants: {
    size: {
      sm: "size-1.5",
      default: "size-2",
      lg: "size-2.5",
    },
    state: {
      default: "bg-primary",
      error: "bg-destructive",
      success: "bg-emerald-600",
      warning: "bg-amber-500",
    },
  },
  defaultVariants: {
    size: "default",
    state: "default",
  },
});

export type RadioOption = {
  label: React.ReactNode;
  value: string;
  hint?: React.ReactNode;
  disabled?: boolean;
};

export type RadioGroupProps = Omit<
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>,
  "children"
> &
  VariantProps<typeof radioVariants> & {
    label?: React.ReactNode;
    hint?: React.ReactNode;
    error?: React.ReactNode;
    options: RadioOption[];
    containerClassName?: string;
    optionClassName?: string;
  };

const RadioGroup = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(
  (
    {
      className,
      containerClassName,
      optionClassName,
      size,
      state,
      label,
      hint,
      error,
      id,
      required,
      options,
      disabled,
      orientation = "vertical",
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const groupId = id ?? generatedId;
    const hintId = hint ? `${groupId}-hint` : undefined;
    const errorId = error ? `${groupId}-error` : undefined;
    const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
    const fieldState = error ? "error" : state ?? "default";
    const labelSize = size === "sm" ? "sm" : "default";

    return (
      <div className={cn("flex w-full flex-col gap-1.5", containerClassName)}>
        {label ? (
          <Label size={labelSize}>
            {label}
            {required ? <span className="ms-1 text-destructive">*</span> : null}
          </Label>
        ) : null}

        <RadioGroupPrimitive.Root
          ref={ref}
          id={groupId}
          dir="rtl"
          orientation={orientation}
          disabled={disabled}
          required={required}
          aria-describedby={describedBy}
          className={cn(
            "grid gap-2 text-right",
            orientation === "horizontal" && "grid-flow-col auto-cols-max items-start gap-5",
            className,
          )}
          {...props}
        >
          {options.map((option, index) => {
            const optionId = `${groupId}-option-${index}`;
            const optionDisabled = disabled || option.disabled;
            return (
              <div key={option.value} className={cn("flex items-start gap-2.5", optionClassName)}>
                <RadioGroupPrimitive.Item
                  id={optionId}
                  value={option.value}
                  disabled={optionDisabled}
                  className={cn(radioVariants({ size, state: fieldState }))}
                >
                  <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
                    <span className={cn(radioIndicatorVariants({ size, state: fieldState }))} />
                  </RadioGroupPrimitive.Indicator>
                </RadioGroupPrimitive.Item>

                <div className="flex min-w-0 flex-col gap-0.5">
                  <Label htmlFor={optionId} size={labelSize} className={cn(optionDisabled && "cursor-not-allowed opacity-70")}>
                    {option.label}
                  </Label>
                  {option.hint ? (
                    <p className={cn("text-muted-foreground", size === "sm" ? "text-[11px]" : "text-xs")}>
                      {option.hint}
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </RadioGroupPrimitive.Root>

        {error ? (
          <p id={errorId} className="text-xs text-destructive">
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className={cn("text-muted-foreground", size === "sm" ? "text-[11px]" : "text-xs")}>
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);
RadioGroup.displayName = "RadioGroup";

export { RadioGroup, radioIndicatorVariants, radioVariants };
