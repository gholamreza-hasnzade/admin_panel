"use client";

import { DeleteConfirmDialog } from "../../shared/ui/delete-confirm-dialog";

import type { SliderItem } from "../model/types";

type SliderDeleteModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deletingRow: SliderItem | null;
  isDeleting: boolean;
  onConfirm: () => void;
};

export function SliderDeleteModal({
  open,
  onOpenChange,
  deletingRow,
  isDeleting,
  onConfirm,
}: SliderDeleteModalProps) {
  const description = deletingRow
    ? `آیا از حذف اسلایدر با شناسه ${deletingRow.id} مطمئن هستید؟`
    : "آیا از حذف این اسلایدر مطمئن هستید؟";

  return (
    <DeleteConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      isDeleting={isDeleting}
      onConfirm={onConfirm}
      title="حذف اسلایدر"
      description={description}
    />
  );
}
