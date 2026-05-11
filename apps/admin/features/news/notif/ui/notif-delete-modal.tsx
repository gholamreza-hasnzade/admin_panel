"use client";

import { Modal, ModalActions, ModalContent, ModalDescription, ModalHeader, ModalTitle } from "@repo/ui";

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
