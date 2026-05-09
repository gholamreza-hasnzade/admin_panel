import DateObject from "react-date-object";
import gregorian from "react-date-object/calendars/gregorian";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const DEFAULT_DISPLAY_FORMAT = "YYYY/MM/DD HH:mm";

/**
 * رشتهٔ نمایشی شمسی (مثلاً از `PersianDateTimeField`) را به ISO میلادی بدون منطقهٔ زمانی برمی‌گرداند.
 * برای ارسال به API مناسب است؛ در صورت نامعتبر بودن ورودی `null` برمی‌گردد.
 */
export function persianDateTimeStringToGregorianIso(
  persianDisplay: string,
  displayFormat: string = DEFAULT_DISPLAY_FORMAT,
): string | null {
  const trimmed = persianDisplay.trim();
  if (!trimmed) return null;

  const formatsToTry = [displayFormat, "YYYY/MM/DD HH:mm", "YYYY/MM/DD"];
  for (const format of formatsToTry) {
    try {
      const jalali = new DateObject({
        date: trimmed,
        calendar: persian,
        locale: persian_fa,
        format,
      });
      const gregorianDate = jalali.convert(gregorian);
      return gregorianDate.format("YYYY-MM-DDTHH:mm:ss");
    } catch {
      // try next format
    }
  }
  return null;
}
