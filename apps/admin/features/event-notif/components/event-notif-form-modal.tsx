"use client";

import {
  Modal,
  ModalActions,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
  PersianDateTimeField,
  SelectField,
  TextField,
} from "@repo/ui";

import type { EventNotifFormErrors, EventNotifFormValues } from "../types";

type EventNotifFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditMode: boolean;
  form: EventNotifFormValues;
  errors: EventNotifFormErrors;
  isSaving: boolean;
  onFieldChange: (field: keyof EventNotifFormValues, value: string) => void;
  onConfirm: () => void;
};

export function EventNotifFormModal({
  open,
  onOpenChange,
  isEditMode,
  form,
  errors,
  isSaving,
  onFieldChange,
  onConfirm,
}: EventNotifFormModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent dir="rtl" className="max-w-3xl">
        <ModalHeader>
          <ModalTitle>{isEditMode ? "ویرایش اعلان" : "افزودن اعلان"}</ModalTitle>
          <ModalDescription>
            {isEditMode ? "اطلاعات اعلان را به‌روزرسانی کنید." : "اطلاعات اعلان جدید را تکمیل کنید."}
          </ModalDescription>
        </ModalHeader>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <TextField
            label="عنوان"
            value={form.title}
            onChange={(e) => onFieldChange("title", e.target.value)}
            placeholder="عنوان اعلان"
            error={errors.title}
          />
          <TextField
            label="متن کوتاه"
            value={form.shortText}
            onChange={(e) => onFieldChange("shortText", e.target.value)}
            placeholder="متن کوتاه"
            error={errors.shortText}
          />
          <TextField
            label="متن کامل"
            value={form.longText}
            onChange={(e) => onFieldChange("longText", e.target.value)}
            placeholder="متن کامل"
            error={errors.longText}
          />
          <TextField
            label="ایجادکننده"
            value={form.creator}
            onChange={(e) => onFieldChange("creator", e.target.value)}
            placeholder="نام ایجادکننده"
          />

          <PersianDateTimeField
            label="تاریخ شروع"
            value={form.startDate}
            onChange={(v) => onFieldChange("startDate", v)}
            placeholder="انتخاب تاریخ و زمان شروع"
            error={errors.startDate}
          />
          <PersianDateTimeField
            label="تاریخ پایان"
            value={form.endDate}
            onChange={(v) => onFieldChange("endDate", v)}
            placeholder="انتخاب تاریخ و زمان پایان"
            error={errors.endDate}
          />

          <TextField
            label="سمت نمایش"
            value={form.viewSide}
            onChange={(e) => onFieldChange("viewSide", e.target.value)}
            placeholder="مثلا 1"
            inputMode="numeric"
            error={errors.viewSide}
          />
          <TextField
            label="نوع کاربر"
            value={form.userType}
            onChange={(e) => onFieldChange("userType", e.target.value)}
            placeholder="مثلا 0"
            inputMode="numeric"
            error={errors.userType}
          />
          <SelectField
            label="وضعیت نمایش"
            value={form.visible}
            options={[
              { value: "true", label: "نمایش فعال" },
              { value: "false", label: "نمایش غیرفعال" },
            ]}
            error={errors.visible}
            onValueChange={(v) => onFieldChange("visible", typeof v === "string" ? v : "")}
          />

          <TextField
            label="ترتیب"
            value={form.orderIndex}
            onChange={(e) => onFieldChange("orderIndex", e.target.value)}
            placeholder="ترتیب"
            inputMode="numeric"
            error={errors.orderIndex}
          />
        </div>

        <ModalActions
          cancelText="انصراف"
          confirmText={isEditMode ? "ذخیره تغییرات" : "ثبت اعلان"}
          loading={isSaving}
          disableConfirm={isSaving}
          onConfirm={onConfirm}
          onCancel={() => onOpenChange(false)}
        />
      </ModalContent>
    </Modal>
  );
}
