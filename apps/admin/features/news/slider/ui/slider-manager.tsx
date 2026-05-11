"use client";

import { SliderDeleteModal } from "./slider-delete-modal";
import { SliderFormModal } from "./slider-form-modal";
import { SliderGrid } from "./slider-grid";
import { SliderHeader } from "./slider-header";
import { useSliderManager } from "../model/use-slider-manager";

export function SliderManager() {
  const manager = useSliderManager();

  return (
    <>
      <SliderHeader onAddClick={manager.openAddModal} />
      <SliderGrid onEditRow={manager.openEditModal} onDeleteRow={manager.openDeleteModal} />

      <SliderFormModal
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

      <SliderDeleteModal
        open={manager.isDeleteOpen}
        onOpenChange={manager.setIsDeleteOpen}
        deletingRow={manager.deletingRow}
        isDeleting={manager.isDeleting}
        onConfirm={manager.handleDeleteConfirm}
      />
    </>
  );
}
