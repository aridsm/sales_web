import ptBR from "@/locales/pt-BR.json";
import enUS from "@/locales/en-US.json";

type LocaleMessages = Record<string, unknown>;

const locales: Record<string, LocaleMessages> = {
  "pt-BR": ptBR,
  "en-US": enUS,
};

const DEFAULT_LOCALE = "pt-BR";

import { useLocaleStore } from "@/stores/localeStore";

export function setLocale(locale: string) {
  if (locales[locale]) {
    useLocaleStore.getState().setLocale(locale);
  }
}

export function getLocale(): string {
  return useLocaleStore.getState().locale;
}

function resolve(obj: unknown, path: string): string | undefined {
  const keys = path.split(".");
  let value: unknown = obj;
  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return undefined;
    }
  }
  return typeof value === "string" ? value : undefined;
}

function formatList(items: unknown[]): string {
  const strings = items.map(String);
  if (strings.length <= 1) return strings[0] ?? "";
  return `${strings.slice(0, -1).join(", ")} e ${strings[strings.length - 1]}`;
}

function interpolate(
  template: string,
  params: Record<string, unknown>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = params[key];
    if (value === undefined || value === null) return `{{${key}}}`;
    if (Array.isArray(value)) return formatList(value);
    return String(value);
  });
}

// route ex: "labels.products.close"

export function getLabel(
  route: string,
  params?: Record<string, unknown>,
  forceLocale?: string,
): string {
  const targetLocale = forceLocale || getLocale();
  const messages = locales[targetLocale] ?? locales[DEFAULT_LOCALE];
  let value = resolve(messages, route);

  if (!value && route.startsWith("errors.")) {
    const parts = route.split(".");
    if (parts.length === 3) {
      const errorCode = parts[2];
      value = resolve(messages, `errors.all.${errorCode}`);
    }
  }

  if (!value) return route;
  return params ? interpolate(value, params) : value;
}

export function useTranslation() {
  const locale = useLocaleStore((state) => state.locale);
  return {
    t: (route: string, params?: Record<string, unknown>) => getLabel(route, params, locale),
    locale
  };
}
