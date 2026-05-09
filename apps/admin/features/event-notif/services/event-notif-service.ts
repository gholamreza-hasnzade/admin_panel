import { api } from "@/lib/api";

import { eventNotifConfig } from "../config/event-notif-config";

export async function fetchEventNotifById(id: number) {
  const response = await api.get(eventNotifConfig.api.getById, { params: { id } });
  return response.data as unknown;
}

export async function deleteEventNotif(id: number) {
  await api.get(eventNotifConfig.api.remove, { params: { id } });
}

export async function saveEventNotif(payload: Record<string, unknown>, isEditMode: boolean) {
  const url = isEditMode ? eventNotifConfig.api.edit : eventNotifConfig.api.add;
  await api.post(url, payload);
}
