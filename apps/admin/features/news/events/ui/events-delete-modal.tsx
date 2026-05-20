"use client";

import { DeleteConfirmDialog } from "../../shared/ui/delete-confirm-dialog";

import type { EventItem } from "../model/types";

type EventsDeleteModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deletingRow: EventItem | null;
  isDeleting: boolean;
  onConfirm: () => void;
};

export function EventsDeleteModal({
  open,
  onOpenChange,
  deletingRow,
  isDeleting,
  onConfirm,
}: EventsDeleteModalProps) {
  const description = deletingRow
    ? `آیا از حذف رویداد «${deletingRow.title ?? "بدون عنوان"}» مطمئن هستید؟`
    : "آیا از حذف این رویداد مطمئن هستید؟";

  return (
    <DeleteConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      isDeleting={isDeleting}
      onConfirm={onConfirm}
      title="حذف رویداد"
      description={description}
    />
  );
}
