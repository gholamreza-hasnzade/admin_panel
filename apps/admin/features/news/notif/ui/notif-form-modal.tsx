"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Modal,
  ModalActions,
  ModalContent,
  ModalHeader,
  ModalTitle,
  PersianDateTimeField,
  SelectField,
  Textarea,
  TextField,
} from "@repo/ui";

import {
  EMPTY_NOTIF_FORM,
  notifFormSchema,
  type NotifFormValues,
} from "../model/form-schema";
import type { SelectOption } from "../model/types";

type NotifFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditMode: boolean;
  defaultValues: NotifFormValues;
  /** Increments when editor opens so defaults reset reliably */
  sessionKey: number;
  isSaving: boolean;
  viewTypesUrl: string;
  userTypesUrl: string;
  fetchOptions: (args: {
    url: string;
    params?: Record<string, string | number | boolean | null | undefined>;
  }) => Promise<unknown>;
  normalizeOptions: (raw: unknown) => SelectOption[];
  onSubmit: (data: NotifFormValues) => void | Promise<void>;
};

export function NotifFormModal({
  open,
  onOpenChange,
  isEditMode,
  defaultValues,
  sessionKey,
  isSaving,
  viewTypesUrl,
  userTypesUrl,
  fetchOptions,
  normalizeOptions,
  onSubmit,
}: NotifFormModalProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NotifFormValues>({
    resolver: zodResolver(notifFormSchema),
    defaultValues: EMPTY_NOTIF_FORM,
    mode: "onTouched",
  });

  React.useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, sessionKey, defaultValues, reset]);

  const submit = handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent dir="rtl" className="max-w-3xl">
        <ModalHeader>
          <ModalTitle>{isEditMode ? "ویرایش اعلان" : "افزودن اعلان"}</ModalTitle>
        </ModalHeader>

        <form className="contents" onSubmit={submit}>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <TextField
              label="عنوان"
              required
              {...register("title")}
              placeholder="عنوان اعلان"
              error={errors.title?.message}
            />
            <TextField label="ایجادکننده" {...register("creator")} placeholder="نام ایجادکننده" />

            <Controller
              name="startDate"
              control={control}
              render={({ field, fieldState }) => (
                <PersianDateTimeField
                  label="تاریخ شروع"
                  required
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="انتخاب تاریخ و زمان شروع"
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="endDate"
              control={control}
              render={({ field, fieldState }) => (
                <PersianDateTimeField
                  label="تاریخ پایان"
                  required
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="انتخاب تاریخ و زمان پایان"
                  error={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="viewSide"
              control={control}
              render={({ field, fieldState }) => (
                <SelectField
                  label="نوع نمایش"
                  required
                  value={field.value}
                  optionsUrl={viewTypesUrl}
                  fetchOptions={fetchOptions}
                  normalizeOptions={normalizeOptions}
                  queryEnabled={open}
                  searchable
                  error={fieldState.error?.message}
                  onValueChange={(v) => field.onChange(typeof v === "string" ? v : "")}
                />
              )}
            />
            <Controller
              name="userType"
              control={control}
              render={({ field, fieldState }) => (
                <SelectField
                  label="نوع کاربر"
                  required
                  value={field.value}
                  optionsUrl={userTypesUrl}
                  fetchOptions={fetchOptions}
                  normalizeOptions={normalizeOptions}
                  queryEnabled={open}
                  searchable
                  error={fieldState.error?.message}
                  onValueChange={(v) => field.onChange(typeof v === "string" ? v : "")}
                />
              )}
            />
            <Controller
              name="visible"
              control={control}
              render={({ field, fieldState }) => (
                <SelectField
                  label="وضعیت نمایش"
                  required
                  value={field.value}
                  options={[
                    { value: "true", label: "نمایش فعال" },
                    { value: "false", label: "نمایش غیرفعال" },
                  ]}
                  error={fieldState.error?.message}
                  onValueChange={(v) => field.onChange(typeof v === "string" ? v : "")}
                />
              )}
            />

            <TextField
              label="ترتیب"
              required
              {...register("orderIndex")}
              placeholder="ترتیب"
              inputMode="numeric"
              error={errors.orderIndex?.message}
            />
            <Textarea
              className="md:col-span-2"
              label="متن کوتاه"
              required
              {...register("shortText")}
              placeholder="متن کوتاه"
              error={errors.shortText?.message}
            />
            <Textarea
              className="md:col-span-2"
              label="متن کامل"
              required
              {...register("longText")}
              placeholder="متن کامل"
              error={errors.longText?.message}
            />
          </div>

          <ModalActions
            cancelText="انصراف"
            confirmText={isEditMode ? "ذخیره تغییرات" : "ثبت اعلان"}
            loading={isSaving}
            disableConfirm={isSaving || isSubmitting}
            onConfirm={() => void submit()}
            onCancel={() => onOpenChange(false)}
          />
        </form>
      </ModalContent>
    </Modal>
  );
}
