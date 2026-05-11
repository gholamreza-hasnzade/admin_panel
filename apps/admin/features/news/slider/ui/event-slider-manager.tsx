"use client";

import { EventSliderDeleteModal } from "./event-slider-delete-modal";
import { EventSliderFormModal } from "./event-slider-form-modal";
import { EventSliderGrid } from "./event-slider-grid";
import { EventSliderHeader } from "./event-slider-header";
import { useEventSliderManager } from "../model/use-event-slider-manager";

export function EventSliderManager() {
  const manager = useEventSliderManager();

  return (
    <>
      <EventSliderHeader onAddClick={manager.openAddModal} />
      <EventSliderGrid onEditRow={manager.openEditModal} onDeleteRow={manager.openDeleteModal} />

      <EventSliderFormModal
        open={manager.isEditorOpen}
        onOpenChange={manager.setIsEditorOpen}
        isEditMode={manager.isEditMode}
        defaultValues={manager.editorDefaults}
        sessionKey={manager.editorSession}
        isSaving={manager.isSaving}
        isFetchingEditItem={manager.isFetchingEditItem}
        viewTypesUrl={manager.viewTypesUrl}
        userTypesUrl={manager.userTypesUrl}
        fetchOptions={manager.fetchSelectOptions}
        normalizeOptions={manager.normalizeOptions}
        onSubmit={manager.handleEditorSubmit}
      />

      <EventSliderDeleteModal
        open={manager.isDeleteOpen}
        onOpenChange={manager.setIsDeleteOpen}
        deletingRow={manager.deletingRow}
        isDeleting={manager.isDeleting}
        onConfirm={manager.handleDeleteConfirm}
      />
    </>
  );
}
