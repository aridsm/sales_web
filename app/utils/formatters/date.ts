import { getLocale } from "../i18n";

export function parseUTCDate(
  dateStr: string | Date | null | undefined,
): Date | null {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;

  if (
    dateStr.includes("T") &&
    !dateStr.endsWith("Z") &&
    !/[+-]\d{2}:?\d{2}$/.test(dateStr)
  ) {
    return new Date(`${dateStr}Z`);
  }

  return new Date(dateStr);
}

export function formatDateTime(
  dateStr: string | Date | null | undefined,
): string {
  const date = parseUTCDate(dateStr);
  if (!date || isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat(getLocale(), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
