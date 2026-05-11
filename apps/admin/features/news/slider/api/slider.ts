import { api } from "@/lib/api";

import { eventSliderConfig } from "../lib/config";

export async function fetchSliderById(id: number) {
  const response = await api.get(eventSliderConfig.api.getById, { params: { id } });
  return response.data as unknown;
}

export async function saveSlider(payload: Record<string, unknown>, isEditMode: boolean) {
  const url = isEditMode ? eventSliderConfig.api.edit : eventSliderConfig.api.add;
  await api.post(url, payload);
}

export async function deleteSlider(id: number) {
  await api.get(eventSliderConfig.api.remove, { params: { id } });
}
