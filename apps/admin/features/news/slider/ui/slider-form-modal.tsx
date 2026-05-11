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
  TextField,
} from "@repo/ui";

import {
  EMPTY_SLIDER_FORM,
  sliderFormSchema,
  type SliderFormValues,
} from "../model/form-schema";
import type { SelectOption } from "../model/types";

type SliderFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditMode: boolean;
  defaultValues: SliderFormValues;
  sessionKey: number;
  isSaving: boolean;
  isFetchingEditItem: boolean;
  viewTypesUrl: string;
  userTypesUrl: string;
  fetchOptions: (args: {
    url: string;
    params?: Record<string, string | number | boolean | null | undefined>;
  }) => Promise<unknown>;
  normalizeOptions: (raw: unknown) => SelectOption[];
  onSubmit: (data: SliderFormValues) => void | Promise<void>;
};

export function SliderFormModal({
  open,
  onOpenChange,
  isEditMode,
  defaultValues,
  sessionKey,
  isSaving,
  isFetchingEditItem,
  viewTypesUrl,
  userTypesUrl,
  fetchOptions,
  normalizeOptions,
  onSubmit,
}: SliderFormModalProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SliderFormValues>({
    resolver: zodResolver(sliderFormSchema),
    defaultValues: EMPTY_SLIDER_FORM,
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
          <ModalTitle>{isEditMode ? "ویرایش اسلایدر" : "افزودن اسلایدر"}</ModalTitle>
        </ModalHeader>

        <form className="contents" onSubmit={submit}>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <TextField
              label="عنوان"
              required
              {...register("title")}
              placeholder="عنوان اسلایدر"
              error={errors.title?.message}
            />
            <TextField label="زیرعنوان" {...register("subTitle")} placeholder="زیرعنوان" />
            <TextField
              label="آدرس تصویر"
              required
              {...register("imageUrl")}
              placeholder="آدرس تصویر"
              error={errors.imageUrl?.message}
            />
            <TextField label="لینک" {...register("href")} placeholder="لینک" />

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

            <TextField label="عرض" {...register("width")} placeholder="عرض" inputMode="numeric" />
            <TextField label="ارتفاع" {...register("height")} placeholder="ارتفاع" inputMode="numeric" />

            <Controller
              name="viewType"
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

            <TextField
              label="ترتیب"
              required
              {...register("orderIndex")}
              placeholder="ترتیب"
              inputMode="numeric"
              error={errors.orderIndex?.message}
            />
          </div>

          <ModalActions
            cancelText="انصراف"
            confirmText={isEditMode ? "ذخیره تغییرات" : "ثبت اسلایدر"}
            loading={isSaving}
            disableConfirm={isSaving || isFetchingEditItem || isSubmitting}
            onConfirm={() => void submit()}
            onCancel={() => onOpenChange(false)}
          />
        </form>
      </ModalContent>
    </Modal>
  );
}
