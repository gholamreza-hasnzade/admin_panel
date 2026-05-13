"use client";

import { useEventsManager } from "../model/use-events-manager";
import { EventsDeleteModal } from "./events-delete-modal";
import { EventsFormModal } from "./events-form-modal";
import { EventsGrid } from "./events-grid";
import { EventsHeader } from "./events-header";

export function EventsManager() {
  const manager = useEventsManager();

  return (
    <>
      <EventsHeader onAddClick={manager.openAddModal} />
      <EventsGrid onEditRow={manager.openEditModal} onDeleteRow={manager.openDeleteModal} />
      <EventsFormModal
        open={manager.isEditorOpen}
        onOpenChange={manager.setIsEditorOpen}
        isEditMode={manager.isEditMode}
        defaultValues={manager.editorDefaults}
        sessionKey={manager.editorSession}
        isSaving={manager.isSaving}
        onSubmit={manager.handleEditorSubmit}
      />
      <EventsDeleteModal
        open={manager.isDeleteOpen}
        onOpenChange={manager.setIsDeleteOpen}
        deletingRow={manager.deletingRow}
        isDeleting={manager.isDeleting}
        onConfirm={manager.handleDeleteConfirm}
      />
    </>
  );
}
