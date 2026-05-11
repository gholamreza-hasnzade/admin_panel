import { api } from "@/lib/api";

import { sliderConfig } from "../lib/config";

export async function fetchSliderById(id: number) {
  const response = await api.get(sliderConfig.api.getById, { params: { id } });
  return response.data as unknown;
}

export async function saveSlider(payload: Record<string, unknown>, isEditMode: boolean) {
  const url = isEditMode ? sliderConfig.api.edit : sliderConfig.api.add;
  await api.post(url, payload);
}

export async function deleteSlider(id: number) {
  await api.get(sliderConfig.api.remove, { params: { id } });
}
