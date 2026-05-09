"use client";

import { EventSliderDeleteModal } from "./event-slider-delete-modal";
import { EventSliderFormModal } from "./event-slider-form-modal";
import { EventSliderGrid } from "./event-slider-grid";
import { EventSliderHeader } from "./event-slider-header";
import { useEventSliderManager } from "../hooks/use-event-slider-manager";

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
        form={manager.form}
        errors={manager.formErrors}
        isSaving={manager.isSaving}
        isFetchingEditItem={manager.isFetchingEditItem}
        viewTypesUrl={manager.viewTypesUrl}
        userTypesUrl={manager.userTypesUrl}
        fetchOptions={manager.fetchSelectOptions}
        normalizeOptions={manager.normalizeOptions}
        onFieldChange={manager.onFieldChange}
        onConfirm={manager.handleEditorConfirm}
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
