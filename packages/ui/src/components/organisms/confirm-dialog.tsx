"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

import { cn } from "../../lib/utils";
import { Button, buttonVariants } from "../atoms/button";

const ConfirmDialog = AlertDialogPrimitive.Root;
const ConfirmDialogTrigger = AlertDialogPrimitive.Trigger;
const ConfirmDialogPortal = AlertDialogPrimitive.Portal;

const overlayClassName =
  "fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0";

const contentClassName =
  "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-background p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95";

const ConfirmDialogOverlay = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    ref={ref}
    className={cn(overlayClassName, className)}
    {...props}
  />
));
ConfirmDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

const ConfirmDialogContent = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <ConfirmDialogPortal>
    <ConfirmDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(contentClassName, className)}
      {...props}
    />
  </ConfirmDialogPortal>
));
ConfirmDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

function ConfirmDialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 text-right", className)} {...props} />;
}

function ConfirmDialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-4 flex items-center justify-end gap-2", className)} {...props} />;
}

const ConfirmDialogTitle = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold", className)} {...props} />
));
ConfirmDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

const ConfirmDialogDescription = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
ConfirmDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;

const ConfirmDialogAction = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(buttonVariants({ variant: "destructive", size: "default" }), className)}
    {...props}
  />
));
ConfirmDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

const ConfirmDialogCancel = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(buttonVariants({ variant: "outline", size: "default" }), className)}
    {...props}
  />
));
ConfirmDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

type ConfirmDialogActionsProps = {
  cancelText?: string;
  confirmText?: string;
  confirmVariant?: React.ComponentProps<typeof Button>["variant"];
  loading?: boolean;
  disableConfirm?: boolean;
  disableCancel?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  className?: string;
};

function ConfirmDialogActions({
  cancelText = "انصراف",
  confirmText = "تایید",
  confirmVariant = "destructive",
  loading = false,
  disableConfirm = false,
  disableCancel = false,
  onConfirm,
  onCancel,
  className,
}: ConfirmDialogActionsProps) {
  return (
    <ConfirmDialogFooter className={className}>
      <ConfirmDialogCancel disabled={disableCancel} onClick={onCancel}>
        {cancelText}
      </ConfirmDialogCancel>
      <ConfirmDialogAction
        className={cn(
          buttonVariants({
            variant: confirmVariant,
            size: "default",
          }),
        )}
        disabled={disableConfirm}
        onClick={onConfirm}
      >
        {loading ? "در حال انجام..." : confirmText}
      </ConfirmDialogAction>
    </ConfirmDialogFooter>
  );
}

export {
  ConfirmDialog,
  ConfirmDialogTrigger,
  ConfirmDialogPortal,
  ConfirmDialogOverlay,
  ConfirmDialogContent,
  ConfirmDialogHeader,
  ConfirmDialogFooter,
  ConfirmDialogTitle,
  ConfirmDialogDescription,
  ConfirmDialogAction,
  ConfirmDialogCancel,
  ConfirmDialogActions,
};
