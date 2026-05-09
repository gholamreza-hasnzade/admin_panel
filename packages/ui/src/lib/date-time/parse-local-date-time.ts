import { normalizeLocaleDigits } from "./normalize-locale-digits";

export function parseLocalDateTime(input: string): Date | null {
  const normalizedLatin = normalizeLocaleDigits(input.trim());
  const match = normalizedLatin.match(
    /^(\d{4})[-/](\d{2})[-/](\d{2})[T\s]+(\d{2}):(\d{2})(?::(\d{2}))?$/,
  );
  if (!match) return null;

  const [, yearText, monthText, dayText, hourText, minuteText, secondText = "00"] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);

  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  if (hour < 0 || hour > 23) return null;
  if (minute < 0 || minute > 59) return null;
  if (second < 0 || second > 59) return null;

  const date = new Date(year, month - 1, day, hour, minute, second);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date.getHours() !== hour ||
    date.getMinutes() !== minute ||
    date.getSeconds() !== second
  ) {
    return null;
  }

  return date;
}
