import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast, toBackendDateTimeString } from "@repo/ui";

import { eventSliderConfig } from "../config/slider-config";
import { EMPTY_SLIDER_FORM, sliderFormSchema } from "../model";
import { deleteSlider, fetchSelectOptions, fetchSliderById, saveSlider } from "../services/slider-service";
import type { SliderFormErrors, SliderFormValues, SliderItem } from "../types";
import {
  mapEntityToSliderItem,
  mapRowToForm,
  normalizeOptions,
  toOptionalNumber,
  toOptionalString,
} from "../utils";

export function useEventSliderManager() {
  const queryClient = useQueryClient();
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [editingRow, setEditingRow] = React.useState<SliderItem | null>(null);
  const [deletingRow, setDeletingRow] = React.useState<SliderItem | null>(null);
  const [form, setForm] = React.useState<SliderFormValues>(EMPTY_SLIDER_FORM);
  const [formErrors, setFormErrors] = React.useState<SliderFormErrors>({});

  const refreshGrid = React.useCallback(async () => {
    await queryClient.refetchQueries({
      queryKey: ["data-grid", eventSliderConfig.api.grid],
      exact: false,
      type: "active",
    });
  }, [queryClient]);

  const fetchEditItemMutation = useMutation({
    mutationFn: (id: number) => fetchSliderById(id),
  });

  const saveMutation = useMutation({
    mutationFn: (args: { payload: Record<string, unknown>; isEditMode: boolean }) =>
      saveSlider(args.payload, args.isEditMode),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteSlider(id),
  });

  const resetEditorState = React.useCallback(() => {
    setEditingRow(null);
    setForm(EMPTY_SLIDER_FORM);
    setFormErrors({});
  }, []);

  const openAddModal = React.useCallback(() => {
    resetEditorState();
    setIsEditorOpen(true);
  }, [resetEditorState]);

  const openEditModal = React.useCallback(async (row: SliderItem) => {
    try {
      const response = await fetchEditItemMutation.mutateAsync(row.id);
      const freshItem = mapEntityToSliderItem(response) ?? row;
      setEditingRow(freshItem);
      setForm(mapRowToForm(freshItem));
      setFormErrors({});
      setIsEditorOpen(true);
    } catch {
      setEditingRow(row);
      setForm(mapRowToForm(row));
      setFormErrors({});
      setIsEditorOpen(true);
      toast.error("دریافت اطلاعات کامل اسلایدر انجام نشد؛ داده فعلی جدول نمایش داده شد.");
    }
  }, [fetchEditItemMutation]);

  const openDeleteModal = React.useCallback((row: SliderItem) => {
    setDeletingRow(row);
    setIsDeleteOpen(true);
  }, []);

  const onFieldChange = React.useCallback((field: keyof SliderFormValues, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const handleEditorConfirm = React.useCallback(async () => {
    try {
      const validation = sliderFormSchema.safeParse(form);
      if (!validation.success) {
        const nextErrors: SliderFormErrors = {};
        const fieldErrors = validation.error.flatten().fieldErrors;
        (Object.keys(fieldErrors) as (keyof SliderFormValues)[]).forEach((key) => {
          const firstError = fieldErrors[key]?.[0];
          if (firstError) nextErrors[key] = firstError;
        });
        setFormErrors(nextErrors);
        toast.error("لطفاً خطاهای فرم را برطرف کنید.");
        return;
      }

      const startDate = toBackendDateTimeString(validation.data.startDate);
      const endDate = toBackendDateTimeString(validation.data.endDate);
      if (!startDate || !endDate) {
        // Guard only for type-safety. Date validity is already enforced by zod schema.
        toast.error("فرمت تاریخ‌ها نامعتبر است.");
        return;
      }

      setFormErrors({});
      const payload = {
        ...(editingRow ? { id: editingRow.id } : {}),
        title: toOptionalString(form.title),
        subTitle: toOptionalString(form.subTitle),
        imageUrl: toOptionalString(form.imageUrl),
        href: toOptionalString(form.href),
        startDate,
        endDate,
        width: toOptionalNumber(form.width),
        height: toOptionalNumber(form.height),
        viewType: toOptionalNumber(form.viewType),
        userType: toOptionalNumber(form.userType),
        orderIndex: toOptionalNumber(form.orderIndex),
      };

      await saveMutation.mutateAsync({
        payload,
        isEditMode: Boolean(editingRow),
      });
      toast.success(editingRow ? "اسلایدر با موفقیت ویرایش شد." : "اسلایدر با موفقیت اضافه شد.");

      setIsEditorOpen(false);
      resetEditorState();
      void refreshGrid();
    } catch (error) {
      const message = error instanceof Error ? error.message : "ثبت اطلاعات انجام نشد. لطفاً دوباره تلاش کنید.";
      toast.error(message);
    }
  }, [editingRow, form, refreshGrid, resetEditorState, saveMutation]);

  const handleDeleteConfirm = React.useCallback(async () => {
    if (!deletingRow) return;
    try {
      await deleteMutation.mutateAsync(deletingRow.id);
      toast.success("اسلایدر با موفقیت حذف شد.");
      setIsDeleteOpen(false);
      setDeletingRow(null);
      void refreshGrid();
    } catch (error) {
      const message = error instanceof Error ? error.message : "حذف انجام نشد. لطفاً دوباره تلاش کنید.";
      toast.error(message);
    }
  }, [deleteMutation, deletingRow, refreshGrid]);

  return {
    isEditorOpen,
    setIsEditorOpen,
    isDeleteOpen,
    setIsDeleteOpen,
    editingRow,
    deletingRow,
    form,
    formErrors,
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isFetchingEditItem: fetchEditItemMutation.isPending,
    isEditMode: Boolean(editingRow),
    viewTypesUrl: eventSliderConfig.api.viewTypes,
    userTypesUrl: eventSliderConfig.api.userTypes,
    fetchSelectOptions,
    normalizeOptions,
    openAddModal,
    openEditModal,
    openDeleteModal,
    onFieldChange,
    handleEditorConfirm,
    handleDeleteConfirm,
  };
}
