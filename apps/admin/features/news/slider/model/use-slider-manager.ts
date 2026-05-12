import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast, toBackendDateTimeString, DATA_TABLE_ROOT_QUERY_KEY } from "@repo/ui";

import { baseDataApiRoutes } from "@/lib/base-data-api";
import { fetchSelectOptions, normalizeOptions } from "@/lib/select-options";
import { toOptionalNumber, toOptionalString } from "@/lib/utils/form-primitive";

import { sliderConfig } from "../lib/config";
import { mapEntityToSliderItem, mapRowToForm } from "../lib/mappers";
import { deleteSlider, fetchSliderById, saveSlider } from "../api/slider";
import { EMPTY_SLIDER_FORM, type SliderFormValues } from "./form-schema";
import type { SliderItem } from "./types";

export function useSliderManager() {
  const queryClient = useQueryClient();
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [editingRow, setEditingRow] = React.useState<SliderItem | null>(null);
  const [deletingRow, setDeletingRow] = React.useState<SliderItem | null>(null);
  const [editorDefaults, setEditorDefaults] = React.useState<SliderFormValues>(EMPTY_SLIDER_FORM);
  const [editorSession, setEditorSession] = React.useState(0);

  const refreshGrid = React.useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: [DATA_TABLE_ROOT_QUERY_KEY, sliderConfig.api.grid],
      exact: false,
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

  const openAddModal = React.useCallback(() => {
    setEditingRow(null);
    setEditorDefaults(EMPTY_SLIDER_FORM);
    setEditorSession((s) => s + 1);
    setIsEditorOpen(true);
  }, []);

  const openEditModal = React.useCallback(
    async (row: SliderItem) => {
      try {
        const response = await fetchEditItemMutation.mutateAsync(row.id);
        const freshItem = mapEntityToSliderItem(response) ?? row;
        setEditingRow(freshItem);
        setEditorDefaults(mapRowToForm(freshItem));
        setEditorSession((s) => s + 1);
        setIsEditorOpen(true);
      } catch {
        setEditingRow(row);
        setEditorDefaults(mapRowToForm(row));
        setEditorSession((s) => s + 1);
        setIsEditorOpen(true);
        toast.error("دریافت اطلاعات کامل اسلایدر انجام نشد؛ داده فعلی جدول نمایش داده شد.");
      }
    },
    [fetchEditItemMutation],
  );

  const openDeleteModal = React.useCallback((row: SliderItem) => {
    setDeletingRow(row);
    setIsDeleteOpen(true);
  }, []);

  const handleEditorSubmit = React.useCallback(
    async (form: SliderFormValues) => {
      try {
        const startDate = toBackendDateTimeString(form.startDate);
        const endDate = toBackendDateTimeString(form.endDate);
        if (!startDate || !endDate) {
          toast.error("فرمت تاریخ‌ها نامعتبر است.");
          return;
        }

        const payload = {
          ...(editingRow ? { id: editingRow.id } : {}),
          title: toOptionalString(form.title),
          subTitle: toOptionalString(form.subTitle ?? ""),
          imageUrl: toOptionalString(form.imageUrl),
          href: toOptionalString(form.href ?? ""),
          startDate,
          endDate,
          width: toOptionalNumber(form.width ?? ""),
          height: toOptionalNumber(form.height ?? ""),
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
        setEditingRow(null);
        setEditorDefaults(EMPTY_SLIDER_FORM);
        void refreshGrid();
      } catch (error) {
        const message = error instanceof Error ? error.message : "ثبت اطلاعات انجام نشد. لطفاً دوباره تلاش کنید.";
        toast.error(message);
      }
    },
    [editingRow, refreshGrid, saveMutation],
  );

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
    editorDefaults,
    editorSession,
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isFetchingEditItem: fetchEditItemMutation.isPending,
    isEditMode: Boolean(editingRow),
    viewTypesUrl: baseDataApiRoutes.viewTypes,
    userTypesUrl: baseDataApiRoutes.userTypes,
    fetchSelectOptions,
    normalizeOptions,
    openAddModal,
    openEditModal,
    openDeleteModal,
    handleEditorSubmit,
    handleDeleteConfirm,
  };
}
