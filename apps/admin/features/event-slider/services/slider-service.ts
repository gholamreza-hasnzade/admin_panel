import { api } from "@/lib/api";

import { eventSliderConfig } from "../config/slider-config";

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

export async function fetchSelectOptions(args: {
  url: string;
  params?: Record<string, string | number | boolean | null | undefined>;
}) {
  const response = await api.get(args.url, { params: args.params });
  return response.data as unknown;
}
