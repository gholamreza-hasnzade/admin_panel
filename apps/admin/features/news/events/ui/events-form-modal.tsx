"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, ModalActions, ModalContent, ModalHeader, ModalTitle, PersianDateTimeField, SelectField, TextField } from "@repo/ui";

import { EMPTY_EVENTS_FORM, eventsFormSchema, type EventsFormValues } from "../model/form-schema";

export function EventsFormModal({ open, onOpenChange, isEditMode, defaultValues, sessionKey, isSaving, onSubmit }: { open: boolean; onOpenChange: (open: boolean) => void; isEditMode: boolean; defaultValues: EventsFormValues; sessionKey: number; isSaving: boolean; onSubmit: (data: EventsFormValues) => void | Promise<void>; }) {
  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<EventsFormValues>({ resolver: zodResolver(eventsFormSchema), defaultValues: EMPTY_EVENTS_FORM, mode: "onTouched" });

  React.useEffect(() => {
    if (open) reset(defaultValues);
  }, [defaultValues, open, reset, sessionKey]);

  const submit = handleSubmit(async (data) => onSubmit(data));

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent dir="rtl" className="max-w-2xl">
        <ModalHeader>
          <ModalTitle>{isEditMode ? "ویرایش رویداد" : "افزودن رویداد"}</ModalTitle>
        </ModalHeader>
        <form className="contents" onSubmit={submit}>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <TextField label="عنوان" required {...register("title")} error={errors.title?.message} />
            <TextField label="ارائه‌دهنده" required {...register("presenter")} error={errors.presenter?.message} />

            <Controller name="startDate" control={control} render={({ field, fieldState }) => (
              <PersianDateTimeField label="تاریخ شروع" required value={field.value} onChange={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
            )} />
            <Controller name="endDate" control={control} render={({ field, fieldState }) => (
              <PersianDateTimeField label="تاریخ پایان" required value={field.value} onChange={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
            )} />

            <TextField label="وضعیت" required {...register("status")} inputMode="numeric" error={errors.status?.message} />
            <TextField label="ترتیب" required {...register("orderIndex")} inputMode="numeric" error={errors.orderIndex?.message} />

            <Controller name="visible" control={control} render={({ field, fieldState }) => (
              <SelectField label="وضعیت نمایش" required value={field.value} options={[{ value: "true", label: "نمایش فعال" }, { value: "false", label: "نمایش غیرفعال" }]} error={fieldState.error?.message} onValueChange={(v) => field.onChange(typeof v === "string" ? v : "")} />
            )} />
          </div>
          <ModalActions cancelText="انصراف" confirmText={isEditMode ? "ذخیره تغییرات" : "ثبت رویداد"} loading={isSaving} disableConfirm={isSaving || isSubmitting} onConfirm={() => void submit()} onCancel={() => onOpenChange(false)} />
        </form>
      </ModalContent>
    </Modal>
  );
}
