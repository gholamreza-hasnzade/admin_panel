import type { EventItem, EventsFormValues } from "../model/types";

function extractEntityPayload(raw: unknown) {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const candidates = ["data", "result", "item", "value"];
  for (const key of candidates) {
    const value = record[key];
    if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
  }
  return record;
}

export function mapEntityToEventItem(raw: unknown): EventItem | null {
  const entity = extractEntityPayload(raw);
  if (!entity) return null;

  const id = Number(entity.id ?? entity.eventId);
  if (!Number.isFinite(id)) return null;

  return {
    id,
    title: (entity.title as string | null | undefined) ?? null,
    startDate: (entity.startDate as string | null | undefined) ?? null,
    endDate: (entity.endDate as string | null | undefined) ?? null,
    pStartDate: (entity.pStartDate as string | null | undefined) ?? null,
    pEndDate: ((entity.pEndDate ?? entity.pEndtDate) as string | null | undefined) ?? null,
    status: entity.status == null ? null : Number(entity.status),
    visible: entity.visible == null ? null : Boolean(Number(entity.visible)),
    orderIndex: entity.orderIndex == null ? null : Number(entity.orderIndex),
    presenter: (entity.presenter as string | null | undefined) ?? null,
  };
}

export function mapRowToEventForm(row: EventItem): EventsFormValues {
  return {
    title: row.title ?? "",
    presenter: row.presenter ?? "",
    startDate: row.startDate ?? "",
    endDate: row.endDate ?? "",
    status: row.status == null ? "" : String(row.status),
    visible: row.visible == null ? "true" : String(row.visible),
    orderIndex: row.orderIndex == null ? "0" : String(row.orderIndex),
  };
}
