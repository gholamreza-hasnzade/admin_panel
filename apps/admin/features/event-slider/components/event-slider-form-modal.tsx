"use client";

import * as React from "react";
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

import type { SelectOption, SliderFormErrors, SliderFormValues } from "../types";

type EventSliderFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditMode: boolean;
  form: SliderFormValues;
  errors: SliderFormErrors;
  isSaving: boolean;
  isFetchingEditItem: boolean;
  viewTypesUrl: string;
  userTypesUrl: string;
  fetchOptions: (args: {
    url: string;
    params?: Record<string, string | number | boolean | null | undefined>;
  }) => Promise<unknown>;
  normalizeOptions: (raw: unknown) => SelectOption[];
  onFieldChange: (field: keyof SliderFormValues, value: string) => void;
  onConfirm: () => void;
};

export function EventSliderFormModal({
  open,
  onOpenChange,
  isEditMode,
  form,
  errors,
  isSaving,
  isFetchingEditItem,
  viewTypesUrl,
  userTypesUrl,
  fetchOptions,
  normalizeOptions,
  onFieldChange,
  onConfirm,
}: EventSliderFormModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent dir="rtl" className="max-w-3xl">
        <ModalHeader>
          <ModalTitle>{isEditMode ? "ویرایش اسلایدر" : "افزودن اسلایدر"}</ModalTitle>
          <ModalDescription>
            {isEditMode ? "اطلاعات اسلایدر را به‌روزرسانی کنید." : "اطلاعات اسلایدر جدید را تکمیل کنید."}
          </ModalDescription>
        </ModalHeader>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <TextField label="عنوان" value={form.title} onChange={(e) => onFieldChange("title", e.target.value)} placeholder="عنوان اسلایدر" error={errors.title} />
          <TextField label="زیرعنوان" value={form.subTitle} onChange={(e) => onFieldChange("subTitle", e.target.value)} placeholder="زیرعنوان" />
          <TextField label="آدرس تصویر" value={form.imageUrl} onChange={(e) => onFieldChange("imageUrl", e.target.value)} placeholder="آدرس تصویر" error={errors.imageUrl} />
          <TextField label="لینک" value={form.href} onChange={(e) => onFieldChange("href", e.target.value)} placeholder="لینک" />

          <PersianDateTimeField label="تاریخ شروع" value={form.startDate} onChange={(v) => onFieldChange("startDate", v)} placeholder="انتخاب تاریخ و زمان شروع" error={errors.startDate} />
          <PersianDateTimeField label="تاریخ پایان" value={form.endDate} onChange={(v) => onFieldChange("endDate", v)} placeholder="انتخاب تاریخ و زمان پایان" error={errors.endDate} />

          <TextField label="عرض" value={form.width} onChange={(e) => onFieldChange("width", e.target.value)} placeholder="عرض" inputMode="numeric" />
          <TextField label="ارتفاع" value={form.height} onChange={(e) => onFieldChange("height", e.target.value)} placeholder="ارتفاع" inputMode="numeric" />

          <SelectField
            label="نوع نمایش"
            value={form.viewType}
            optionsUrl={viewTypesUrl}
            fetchOptions={fetchOptions}
            normalizeOptions={normalizeOptions}
            queryEnabled={open}
            searchable
            error={errors.viewType}
            onValueChange={(v) => onFieldChange("viewType", typeof v === "string" ? v : "")}
          />
          <SelectField
            label="نوع کاربر"
            value={form.userType}
            optionsUrl={userTypesUrl}
            fetchOptions={fetchOptions}
            normalizeOptions={normalizeOptions}
            queryEnabled={open}
            searchable
            error={errors.userType}
            onValueChange={(v) => onFieldChange("userType", typeof v === "string" ? v : "")}
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
          confirmText={isEditMode ? "ذخیره تغییرات" : "ثبت اسلایدر"}
          loading={isSaving}
          disableConfirm={isSaving || isFetchingEditItem}
          onConfirm={onConfirm}
          onCancel={() => onOpenChange(false)}
        />
      </ModalContent>
    </Modal>
  );
}
