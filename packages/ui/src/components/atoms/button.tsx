"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { SpinnerIcon } from "../../icons";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium",
    "cursor-pointer",
    "transition-[color,background-color,border-color,box-shadow,opacity]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        success:
          "bg-emerald-600 text-white shadow-sm hover:bg-emerald-500 focus-visible:ring-emerald-500",
        warning:
          "bg-amber-500 text-black shadow-sm hover:bg-amber-400 focus-visible:ring-amber-500",
        info: "bg-sky-600 text-white shadow-sm hover:bg-sky-500 focus-visible:ring-sky-500",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline shadow-none",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>[data-slot=icon-start]]:ps-3 has-[>[data-slot=icon-end]]:pe-3",
        sm: "h-9 gap-1.5 rounded-md px-3 text-xs has-[>[data-slot=icon-start]]:ps-2.5 has-[>[data-slot=icon-end]]:pe-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 rounded-md px-8 text-base has-[>[data-slot=icon-start]]:ps-6 has-[>[data-slot=icon-end]]:pe-6",
        icon: "size-10 gap-0 p-0 [&_svg:not([class*='size-'])]:size-4",
      },
    },
    compoundVariants: [
      {
        variant: "link",
        size: ["default", "sm", "lg"],
        class: "h-auto min-h-0 px-0 py-0 has-[>[data-slot=icon-start]]:ps-0 has-[>[data-slot=icon-end]]:pe-0",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    /** آیکن ابتدای برچسب (inline-start؛ در RTL کنار «شروع» متن) */
    icon?: React.ReactNode;
    /** آیکن انتهای برچسب (inline-end؛ در RTL طرف دیگر متن) */
    iconEnd?: React.ReactNode;
    /** آیکن سمت راست (برای RTL بسیار کاربردی) */
    iconRight?: React.ReactNode;
    /** آیکن سمت چپ */
    iconLeft?: React.ReactNode;
    /** محل نمایش اسپینر در حالت loading */
    loadingPosition?: "right" | "left";
    loading?: boolean;
    fullWidth?: boolean;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      icon,
      iconEnd,
      iconRight,
      iconLeft,
      loadingPosition = "right",
      loading = false,
      fullWidth,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const isDisabled = Boolean(disabled) || loading;
    const startIcon = iconRight ?? icon;
    const endIcon = iconLeft ?? iconEnd;
    const showIcons = !asChild && (startIcon != null || endIcon != null || loading);
    const spinnerAtStart = loadingPosition === "right";

    const inner = showIcons ? (
      <>
        {(startIcon != null || (loading && spinnerAtStart)) && (
          <span
            className="inline-flex shrink-0 items-center justify-center"
            data-slot="icon-start"
          >
            {loading && spinnerAtStart ? <SpinnerIcon /> : startIcon}
          </span>
        )}
        {children != null && children !== false ? (
          <span
            className={cn(
              "inline-flex min-w-0 items-center justify-center truncate",
              loading && "opacity-40",
            )}
          >
            {children}
          </span>
        ) : null}
        {(endIcon != null || (loading && !spinnerAtStart)) && (
          <span
            className="inline-flex shrink-0 items-center justify-center"
            data-slot="icon-end"
          >
            {loading && !spinnerAtStart ? <SpinnerIcon /> : endIcon}
          </span>
        )}
      </>
    ) : (
      children
    );

    const mergedClass = cn(
      buttonVariants({ variant, size }),
      fullWidth && "w-full",
      loading && !asChild && "cursor-wait",
      className,
    );

    if (asChild) {
      return (
        <Slot ref={ref} className={mergedClass} {...props}>
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        data-loading={loading ? "" : undefined}
        className={mergedClass}
        {...props}
      >
        {inner}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
