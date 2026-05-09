"use client";

import { EventNotifDeleteModal } from "./event-notif-delete-modal";
import { EventNotifFormModal } from "./event-notif-form-modal";
import { useEventNotifManager } from "../hooks/use-event-notif-manager";
import { EventNotifGrid } from "./event-notif-grid";
import { EventNotifHeader } from "./event-notif-header";

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
        form={manager.form}
        errors={manager.formErrors}
        isSaving={manager.isSaving}
        onFieldChange={manager.onFieldChange}
        onConfirm={manager.handleEditorConfirm}
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
