import { api } from "@/lib/api";

import { notifConfig } from "../lib/config";

export async function fetchNotifById(id: number) {
  const response = await api.get(notifConfig.api.getById, { params: { id } });
  return response.data as unknown;
}

export async function deleteNotif(id: number) {
  await api.get(notifConfig.api.remove, { params: { id } });
}

export async function saveNotif(payload: Record<string, unknown>, isEditMode: boolean) {
  const url = isEditMode ? notifConfig.api.edit : notifConfig.api.add;
  await api.post(url, payload);
}
