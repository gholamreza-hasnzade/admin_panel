import { api } from "@/lib/api";

import { eventsConfig } from "../lib/config";

export async function fetchEventsById(id: number) {
  const response = await api.get(eventsConfig.api.getById, { params: { id } });
  return response.data as unknown;
}

export async function saveEvent(payload: Record<string, unknown>, isEditMode: boolean) {
  const url = isEditMode ? eventsConfig.api.edit : eventsConfig.api.add;
  await api.post(url, payload);
}

export async function deleteEvent(id: number) {
  await api.get(eventsConfig.api.remove, { params: { id } });
}
