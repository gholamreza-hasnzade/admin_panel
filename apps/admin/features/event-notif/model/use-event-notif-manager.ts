import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast, toBackendDateTimeString } from "@repo/ui";

import { baseDataApiRoutes } from "@/lib/base-data-api";
import { fetchSelectOptions, normalizeOptions } from "@/lib/select-options";
import { toOptionalNumber, toOptionalString } from "@/lib/utils/form-primitive";
import { eventNotifConfig } from "../lib/config";
import {
  mapEntityToEventNotifItem,
  mapRowToEventNotifForm,
} from "../lib/mappers";
import { deleteEventNotif, fetchEventNotifById, saveEventNotif } from "../api/notifications";
import { EMPTY_EVENT_NOTIF_FORM, type EventNotifFormValues } from "./form-schema";
import type { EventNotifItem } from "./types";

export function useEventNotifManager() {
  const queryClient = useQueryClient();
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [editingRow, setEditingRow] = React.useState<EventNotifItem | null>(null);
  const [deletingRow, setDeletingRow] = React.useState<EventNotifItem | null>(null);
  const [editorDefaults, setEditorDefaults] = React.useState<EventNotifFormValues>(EMPTY_EVENT_NOTIF_FORM);
  const [editorSession, setEditorSession] = React.useState(0);

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
    setEditorDefaults(EMPTY_EVENT_NOTIF_FORM);
    setEditorSession((s) => s + 1);
    setIsEditorOpen(true);
  }, []);

  const openEditModal = React.useCallback(
    async (row: EventNotifItem) => {
      try {
        const response = await fetchByIdMutation.mutateAsync(row.id);
        const freshItem = mapEntityToEventNotifItem(response) ?? row;
        setEditingRow(freshItem);
        setEditorDefaults(mapRowToEventNotifForm(freshItem));
        setEditorSession((s) => s + 1);
        setIsEditorOpen(true);
      } catch {
        setEditingRow(row);
        setEditorDefaults(mapRowToEventNotifForm(row));
        setEditorSession((s) => s + 1);
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

  const handleEditorSubmit = React.useCallback(
    async (form: EventNotifFormValues) => {
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
          shortText: toOptionalString(form.shortText),
          longText: toOptionalString(form.longText),
          startDate,
          endDate,
          creator: toOptionalString(form.creator ?? ""),
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
        setEditorDefaults(EMPTY_EVENT_NOTIF_FORM);
        void refreshGrid();
      } catch (error) {
        const message = error instanceof Error ? error.message : "ثبت اطلاعات انجام نشد. لطفاً دوباره تلاش کنید.";
        toast.error(message);
      }
    },
    [editingRow, refreshGrid, saveMutation],
  );

  return {
    isEditorOpen,
    setIsEditorOpen,
    isEditMode: Boolean(editingRow),
    editorDefaults,
    editorSession,
    isSaving: saveMutation.isPending,
    viewTypesUrl: baseDataApiRoutes.viewTypes,
    userTypesUrl: baseDataApiRoutes.userTypes,
    fetchSelectOptions,
    normalizeOptions,
    isDeleteOpen,
    setIsDeleteOpen,
    deletingRow,
    isDeleting: deleteMutation.isPending,
    openAddModal,
    openEditModal,
    openDeleteModal,
    handleEditorSubmit,
    handleDeleteConfirm,
  };
}
