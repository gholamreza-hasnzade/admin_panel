"use client";

import { Modal, ModalActions, ModalContent, ModalDescription, ModalHeader, ModalTitle } from "@repo/ui";

import type { SliderItem } from "../types";

type EventSliderDeleteModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deletingRow: SliderItem | null;
  isDeleting: boolean;
  onConfirm: () => void;
};

export function EventSliderDeleteModal({
  open,
  onOpenChange,
  deletingRow,
  isDeleting,
  onConfirm,
}: EventSliderDeleteModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent dir="rtl" className="max-w-md">
        <ModalHeader>
          <ModalTitle>حذف اسلایدر</ModalTitle>
          <ModalDescription>
            {deletingRow
              ? `آیا از حذف اسلایدر با شناسه ${deletingRow.id} مطمئن هستید؟`
              : "آیا از حذف این اسلایدر مطمئن هستید؟"}
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
