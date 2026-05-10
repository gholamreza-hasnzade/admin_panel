"use client";

import { Modal, ModalActions, ModalContent, ModalDescription, ModalHeader, ModalTitle } from "@repo/ui";

import type { EventNotifItem } from "../model/types";

type EventNotifDeleteModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deletingRow: EventNotifItem | null;
  isDeleting: boolean;
  onConfirm: () => void;
};

export function EventNotifDeleteModal({
  open,
  onOpenChange,
  deletingRow,
  isDeleting,
  onConfirm,
}: EventNotifDeleteModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent dir="rtl" className="max-w-md">
        <ModalHeader>
          <ModalTitle>حذف اعلان</ModalTitle>
          <ModalDescription>
            {deletingRow
              ? `آیا از حذف اعلان با شناسه ${deletingRow.id} مطمئن هستید؟`
              : "آیا از حذف این اعلان مطمئن هستید؟"}
          </ModalDescription>
        </ModalHeader>

        <ModalActions
          cancelText="انصراف"
          confirmText="حذف"
          confirmVariant="destructive"
          loading={isDeleting}
          disableConfirm={isDeleting}
          onConfirm={onConfirm}
          onCancel={() => onOpenChange(false)}
        />
      </ModalContent>
    </Modal>
  );
}
