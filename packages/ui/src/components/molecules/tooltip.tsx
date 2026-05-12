"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "../../lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 8, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 max-w-[min(18rem,calc(100vw-2rem))] touch-manipulation overflow-hidden rounded-sm border border-border bg-popover px-2 py-1 text-[11px] leading-snug text-popover-foreground shadow-md sm:max-w-sm sm:rounded-md sm:px-2.5 sm:py-1.5 sm:text-xs sm:leading-normal",
        "data-[state=delayed-open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=delayed-open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1",
        "data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1",
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

type SimpleTooltipProps = {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: React.ComponentProps<typeof TooltipContent>["side"];
  sideOffset?: number;
  delayDuration?: number;
  contentClassName?: string;
};

function SimpleTooltip({
  content,
  children,
  side = "top",
  sideOffset = 8,
  delayDuration = 120,
  contentClassName,
}: SimpleTooltipProps) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent dir="rtl" side={side} sideOffset={sideOffset} className={contentClassName}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent, SimpleTooltip };
