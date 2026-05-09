import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast, toBackendDateTimeString } from "@repo/ui";

import { eventNotifConfig } from "../config/event-notif-config";
import { EMPTY_EVENT_NOTIF_FORM, eventNotifFormSchema } from "../model";
import {
  deleteEventNotif,
  fetchEventNotifById,
  saveEventNotif,
} from "../services/event-notif-service";
import type { EventNotifFormErrors, EventNotifFormValues, EventNotifItem } from "../types";
import {
  mapEntityToEventNotifItem,
  mapRowToEventNotifForm,
  toOptionalNumber,
  toOptionalString,
} from "../utils";

export function useEventNotifManager() {
  const queryClient = useQueryClient();
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [editingRow, setEditingRow] = React.useState<EventNotifItem | null>(null);
  const [deletingRow, setDeletingRow] = React.useState<EventNotifItem | null>(null);
  const [form, setForm] = React.useState<EventNotifFormValues>(EMPTY_EVENT_NOTIF_FORM);
  const [formErrors, setFormErrors] = React.useState<EventNotifFormErrors>({});

  const refreshGrid = React.useCallback(async () => {
    await queryClient.refetchQueries({
      queryKey: ["data-grid", eventNotifConfig.api.grid],
      exact: false,
      type: "active",
    });
  }, [queryClient]);

  const fetchByIdMutation = useMutation({
    mutationFn: (id: number) => fetchEventNotifById(id),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteEventNotif(id),
  });

  const saveMutation = useMutation({
    mutationFn: (args: { payload: Record<string, unknown>; isEditMode: boolean }) =>
      saveEventNotif(args.payload, args.isEditMode),
  });

  const openAddModal = React.useCallback(() => {
    setEditingRow(null);
    setForm(EMPTY_EVENT_NOTIF_FORM);
    setFormErrors({});
    setIsEditorOpen(true);
  }, []);

  const openEditModal = React.useCallback(
    async (row: EventNotifItem) => {
      try {
        const response = await fetchByIdMutation.mutateAsync(row.id);
        const freshItem = mapEntityToEventNotifItem(response) ?? row;
        setEditingRow(freshItem);
        setForm(mapRowToEventNotifForm(freshItem));
        setFormErrors({});
        setIsEditorOpen(true);
      } catch {
        setEditingRow(row);
        setForm(mapRowToEventNotifForm(row));
        setFormErrors({});
        setIsEditorOpen(true);
        toast.error("دریافت اطلاعات اعلان انجام نشد؛ داده فعلی جدول نمایش داده شد.");
      }
    },
    [fetchByIdMutation],
  );

  const openDeleteModal = React.useCallback(
    async (row: EventNotifItem) => {
      try {
        const response = await fetchByIdMutation.mutateAsync(row.id);
        const freshItem = mapEntityToEventNotifItem(response) ?? row;
        setDeletingRow(freshItem);
      } catch {
        setDeletingRow(row);
        toast.error("دریافت اطلاعات اعلان انجام نشد؛ از داده فعلی جدول استفاده شد.");
      }
      setIsDeleteOpen(true);
    },
    [fetchByIdMutation],
  );

  const handleDeleteConfirm = React.useCallback(async () => {
    if (!deletingRow) return;
    try {
      await deleteMutation.mutateAsync(deletingRow.id);
      toast.success("اعلان با موفقیت حذف شد.");
      setIsDeleteOpen(false);
      setDeletingRow(null);
      void refreshGrid();
    } catch (error) {
      const message = error instanceof Error ? error.message : "حذف انجام نشد. لطفاً دوباره تلاش کنید.";
      toast.error(message);
    }
  }, [deleteMutation, deletingRow, refreshGrid]);

  const onFieldChange = React.useCallback((field: keyof EventNotifFormValues, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const handleEditorConfirm = React.useCallback(async () => {
    try {
      const validation = eventNotifFormSchema.safeParse(form);
      if (!validation.success) {
        const nextErrors: EventNotifFormErrors = {};
        const fieldErrors = validation.error.flatten().fieldErrors;
        (Object.keys(fieldErrors) as (keyof EventNotifFormValues)[]).forEach((key) => {
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
        toast.error("فرمت تاریخ‌ها نامعتبر است.");
        return;
      }

      const payload = {
        ...(editingRow ? { id: editingRow.id } : {}),
        title: toOptionalString(form.title),
        shortText: toOptionalString(form.shortText),
        longText: toOptionalString(form.longText),
        startDate,
        endDate,
        creator: toOptionalString(form.creator),
        visible: form.visible.trim().toLowerCase() === "true",
        viewSide: toOptionalNumber(form.viewSide),
        userType: toOptionalNumber(form.userType),
        orderIndex: toOptionalNumber(form.orderIndex),
      };

      await saveMutation.mutateAsync({
        payload,
        isEditMode: Boolean(editingRow),
      });
      toast.success(editingRow ? "اعلان با موفقیت ویرایش شد." : "اعلان با موفقیت اضافه شد.");
      setIsEditorOpen(false);
      setEditingRow(null);
      setForm(EMPTY_EVENT_NOTIF_FORM);
      setFormErrors({});
      void refreshGrid();
    } catch (error) {
      const message = error instanceof Error ? error.message : "ثبت اطلاعات انجام نشد. لطفاً دوباره تلاش کنید.";
      toast.error(message);
    }
  }, [editingRow, form, refreshGrid, saveMutation]);

  return {
    isEditorOpen,
    setIsEditorOpen,
    isEditMode: Boolean(editingRow),
    form,
    formErrors,
    isSaving: saveMutation.isPending,
    isDeleteOpen,
    setIsDeleteOpen,
    deletingRow,
    isDeleting: deleteMutation.isPending,
    openAddModal,
    openEditModal,
    openDeleteModal,
    onFieldChange,
    handleEditorConfirm,
    handleDeleteConfirm,
  };
}
