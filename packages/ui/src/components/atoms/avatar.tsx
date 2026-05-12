"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const avatarVariants = cva(
  "relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-muted touch-manipulation",
  {
    variants: {
      size: {
        sm: "h-7 w-7 text-[10px] sm:h-8 sm:w-8 sm:text-xs",
        default: "h-9 w-9 text-xs sm:h-10 sm:w-10 sm:text-sm",
        lg: "h-11 w-11 text-sm sm:h-14 sm:w-14 sm:text-base",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

const avatarFallbackVariants = cva("flex h-full w-full items-center justify-center bg-muted font-medium text-foreground");

export type AvatarProps = React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> &
  VariantProps<typeof avatarVariants> & {
    name?: string;
  };

const Avatar = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Root>, AvatarProps>(
  ({ className, size, name, children, ...props }, ref) => {
    const initials = React.useMemo(() => {
      if (!name?.trim()) return "";
      const parts = name.trim().split(/\s+/);
      return parts
        .slice(0, 2)
        .map((item) => item[0])
        .join("")
        .toUpperCase();
    }, [name]);

    return (
      <AvatarPrimitive.Root ref={ref} className={cn(avatarVariants({ size }), className)} {...props}>
        {children}
        <AvatarPrimitive.Fallback className={cn(avatarFallbackVariants)} delayMs={300}>
          {initials || "?"}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
    );
  },
);
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image ref={ref} className={cn("h-full w-full object-cover", className)} {...props} />
));
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback ref={ref} className={cn(avatarFallbackVariants, className)} {...props} />
));
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback, avatarVariants };
