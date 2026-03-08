"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { useLocale } from "next-intl";
import { getDateLocale } from "@/lib/date-locale";
import { Link } from "@/i18n/navigation";

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
  title: string;
  viewAllLabel: string;
};

export function UpcomingEventsHero({ events, title, viewAllLabel }: Props) {
  const locale = useLocale();
  const dateLocale = getDateLocale(locale);

  if (events.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.6, duration: 0.6 }}
      className="w-full shrink-0 lg:w-80 xl:w-96"
    >
      <h2 className="mb-4 font-punch text-xs uppercase tracking-[0.2em] text-punk-red/90">
        {title}
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x lg:flex-col lg:overflow-visible lg:pb-0 lg:snap-none lg:gap-3">
        {events.map((event) => {
          const d = new Date(event.date);
          const endD = event.endDate ? new Date(event.endDate) : null;
          return (
          <Link
            key={event.id}
            href={`/eventos/${event.slug}`}
            className="group relative flex min-w-[260px] shrink-0 snap-center overflow-hidden border-2 border-punk-white/10 bg-punk-black/80 transition-all duration-300 hover:border-punk-red/60 hover:shadow-[0_0_20px_rgba(230,0,38,0.15)] lg:min-w-0 lg:shrink"
          >
            {/* Imagen de fondo sutil */}
            {event.imageUrl && (
              <>
                <div
                  className="absolute inset-0 opacity-20 bg-cover bg-center transition-opacity group-hover:opacity-30"
                  style={{ backgroundImage: `url(${event.imageUrl})` }}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-punk-black via-punk-black/90 to-punk-black/70" />
              </>
            )}
            <div className="relative z-10 flex min-h-0 w-full gap-3 p-3 sm:p-4">
              {/* Bloque fecha */}
              <div className="shrink-0 border-2 border-punk-red/50 bg-punk-red/10 px-3 py-2 text-center sm:px-4">
                <span className="block font-display text-lg leading-none text-punk-red sm:text-xl">
                  {endD
                    ? `${format(d, "d", { locale: dateLocale })}-${format(endD, "d", { locale: dateLocale })}`
                    : format(d, "dd", { locale: dateLocale })}
                </span>
                <span className="block font-punch text-[10px] uppercase tracking-widest text-punk-white/70 sm:text-xs">
                  {format(d, "MMM", { locale: dateLocale })}
                </span>
              </div>
              {/* Título + lugar */}
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-display text-sm font-medium text-punk-white transition-colors group-hover:text-punk-red sm:text-base">
                  {event.title}
                </h3>
                <p className="mt-0.5 truncate font-body text-xs text-punk-white/60">
                  {event.venue ? `${event.venue.name} · ${event.venue.city}` : event.venueText ?? ""}
                </p>
                <span
                  className={`mt-1.5 inline-block border px-2 py-0.5 font-punch text-[10px] uppercase tracking-widest ${
                    event.type === "FESTIVAL"
                      ? "border-punk-red/60 text-punk-red/90"
                      : "border-punk-white/30 text-punk-white/70"
                  }`}
                >
                  {event.type === "FESTIVAL" ? "Festival" : "Concierto"}
                </span>
              </div>
            </div>
            {/* Esquina punk */}
            <div
              className="absolute right-0 top-0 h-8 w-8 border-t-2 border-r-2 border-punk-red/40 opacity-0 transition-opacity group-hover:opacity-100"
              style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }}
            />
          </Link>
          );
        })}
      </div>
      <Link
        href="/eventos"
        className="mt-4 inline-block font-punch text-xs uppercase tracking-widest text-punk-red/90 transition-colors hover:text-punk-red"
      >
        {viewAllLabel} →
      </Link>
    </motion.div>
  );
}
