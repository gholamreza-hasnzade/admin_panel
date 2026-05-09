import { persianDateTimeStringToGregorianIso } from "../persian-datetime-utils";
import { normalizeLocaleDigits } from "./normalize-locale-digits";
import { parseLocalDateTime } from "./parse-local-date-time";

function formatDate(date: Date) {
  const pad = (num: number) => String(num).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function toBackendDateTimeString(value: string) {
  const normalized = value.trim();
  if (!normalized) return null;

  const gregorianIso = persianDateTimeStringToGregorianIso(normalized);
  if (gregorianIso) return normalizeLocaleDigits(gregorianIso);

  const parsed = parseLocalDateTime(normalized);
  if (!parsed) return null;
  return formatDate(parsed);
}

export function toBackendDateTimeTimestamp(value: string) {
  const backendDateTime = toBackendDateTimeString(value);
  if (!backendDateTime) return null;

  const direct = Date.parse(backendDateTime);
  if (Number.isFinite(direct)) return direct;

  const parsed = parseLocalDateTime(backendDateTime);
  return parsed ? parsed.getTime() : null;
}
