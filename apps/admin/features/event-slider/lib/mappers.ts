import type { SliderFormValues, SliderItem } from "../model/types";

export function mapRowToForm(row: SliderItem): SliderFormValues {
  return {
    title: row.title ?? "",
    subTitle: row.subTitle ?? "",
    imageUrl: row.imageUrl ?? "",
    href: row.href ?? "",
    startDate: row.startDate ?? "",
    endDate: row.endDate ?? "",
    width: row.width == null ? "" : String(row.width),
    height: row.height == null ? "" : String(row.height),
    viewType: row.viewType == null ? "" : String(row.viewType),
    userType: row.userType == null ? "" : String(row.userType),
    orderIndex: row.orderIndex == null ? "" : String(row.orderIndex),
  };
}

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

export function mapEntityToSliderItem(raw: unknown): SliderItem | null {
  const entity = extractEntityPayload(raw);
  if (!entity) return null;
  const id = Number(entity.id ?? entity.sliderId);
  if (!Number.isFinite(id)) return null;

  return {
    id,
    title: (entity.title as string | null | undefined) ?? null,
    subTitle: (entity.subTitle as string | null | undefined) ?? null,
    imageUrl: (entity.imageUrl as string | null | undefined) ?? null,
    startDate: (entity.startDate as string | null | undefined) ?? null,
    endDate: (entity.endDate as string | null | undefined) ?? null,
    pStartDate: (entity.pStartDate as string | null | undefined) ?? null,
    pEndDate: (entity.pEndDate as string | null | undefined) ?? null,
    width: entity.width == null ? null : Number(entity.width),
    height: entity.height == null ? null : Number(entity.height),
    viewType: entity.viewType == null ? null : Number(entity.viewType),
    userType: entity.userType == null ? null : Number(entity.userType),
    href: (entity.href as string | null | undefined) ?? null,
    orderIndex: entity.orderIndex == null ? null : Number(entity.orderIndex),
  };
}
