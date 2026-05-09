"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";
import { Label } from "./label";

const textareaVariants = cva(
  [
    "flex w-full min-w-0 resize-none rounded-md border bg-background px-3 py-2 text-sm text-foreground",
    "transition-[color,box-shadow,border-color,background-color,opacity]",
    "placeholder:text-muted-foreground",
    "hover:border-ring/70",
    "active:border-ring/80",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "min-h-20 text-xs",
        default: "min-h-24 text-sm",
        lg: "min-h-28 text-base",
      },
      state: {
        default: "border-input",
        error: "border-destructive focus-visible:ring-destructive/40",
        success: "border-emerald-500 focus-visible:ring-emerald-500/35",
        warning: "border-amber-500 focus-visible:ring-amber-500/35",
      },
    },
    defaultVariants: {
      size: "default",
      state: "default",
    },
  },
);

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> &
  VariantProps<typeof textareaVariants> & {
    label?: React.ReactNode;
    hint?: React.ReactNode;
    error?: React.ReactNode;
    containerClassName?: string;
    showCount?: boolean;
  };

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
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
      maxLength,
      value,
      defaultValue,
      showCount = false,
      onChange,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const textareaId = id ?? generatedId;
    const hintId = hint ? `${textareaId}-hint` : undefined;
    const errorId = error ? `${textareaId}-error` : undefined;
    const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
    const fieldState = error ? "error" : state ?? "default";
    const labelSize = size === "sm" ? "sm" : "default";
    const isControlled = value !== undefined;
    const initialLength = `${defaultValue ?? ""}`.length;
    const [localLength, setLocalLength] = React.useState(initialLength);
    const currentLength = isControlled ? `${value ?? ""}`.length : localLength;

    return (
      <div className={cn("flex w-full flex-col gap-1.5", containerClassName)}>
        {label ? (
          <Label htmlFor={textareaId} size={labelSize} className={cn(disabled && "cursor-not-allowed opacity-70")}>
            {label}
            {required ? <span className="ms-1 text-destructive">*</span> : null}
          </Label>
        ) : null}

        <textarea
          ref={ref}
          id={textareaId}
          required={required}
          disabled={disabled}
          aria-describedby={describedBy}
          value={value}
          defaultValue={defaultValue}
          maxLength={maxLength}
          onChange={(event) => {
            if (!isControlled) {
              setLocalLength(event.target.value.length);
            }
            onChange?.(event);
          }}
          className={cn(textareaVariants({ size, state: fieldState }), className)}
          {...props}
        />

        {(error || hint || (showCount && typeof maxLength === "number")) ? (
          <div className="flex items-center justify-between gap-2">
            {error ? (
              <p id={errorId} className="text-xs text-destructive">
                {error}
              </p>
            ) : hint ? (
              <p id={hintId} className="text-xs text-muted-foreground">
                {hint}
              </p>
            ) : (
              <span />
            )}

            {showCount && typeof maxLength === "number" ? (
              <p className="text-xs text-muted-foreground">
                {currentLength}/{maxLength}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea, textareaVariants };
