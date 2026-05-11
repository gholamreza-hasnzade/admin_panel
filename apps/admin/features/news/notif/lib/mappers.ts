import type { NotifFormValues, NotifItem } from "../model/types";

function extractEntityPayload(raw: unknown) {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const candidates = ["data", "result", "item", "value"];
  for (const key of candidates) {
    const value = record[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
  }
  return record;
}

export function mapEntityToNotifItem(raw: unknown): NotifItem | null {
  const entity = extractEntityPayload(raw);
  if (!entity) return null;
  const id = Number(entity.id ?? entity.notificationId);
  if (!Number.isFinite(id)) return null;

  return {
    id,
    title: (entity.title as string | null | undefined) ?? null,
    shortText: (entity.shortText as string | null | undefined) ?? null,
    longText: (entity.longText as string | null | undefined) ?? null,
    startDate: (entity.startDate as string | null | undefined) ?? null,
    endDate: (entity.endDate as string | null | undefined) ?? null,
    pStartDate: (entity.pStartDate as string | null | undefined) ?? null,
    pEndDate: (entity.pEndDate as string | null | undefined) ?? null,
    creator: (entity.creator as string | null | undefined) ?? null,
    visible: entity.visible == null ? null : Boolean(entity.visible),
    viewSide: entity.viewSide == null ? null : Number(entity.viewSide),
    viewSideTitle: (entity.viewSideTitle as string | null | undefined) ?? null,
    userType: entity.userType == null ? null : Number(entity.userType),
    userTypeTitle: (entity.userTypeTitle as string | null | undefined) ?? null,
    deleted: entity.deleted == null ? null : Boolean(entity.deleted),
    orderIndex: entity.orderIndex == null ? null : Number(entity.orderIndex),
  };
}

export function mapRowToNotifForm(row: NotifItem): NotifFormValues {
  return {
    title: row.title ?? "",
    shortText: row.shortText ?? "",
    longText: row.longText ?? "",
    startDate: row.startDate ?? "",
    endDate: row.endDate ?? "",
    creator: row.creator ?? "",
    visible: row.visible == null ? "true" : String(row.visible),
    viewSide: row.viewSide == null ? "" : String(row.viewSide),
    userType: row.userType == null ? "" : String(row.userType),
    orderIndex: row.orderIndex == null ? "" : String(row.orderIndex),
  };
}
