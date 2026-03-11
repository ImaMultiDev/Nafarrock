"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { useLocale } from "next-intl";
import { getDateLocale } from "@/lib/date-locale";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";

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

export function FeaturedEventsHero({ events }: Props) {
  const locale = useLocale();
  const dateLocale = getDateLocale(locale);
  const t = useTranslations("home.featuredEvents");

  if (events.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.6, duration: 0.6 }}
      className="w-full shrink-0 lg:w-80 xl:w-96"
    >
      <h2 className="mb-4 flex items-center gap-2 font-punch text-xs uppercase tracking-[0.2em] text-punk-yellow/90">
        <Star size={14} className="fill-punk-yellow" />
        {t("title")}
      </h2>
      {/* Mobile: carrusel horizontal | Desktop: columna vertical */}
      <div className="-mx-6 flex gap-3 overflow-x-auto pl-6 pr-0 pb-2 scrollbar-hide [scroll-snap-type:x_mandatory] lg:mx-0 lg:flex-col lg:overflow-visible lg:pl-0 lg:pr-0 lg:pb-0 lg:snap-none">
        {events.map((event) => {
          const d = new Date(event.date);
          const endD = event.endDate ? new Date(event.endDate) : null;
          return (
            <Link
              key={event.id}
              href={`/eventos/${event.slug}`}
              className="group relative flex min-w-[260px] shrink-0 snap-center overflow-hidden rounded border-2 border-punk-yellow/40 bg-gradient-to-br from-punk-black via-punk-black to-punk-yellow/5 shadow-[0_0_20px_rgba(255,214,10,0.08)] transition-all duration-300 hover:border-punk-yellow hover:shadow-[0_0_24px_rgba(255,214,10,0.2)] lg:min-w-0 lg:shrink"
            >
              {/* Etiqueta VIP */}
              <div className="absolute right-0 top-0 z-20 border-b-2 border-l-2 border-punk-yellow/60 bg-punk-yellow/20 px-2 py-1 font-punch text-[10px] uppercase tracking-widest text-punk-yellow">
                {t("badge")}
              </div>
              {/* Imagen de fondo */}
              {event.imageUrl && (
                <>
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-25 transition-opacity group-hover:opacity-35"
                    style={{ backgroundImage: `url(${event.imageUrl})` }}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-punk-black via-punk-black/95 to-punk-black/80" />
                </>
              )}
              <div className="relative z-10 flex min-h-0 w-full gap-3 p-3 sm:p-4">
                <div className="shrink-0 border-2 border-punk-yellow/40 bg-punk-yellow/10 px-3 py-2 text-center sm:px-4">
                  <span className="block font-display text-lg leading-none text-punk-yellow sm:text-xl">
                    {endD
                      ? `${format(d, "d", { locale: dateLocale })}-${format(endD, "d", { locale: dateLocale })}`
                      : format(d, "dd", { locale: dateLocale })}
                  </span>
                  <span className="block font-punch text-[10px] uppercase tracking-widest text-punk-white/70 sm:text-xs">
                    {format(d, "MMM", { locale: dateLocale })}
                  </span>
                </div>
                <div className="min-w-0 flex-1 pr-8">
                  <h3 className="truncate font-display text-sm font-medium text-punk-white transition-colors group-hover:text-punk-yellow sm:text-base">
                    {event.title}
                  </h3>
                  <p className="mt-0.5 truncate font-body text-xs text-punk-white/60">
                    {event.venue ? `${event.venue.name} · ${event.venue.city}` : event.venueText ?? ""}
                  </p>
                  <span
                    className={`mt-1.5 inline-block border px-2 py-0.5 font-punch text-[10px] uppercase tracking-widest ${
                      event.type === "FESTIVAL"
                        ? "border-punk-yellow/60 text-punk-yellow/90"
                        : "border-punk-white/30 text-punk-white/70"
                    }`}
                  >
                    {event.type === "FESTIVAL" ? "Festival" : "Concierto"}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}
