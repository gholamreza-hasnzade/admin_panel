"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { EyeClosedIcon, EyeOpenIcon, SpinnerIcon } from "../../icons";
import { cn } from "../../lib/utils";
import { Label } from "./label";

const textFieldVariants = cva(
  [
    "group flex w-full min-w-0 items-center gap-2 rounded-md border px-3",
    "transition-[color,box-shadow,border-color,background-color,opacity]",
    "focus-within:ring-[3px]",
  ].join(" "),
  {
    variants: {
      variant: {
        outline:
          "border-input bg-background text-foreground hover:border-ring/60 focus-within:border-ring focus-within:ring-ring/30",
        filled:
          "border-transparent bg-muted text-foreground hover:bg-muted/80 focus-within:border-ring focus-within:bg-background focus-within:ring-ring/30",
        ghost:
          "border-transparent bg-transparent text-foreground hover:border-border hover:bg-background/30 focus-within:border-ring focus-within:bg-background/50 focus-within:ring-ring/20",
      },
      size: {
        sm: "h-9 px-2.5 text-xs",
        default: "h-10 text-sm",
        lg: "h-11 px-4 text-base",
      },
      state: {
        default: "",
        error:
          "border-destructive hover:border-destructive focus-within:border-destructive focus-within:ring-destructive/30",
        success:
          "border-emerald-500 hover:border-emerald-500 focus-within:border-emerald-500 focus-within:ring-emerald-500/25",
        warning:
          "border-amber-500 hover:border-amber-500 focus-within:border-amber-500 focus-within:ring-amber-500/25",
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "default",
      state: "default",
    },
  },
);

export type TextFieldProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size" | "prefix"
> &
  VariantProps<typeof textFieldVariants> & {
    label?: React.ReactNode;
    hint?: React.ReactNode;
    error?: React.ReactNode;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    loading?: boolean;
    clearable?: boolean;
    onClear?: () => void;
    passwordToggle?: boolean;
    containerClassName?: string;
    inputClassName?: string;
  };

function useComposedRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return React.useCallback(
    (node: T) => {
      refs.forEach((ref) => {
        if (!ref) return;
        if (typeof ref === "function") {
          ref(node);
          return;
        }
        (ref as React.MutableRefObject<T | null>).current = node;
      });
    },
    [refs],
  );
}

const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      className,
      inputClassName,
      containerClassName,
      variant,
      size,
      state,
      label,
      hint,
      error,
      id,
      type = "text",
      startIcon,
      endIcon,
      prefix,
      suffix,
      loading = false,
      disabled,
      clearable = false,
      onClear,
      passwordToggle = false,
      required,
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
    const isDisabled = Boolean(disabled);
    const isReadOnly = Boolean(props.readOnly);
    const fieldState = error ? "error" : state ?? "default";
    const isPassword = type === "password";
    const [showPassword, setShowPassword] = React.useState(false);
    const inputType = isPassword && passwordToggle ? (showPassword ? "text" : "password") : type;
    const localRef = React.useRef<HTMLInputElement>(null);
    const mergedRef = useComposedRefs(ref, localRef);
    const hasValue = value != null ? `${value}`.length > 0 : `${defaultValue ?? ""}`.length > 0;

    const handleClear = () => {
      const inputEl = localRef.current;
      if (!inputEl || isDisabled) return;
      inputEl.focus();
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      )?.set;
      setter?.call(inputEl, "");
      inputEl.dispatchEvent(new Event("input", { bubbles: true }));
      onClear?.();
    };

    return (
      <div className={cn("flex w-full flex-col gap-1.5", className)}>
        {label ? (
          <Label htmlFor={inputId}>
            {label}
            {required ? (
              <span className="ms-1 font-semibold text-red-600 dark:text-red-400" aria-hidden>
                *
              </span>
            ) : null}
          </Label>
        ) : null}

        <div
          className={cn(
            textFieldVariants({ variant, size, state: fieldState }),
            isDisabled &&
              "cursor-not-allowed border-input bg-muted/50 opacity-70 hover:border-input",
            isReadOnly &&
              !isDisabled &&
              "bg-muted/30 hover:border-input focus-within:border-input focus-within:ring-transparent",
            containerClassName,
          )}
          data-disabled={isDisabled ? "true" : "false"}
          data-readonly={isReadOnly ? "true" : "false"}
        >
          {startIcon ? (
            <span className="inline-flex shrink-0 items-center justify-center text-muted-foreground transition-colors group-focus-within:text-foreground">
              {startIcon}
            </span>
          ) : null}
          {prefix ? (
            <span className="inline-flex shrink-0 items-center text-muted-foreground">{prefix}</span>
          ) : null}

          <input
            {...props}
            id={inputId}
            ref={mergedRef}
            type={inputType}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            required={required}
            disabled={isDisabled}
            aria-describedby={describedBy}
            data-invalid={fieldState === "error" ? "" : undefined}
            data-slot="text-field-input"
            className={cn(
              "w-full min-w-0 bg-transparent text-foreground outline-none placeholder:text-muted-foreground",
              "disabled:cursor-not-allowed read-only:cursor-default",
              inputClassName,
            )}
          />

          {loading ? (
            <SpinnerIcon className="shrink-0 text-muted-foreground" />
          ) : clearable && hasValue && !isDisabled && !isReadOnly ? (
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex shrink-0 items-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Clear input"
            >
              ×
            </button>
          ) : null}

          {isPassword && passwordToggle ? (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="inline-flex shrink-0 items-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={isDisabled}
            >
              {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
            </button>
          ) : null}

          {suffix ? (
            <span className="inline-flex shrink-0 items-center text-muted-foreground">{suffix}</span>
          ) : null}
          {endIcon ? (
            <span className="inline-flex shrink-0 items-center justify-center text-muted-foreground">
              {endIcon}
            </span>
          ) : null}
        </div>

        {error ? (
          <p id={errorId} className="text-xs text-destructive">
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="text-xs text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);
TextField.displayName = "TextField";

const Input = TextField;

export { Input, TextField, textFieldVariants };
