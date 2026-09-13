"use client";

import { format } from "date-fns";
import { useLocale, useTranslations } from "next-intl";
import { formatEventDayBadge, getDateLocale } from "@/lib/date-locale";
import { Link } from "@/i18n/navigation";
import { Calendar } from "lucide-react";

type EventItem = {
  id: string;
  slug: string;
  title: string;
  date: Date | string;
  endDate: Date | string | null;
  type: string;
  imageUrl: string | null;
  venue: { name: string; city: string } | null;
  venueText: string | null;
};

type Props = {
  events: EventItem[];
};

/**
 * Cards sin motion ni sombras expansivas: evita repaints/compositing
 * que hacen parpadear fecha y badge en las cards hermanas.
 */
export function DataFocusedEvents({ events }: Props) {
  const locale = useLocale();
  const dateLocale = getDateLocale(locale);
  const t = useTranslations("home.upcomingEvents");

  if (events.length === 0) return null;

  return (
    <section className="px-4 py-8 sm:px-6 sm:py-10 lg:px-12 lg:py-14">
      <div className="mx-auto max-w-7xl 2xl:max-w-content-wide">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 sm:mb-8">
          <h2 className="flex items-center gap-2 font-punch text-sm uppercase tracking-[0.2em] text-punk-red sm:text-base">
            <Calendar size={18} className="text-punk-red" aria-hidden />
            {t("title")}
          </h2>
          <Link
            href="/eventos"
            className="font-punch text-xs uppercase tracking-widest text-punk-red/90 transition-colors hover:text-punk-red sm:text-sm"
          >
            {t("viewAll")} →
          </Link>
        </div>

        <ul className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {events.map((event) => {
            const d = new Date(event.date);
            const endD = event.endDate ? new Date(event.endDate) : null;
            const isFestival = event.type === "FESTIVAL";

            return (
              <li key={event.id} className="min-w-0 [contain:paint] [isolation:isolate]">
                <Link
                  href={`/eventos/${event.slug}`}
                  className="relative flex h-full overflow-hidden rounded-xl border-2 border-punk-white/15 bg-punk-black outline-none transition-colors duration-150 hover:border-punk-red focus-visible:border-punk-red"
                >
                  {event.imageUrl ? (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${event.imageUrl})`,
                        opacity: 0.22,
                      }}
                    />
                  ) : null}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-punk-black via-punk-black/92 to-punk-black/70"
                  />

                  <div className="relative z-10 flex w-full gap-4 p-4 sm:p-5">
                    <div className="shrink-0 border-2 border-punk-red bg-[#1a0508] px-4 py-3 text-center">
                      <span className="block font-display text-2xl leading-none text-punk-red sm:text-3xl">
                        {formatEventDayBadge(d, endD, dateLocale)}
                      </span>
                      <span className="block font-punch text-xs uppercase tracking-widest text-punk-white/80">
                        {format(d, "MMM", { locale: dateLocale })}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-lg font-semibold leading-tight text-punk-white sm:text-xl">
                        {event.title}
                      </h3>
                      <p className="mt-1 font-body text-sm text-punk-white/70">
                        {event.venue
                          ? `${event.venue.name} · ${event.venue.city}`
                          : event.venueText ?? ""}
                      </p>
                      <span
                        className={`mt-2 inline-block border px-2.5 py-1 font-punch text-[10px] uppercase tracking-widest ${
                          isFestival
                            ? "border-punk-red text-punk-red"
                            : "border-punk-white/40 text-punk-white/80"
                        }`}
                      >
                        {isFestival ? "Festival" : "Concierto"}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
