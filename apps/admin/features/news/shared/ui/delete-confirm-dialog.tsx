"use client";

import {
  ConfirmDialog,
  ConfirmDialogActions,
  ConfirmDialogContent,
  ConfirmDialogDescription,
  ConfirmDialogHeader,
  ConfirmDialogTitle,
} from "@repo/ui";

type DeleteConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDeleting: boolean;
  onConfirm: () => void;
  title: string;
  description: string;
};

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  isDeleting,
  onConfirm,
  title,
  description,
}: DeleteConfirmDialogProps) {
  return (
    <ConfirmDialog open={open} onOpenChange={onOpenChange}>
      <ConfirmDialogContent dir="rtl" className="max-w-md">
        <ConfirmDialogHeader>
          <ConfirmDialogTitle>{title}</ConfirmDialogTitle>
          <ConfirmDialogDescription>{description}</ConfirmDialogDescription>
        </ConfirmDialogHeader>

        <ConfirmDialogActions
          cancelText="انصراف"
          confirmText="حذف"
          confirmVariant="destructive"
          loading={isDeleting}
          disableConfirm={isDeleting}
          disableCancel={isDeleting}
          onConfirm={onConfirm}
          onCancel={() => onOpenChange(false)}
        />
      </ConfirmDialogContent>
    </ConfirmDialog>
  );
}
