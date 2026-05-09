export function toOptionalNumber(value: string) {
  const normalized = value.trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function toOptionalString(value: string) {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}
