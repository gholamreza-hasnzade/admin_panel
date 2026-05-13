"use client";

import { Modal, ModalActions, ModalContent, ModalDescription, ModalHeader, ModalTitle } from "@repo/ui";

import type { EventItem } from "../model/types";

export function EventsDeleteModal({ open, onOpenChange, deletingRow, isDeleting, onConfirm }: { open: boolean; onOpenChange: (open: boolean) => void; deletingRow: EventItem | null; isDeleting: boolean; onConfirm: () => void; }) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent dir="rtl" className="max-w-md">
        <ModalHeader>
          <ModalTitle>حذف رویداد</ModalTitle>
          <ModalDescription>
            {deletingRow ? `آیا از حذف رویداد «${deletingRow.title ?? "بدون عنوان"}» مطمئن هستید؟` : "آیا از حذف این رویداد مطمئن هستید؟"}
          </ModalDescription>
        </ModalHeader>
        <ModalActions cancelText="انصراف" confirmText="حذف" confirmVariant="destructive" loading={isDeleting} disableConfirm={isDeleting} onConfirm={onConfirm} onCancel={() => onOpenChange(false)} />
      </ModalContent>
    </Modal>
  );
}
