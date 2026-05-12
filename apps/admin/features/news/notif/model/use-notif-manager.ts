import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast, toBackendDateTimeString, DATA_TABLE_ROOT_QUERY_KEY } from "@repo/ui";

import { baseDataApiRoutes } from "@/lib/base-data-api";
import { fetchSelectOptions, normalizeOptions } from "@/lib/select-options";
import { toOptionalNumber, toOptionalString } from "@/lib/utils/form-primitive";
import { notifConfig } from "../lib/config";
import {
  mapEntityToNotifItem,
  mapRowToNotifForm,
} from "../lib/mappers";
import { deleteNotif, fetchNotifById, saveNotif } from "../api/notifications";
import { EMPTY_NOTIF_FORM, type NotifFormValues } from "./form-schema";
import type { NotifItem } from "./types";

export function useNotifManager() {
  const queryClient = useQueryClient();
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [editingRow, setEditingRow] = React.useState<NotifItem | null>(null);
  const [deletingRow, setDeletingRow] = React.useState<NotifItem | null>(null);
  const [editorDefaults, setEditorDefaults] = React.useState<NotifFormValues>(EMPTY_NOTIF_FORM);
  const [editorSession, setEditorSession] = React.useState(0);

  const refreshGrid = React.useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: [DATA_TABLE_ROOT_QUERY_KEY, notifConfig.api.grid],
      exact: false,
    });
  }, [queryClient]);

  const fetchByIdMutation = useMutation({
    mutationFn: (id: number) => fetchNotifById(id),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteNotif(id),
  });

  const saveMutation = useMutation({
    mutationFn: (args: { payload: Record<string, unknown>; isEditMode: boolean }) =>
      saveNotif(args.payload, args.isEditMode),
  });

  const openAddModal = React.useCallback(() => {
    setEditingRow(null);
    setEditorDefaults(EMPTY_NOTIF_FORM);
    setEditorSession((s) => s + 1);
    setIsEditorOpen(true);
  }, []);

  const openEditModal = React.useCallback(
    async (row: NotifItem) => {
      try {
        const response = await fetchByIdMutation.mutateAsync(row.id);
        const freshItem = mapEntityToNotifItem(response) ?? row;
        setEditingRow(freshItem);
        setEditorDefaults(mapRowToNotifForm(freshItem));
        setEditorSession((s) => s + 1);
        setIsEditorOpen(true);
      } catch {
        setEditingRow(row);
        setEditorDefaults(mapRowToNotifForm(row));
        setEditorSession((s) => s + 1);
        setIsEditorOpen(true);
        toast.error("دریافت اطلاعات اعلان انجام نشد؛ داده فعلی جدول نمایش داده شد.");
      }
    },
    [fetchByIdMutation],
  );

  const openDeleteModal = React.useCallback(
    async (row: NotifItem) => {
      try {
        const response = await fetchByIdMutation.mutateAsync(row.id);
        const freshItem = mapEntityToNotifItem(response) ?? row;
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
      await refreshGrid();
    } catch (error) {
      const message = error instanceof Error ? error.message : "حذف انجام نشد. لطفاً دوباره تلاش کنید.";
      toast.error(message);
    }
  }, [deleteMutation, deletingRow, refreshGrid]);

  const handleEditorSubmit = React.useCallback(
    async (form: NotifFormValues) => {
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
        setEditorDefaults(EMPTY_NOTIF_FORM);
        await refreshGrid();
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
