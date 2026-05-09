export function normalizeLocaleDigits(value: string) {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";

  return value.replace(/[۰-۹٠-٩]/g, (char) => {
    const faIndex = persianDigits.indexOf(char);
    if (faIndex >= 0) return String(faIndex);

    const arIndex = arabicDigits.indexOf(char);
    if (arIndex >= 0) return String(arIndex);

    return char;
  });
}
