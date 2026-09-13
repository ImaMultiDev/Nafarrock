import { es, eu } from "date-fns/locale";
import { format, isSameDay } from "date-fns";
import type { Locale } from "date-fns";

export const dateLocales: Record<string, Locale> = {
  es,
  eu,
};

export function getDateLocale(locale: string): Locale {
  return dateLocales[locale] ?? es;
}

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

/** true si hay endDate y cae en un día de calendario distinto al de inicio */
export function isMultiDayEvent(
  start: Date | string,
  end: Date | string | null | undefined
): boolean {
  if (!end) return false;
  return !isSameDay(toDate(start), toDate(end));
}

/**
 * Día(s) para badges de evento: "6" o "6-8".
 * Si solo hay un día (sin endDate o mismo día), un solo número — nunca "6-6".
 */
export function formatEventDayBadge(
  start: Date | string,
  end: Date | string | null | undefined,
  locale: Locale
): string {
  const d = toDate(start);
  if (!isMultiDayEvent(d, end)) {
    return format(d, "d", { locale });
  }
  return `${format(d, "d", { locale })}-${format(toDate(end!), "d", { locale })}`;
}

/**
 * Fecha legible de evento.
 * Un día → "viernes 6 de junio, 2026" / euskera equivalente.
 * Varios días → "Del 6 de junio al 8 de junio, 2026" / euskera con tik…ra.
 */
export function formatEventDateLabel(
  start: Date | string,
  end: Date | string | null | undefined,
  localeCode: string,
  dateLocale: Locale
): string {
  const d = toDate(start);
  if (!isMultiDayEvent(d, end)) {
    if (localeCode === "eu") {
      const year = format(d, "yyyy", { locale: dateLocale });
      const month = format(d, "MMMM", { locale: dateLocale });
      const monthGenitive = month.endsWith("a")
        ? `${month.slice(0, -1)}aren`
        : `${month}ren`;
      const day = format(d, "d", { locale: dateLocale });
      return `${year}ko ${monthGenitive} ${day}a`;
    }
    return format(d, "EEEE d 'de' MMMM, yyyy", { locale: dateLocale });
  }

  const endD = toDate(end!);
  if (localeCode === "eu") {
    const year = format(d, "yyyy", { locale: dateLocale });
    const month = format(d, "MMMM", { locale: dateLocale });
    const monthGenitive = month.endsWith("a")
      ? `${month.slice(0, -1)}aren`
      : `${month}ren`;
    const startDay = format(d, "d", { locale: dateLocale });
    const endDay = format(endD, "d", { locale: dateLocale });
    return `${year}ko ${monthGenitive} ${startDay}tik ${endDay}ra`;
  }
  return `Del ${format(d, "d 'de' MMMM", { locale: dateLocale })} al ${format(endD, "d 'de' MMMM, yyyy", { locale: dateLocale })}`;
}
