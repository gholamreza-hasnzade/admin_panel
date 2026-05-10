"use client";

import { EventNotifDeleteModal } from "./event-notif-delete-modal";
import { EventNotifFormModal } from "./event-notif-form-modal";
import { EventNotifGrid } from "./event-notif-grid";
import { EventNotifHeader } from "./event-notif-header";
import { useEventNotifManager } from "../model/use-event-notif-manager";

export function EventNotifManager() {
  const manager = useEventNotifManager();

  return (
    <>
      <EventNotifHeader onAddClick={manager.openAddModal} />
      <EventNotifGrid onEditRow={manager.openEditModal} onDeleteRow={manager.openDeleteModal} />
      <EventNotifFormModal
        open={manager.isEditorOpen}
        onOpenChange={manager.setIsEditorOpen}
        isEditMode={manager.isEditMode}
        defaultValues={manager.editorDefaults}
        sessionKey={manager.editorSession}
        isSaving={manager.isSaving}
        viewTypesUrl={manager.viewTypesUrl}
        userTypesUrl={manager.userTypesUrl}
        fetchOptions={manager.fetchSelectOptions}
        normalizeOptions={manager.normalizeOptions}
        onSubmit={manager.handleEditorSubmit}
      />
      <EventNotifDeleteModal
        open={manager.isDeleteOpen}
        onOpenChange={manager.setIsDeleteOpen}
        deletingRow={manager.deletingRow}
        isDeleting={manager.isDeleting}
        onConfirm={manager.handleDeleteConfirm}
      />
    </>
  );
}
