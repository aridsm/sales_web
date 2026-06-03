/**
 * Parses a date string that is known to be in UTC from the server.
 * If the string contains a time component (contains 'T') and lacks a timezone offset,
 * we append 'Z' to force JavaScript to parse it as UTC rather than local time.
 */
export function parseUTCDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;

  if (
    dateStr.includes("T") &&
    !dateStr.endsWith("Z") &&
    !/[+-]\d{2}:?\d{2}$/.test(dateStr)
  ) {
    return new Date(`${dateStr}Z`);
  }

  return new Date(dateStr);
}

/**
 * Formats a UTC date string to pt-BR format (dd/mm/yyyy hh:mm).
 */
export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  const date = parseUTCDate(dateStr);
  if (!date || isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
