import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DATA_TABLE_ROOT_QUERY_KEY, toast, toBackendDateTimeString } from "@repo/ui";

import { toOptionalNumber, toOptionalString } from "@/lib/utils/form-primitive";

import { deleteEvent, fetchEventsById, saveEvent } from "../api/events";
import { eventsConfig } from "../lib/config";
import { mapEntityToEventItem, mapRowToEventForm } from "../lib/mappers";
import { EMPTY_EVENTS_FORM, type EventsFormValues } from "./form-schema";
import type { EventItem } from "./types";

export function useEventsManager() {
  const queryClient = useQueryClient();
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [editingRow, setEditingRow] = React.useState<EventItem | null>(null);
  const [deletingRow, setDeletingRow] = React.useState<EventItem | null>(null);
  const [editorDefaults, setEditorDefaults] = React.useState<EventsFormValues>(EMPTY_EVENTS_FORM);
  const [editorSession, setEditorSession] = React.useState(0);

  const refreshGrid = React.useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: [DATA_TABLE_ROOT_QUERY_KEY, eventsConfig.api.grid], exact: false });
  }, [queryClient]);

  const fetchByIdMutation = useMutation({ mutationFn: (id: number) => fetchEventsById(id) });
  const saveMutation = useMutation({ mutationFn: (args: { payload: Record<string, unknown>; isEditMode: boolean }) => saveEvent(args.payload, args.isEditMode) });
  const deleteMutation = useMutation({ mutationFn: (id: number) => deleteEvent(id) });

  const openAddModal = React.useCallback(() => {
    setEditingRow(null);
    setEditorDefaults(EMPTY_EVENTS_FORM);
    setEditorSession((s) => s + 1);
    setIsEditorOpen(true);
  }, []);

  const openEditModal = React.useCallback(async (row: EventItem) => {
    try {
      const response = await fetchByIdMutation.mutateAsync(row.id);
      const freshItem = mapEntityToEventItem(response) ?? row;
      setEditingRow(freshItem);
      setEditorDefaults(mapRowToEventForm(freshItem));
      setEditorSession((s) => s + 1);
      setIsEditorOpen(true);
    } catch {
      setEditingRow(row);
      setEditorDefaults(mapRowToEventForm(row));
      setEditorSession((s) => s + 1);
      setIsEditorOpen(true);
      toast.error("دریافت اطلاعات رویداد انجام نشد؛ داده فعلی جدول نمایش داده شد.");
    }
  }, [fetchByIdMutation]);

  const openDeleteModal = React.useCallback((row: EventItem) => {
    setDeletingRow(row);
    setIsDeleteOpen(true);
  }, []);

  const handleEditorSubmit = React.useCallback(async (form: EventsFormValues) => {
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
        presenter: toOptionalString(form.presenter),
        startDate,
        endDate,
        status: toOptionalNumber(form.status),
        visible: form.visible.trim().toLowerCase() === "true",
        orderIndex: toOptionalNumber(form.orderIndex),
      };

      await saveMutation.mutateAsync({ payload, isEditMode: Boolean(editingRow) });
      toast.success(editingRow ? "رویداد با موفقیت ویرایش شد." : "رویداد با موفقیت اضافه شد.");
      setIsEditorOpen(false);
      setEditingRow(null);
      setEditorDefaults(EMPTY_EVENTS_FORM);
      await refreshGrid();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ثبت اطلاعات انجام نشد. لطفاً دوباره تلاش کنید.");
    }
  }, [editingRow, refreshGrid, saveMutation]);

  const handleDeleteConfirm = React.useCallback(async () => {
    if (!deletingRow) return;
    try {
      await deleteMutation.mutateAsync(deletingRow.id);
      toast.success("رویداد با موفقیت حذف شد.");
      setIsDeleteOpen(false);
      setDeletingRow(null);
      await refreshGrid();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حذف انجام نشد. لطفاً دوباره تلاش کنید.");
    }
  }, [deleteMutation, deletingRow, refreshGrid]);

  return { isEditorOpen, setIsEditorOpen, isDeleteOpen, setIsDeleteOpen, deletingRow, editorDefaults, editorSession, isSaving: saveMutation.isPending, isDeleting: deleteMutation.isPending, isEditMode: Boolean(editingRow), openAddModal, openEditModal, openDeleteModal, handleEditorSubmit, handleDeleteConfirm };
}
