"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { cn } from "../../lib/utils";
import { Button } from "../atoms/button";

const Modal = DialogPrimitive.Root;
const ModalTrigger = DialogPrimitive.Trigger;
const ModalPortal = DialogPrimitive.Portal;
const ModalClose = DialogPrimitive.Close;

const overlayClassName =
  "fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0";

const contentClassName =
  "fixed left-1/2 top-1/2 z-50 flex w-[calc(100vw-2rem)] max-w-lg min-h-0 max-h-[min(90dvh,calc(100dvh-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col gap-y-2 border border-border bg-background p-0 shadow-lg outline-none sm:gap-y-3 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95";

const modalScrollClassName =
  "min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pt-2 pb-4 sm:px-6 sm:pb-5";

const modalFooterShellClassName =
  "border-border bg-background shrink-0 border-t px-4 py-3 sm:px-6";

const modalCloseButtonClassName = cn(
  "inline-flex size-9 shrink-0 items-center justify-center rounded-md opacity-70 ring-offset-background transition-opacity",
  "hover:bg-accent hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
);

const ModalOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(overlayClassName, className)}
    {...props}
  />
));
ModalOverlay.displayName = DialogPrimitive.Overlay.displayName;

const ModalContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const nodes = React.Children.toArray(children);
  let bodyStart = 0;
  let headerNode: React.ReactNode = null;
  const first = nodes[0];
  if (first != null && React.isValidElement(first) && first.type === ModalHeader) {
    headerNode = first;
    bodyStart = 1;
  }
  const footerIndex = nodes.findIndex(
    (n, i) => i >= bodyStart && React.isValidElement(n) && n.type === ModalActions,
  );
  const middleNodes =
    footerIndex === -1 ? nodes.slice(bodyStart) : nodes.slice(bodyStart, footerIndex);
  const footerNodes = footerIndex === -1 ? [] : nodes.slice(footerIndex);

  return (
    <ModalPortal>
      <ModalOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(contentClassName, className)}
        {...props}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg">
          {headerNode ? <div className="shrink-0">{headerNode}</div> : null}
          {middleNodes.length > 0 ? (
            <div className={modalScrollClassName}>{middleNodes}</div>
          ) : null}
          {footerNodes.length > 0 ? (
            <div className={modalFooterShellClassName}>{footerNodes}</div>
          ) : null}
        </div>
      </DialogPrimitive.Content>
    </ModalPortal>
  );
});
ModalContent.displayName = DialogPrimitive.Content.displayName;

function ModalHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-start justify-between gap-3 border-b border-border bg-background px-4 py-3 sm:px-6",
        className,
      )}
      {...props}
    >
      <div className="min-w-0 flex-1 space-y-1.5 text-right">{children}</div>
      <DialogPrimitive.Close type="button" className={modalCloseButtonClassName}>
        <span aria-hidden className="text-xl leading-none">
          ×
        </span>
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </div>
  );
}

function ModalFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-0 flex items-center justify-end gap-2", className)} {...props} />;
}

type ModalActionsProps = {
  cancelText?: string;
  confirmText?: string;
  confirmVariant?: React.ComponentProps<typeof Button>["variant"];
  loading?: boolean;
  disableConfirm?: boolean;
  disableCancel?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  extraActions?: React.ReactNode;
  className?: string;
};

function ModalActions({
  cancelText = "انصراف",
  confirmText = "تایید",
  confirmVariant = "default",
  loading = false,
  disableConfirm = false,
  disableCancel = false,
  onConfirm,
  onCancel,
  extraActions,
  className,
}: ModalActionsProps) {
  return (
    <ModalFooter className={className}>
      {extraActions}
      <ModalClose asChild>
        <Button variant="outline" onClick={onCancel} disabled={disableCancel}>
          {cancelText}
        </Button>
      </ModalClose>
      <Button variant={confirmVariant} onClick={onConfirm} loading={loading} disabled={disableConfirm}>
        {confirmText}
      </Button>
    </ModalFooter>
  );
}

const ModalTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold", className)} {...props} />
));
ModalTitle.displayName = DialogPrimitive.Title.displayName;

const ModalDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
ModalDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Modal,
  ModalTrigger,
  ModalPortal,
  ModalOverlay,
  ModalClose,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalActions,
  ModalTitle,
  ModalDescription,
};
