"use client";

import { DeleteConfirmDialog } from "../../shared/ui/delete-confirm-dialog";

import type { NotifItem } from "../model/types";

type NotifDeleteModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deletingRow: NotifItem | null;
  isDeleting: boolean;
  onConfirm: () => void;
};

export function NotifDeleteModal({
  open,
  onOpenChange,
  deletingRow,
  isDeleting,
  onConfirm,
}: NotifDeleteModalProps) {
  const description = deletingRow
    ? `آیا از حذف اعلان با شناسه ${deletingRow.id} مطمئن هستید؟`
    : "آیا از حذف این اعلان مطمئن هستید؟";

  return (
    <DeleteConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      isDeleting={isDeleting}
      onConfirm={onConfirm}
      title="حذف اعلان"
      description={description}
    />
  );
}
