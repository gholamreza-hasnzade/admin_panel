import { api } from "./api";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

function extractArrayPayload(raw: unknown) {
  if (Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== "object") return [];

  const record = raw as Record<string, unknown>;
  const candidates = ["data", "results", "items", "list", "value"];
  for (const key of candidates) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

/** Maps arbitrary API list payloads into `{ value, label }[]` for {@link SelectField}. */
export function normalizeOptions(raw: unknown): SelectOption[] {
  const rows = extractArrayPayload(raw);
  return rows
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const item = row as Record<string, unknown>;
      const value =
        item.value ??
        item.id ??
        item.key ??
        item.code ??
        item.typeId ??
        item.viewTypeId ??
        item.userTypeId ??
        "";
      const label = item.label ?? item.title ?? item.name ?? item.text ?? item.caption ?? value;
      const normalizedValue = String(value ?? "").trim();
      if (!normalizedValue) return null;
      return {
        value: normalizedValue,
        label: String(label ?? normalizedValue),
      };
    })
    .filter((option): option is SelectOption => Boolean(option));
}

export async function fetchSelectOptions(args: {
  url: string;
  params?: Record<string, string | number | boolean | null | undefined>;
}) {
  const response = await api.get(args.url, { params: args.params });
  return response.data as unknown;
}
