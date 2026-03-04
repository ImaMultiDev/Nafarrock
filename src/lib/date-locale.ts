import { es, eu } from "date-fns/locale";
import type { Locale } from "date-fns";

export const dateLocales: Record<string, Locale> = {
  es,
  eu,
};

export function getDateLocale(locale: string): Locale {
  return dateLocales[locale] ?? es;
}
