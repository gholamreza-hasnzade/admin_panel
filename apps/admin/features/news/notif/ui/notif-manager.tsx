"use client";

import { NotifDeleteModal } from "./notif-delete-modal";
import { NotifFormModal } from "./notif-form-modal";
import { NotifGrid } from "./notif-grid";
import { NotifHeader } from "./notif-header";
import { useNotifManager } from "../model/use-notif-manager";

export function NotifManager() {
  const manager = useNotifManager();

  return (
    <>
      <NotifHeader onAddClick={manager.openAddModal} />
      <NotifGrid onEditRow={manager.openEditModal} onDeleteRow={manager.openDeleteModal} />
      <NotifFormModal
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
      <NotifDeleteModal
        open={manager.isDeleteOpen}
        onOpenChange={manager.setIsDeleteOpen}
        deletingRow={manager.deletingRow}
        isDeleting={manager.isDeleting}
        onConfirm={manager.handleDeleteConfirm}
      />
    </>
  );
}
