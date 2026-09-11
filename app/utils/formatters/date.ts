import { getLocale, getLabel } from "../i18n";

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

export function formatDate(
  dateStr: string | Date | null | undefined,
): string {
  const date = parseUTCDate(dateStr);
  if (!date || isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat(getLocale(), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatCreatedBy(
  authorName?: string | null,
  dateStr?: string | Date | null,
): string {
  try {
    const date = parseUTCDate(dateStr);
    let locale = "pt-BR";
    try {
      locale = getLocale() || "pt-BR";
    } catch {
      locale = "pt-BR";
    }
    const isEn = locale === "en-US";

    let formattedDate: string | null = null;
    if (date && !isNaN(date.getTime())) {
      const day = new Intl.DateTimeFormat(locale, { day: "2-digit" }).format(date);
      const month = new Intl.DateTimeFormat(locale, { month: "2-digit" }).format(date);
      const time = new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(date);

      formattedDate = isEn
        ? `${month}/${day} at ${time}`
        : `${day}/${month} às ${time}h`;
    }

    const name = typeof authorName === "string" ? authorName.trim() : "";
    let defaultAuthor = isEn ? "Not defined" : "Não definido";
    try {
      const label = getLabel("labels.all.not_defined");
      if (label && label !== "labels.all.not_defined") {
        defaultAuthor = label;
      }
    } catch {
      // ignore
    }

    const displayName = name || defaultAuthor;

    if (formattedDate) {
      return isEn
        ? `${displayName} on ${formattedDate}`
        : `${displayName} em ${formattedDate}`;
    }
    if (name) {
      return name;
    }
    return "-";
  } catch {
    return typeof authorName === "string" && authorName ? authorName : "-";
  }
}
