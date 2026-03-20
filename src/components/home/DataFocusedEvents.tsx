"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { useLocale } from "next-intl";
import { getDateLocale } from "@/lib/date-locale";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
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

export function DataFocusedEvents({ events }: Props) {
  const locale = useLocale();
  const dateLocale = getDateLocale(locale);
  const t = useTranslations("home.upcomingEvents");

  if (events.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="px-4 py-8 sm:px-6 sm:py-10 lg:px-12 lg:py-14"
    >
      <div className="mx-auto max-w-7xl 2xl:max-w-content-wide">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 sm:mb-8">
          <h2 className="flex items-center gap-2 font-punch text-sm uppercase tracking-[0.2em] text-punk-red sm:text-base">
            <Calendar size={18} className="text-punk-red" />
            {t("title")}
          </h2>
          <Link
            href="/eventos"
            className="font-punch text-xs uppercase tracking-widest text-punk-red/90 transition-colors hover:text-punk-red sm:text-sm"
          >
            {t("viewAll")} →
          </Link>
        </div>

        {/* Grid: mobile 1 col, tablet 2, desktop 3 */}
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {events.map((event, i) => {
            const d = new Date(event.date);
            const endD = event.endDate ? new Date(event.endDate) : null;
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.4 }}
              >
                <Link
                  href={`/eventos/${event.slug}`}
                  className="group relative flex overflow-hidden rounded-xl border-2 border-punk-white/10 bg-punk-black/80 transition-all duration-300 hover:border-punk-red/50 hover:shadow-[0_0_24px_rgba(230,0,38,0.15)]"
                >
                  {/* Imagen */}
                  {event.imageUrl && (
                    <>
                      <div
                        className="absolute inset-0 bg-cover bg-center opacity-25 transition-opacity group-hover:opacity-35"
                        style={{ backgroundImage: `url(${event.imageUrl})` }}
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-punk-black via-punk-black/90 to-punk-black/60" />
                    </>
                  )}

                  <div className="relative z-10 flex w-full flex-col gap-4 p-4 sm:p-5">
                    <div className="flex gap-4">
                      <div className="shrink-0 border-2 border-punk-red/50 bg-punk-red/10 px-4 py-3 text-center">
                        <span className="block font-display text-2xl leading-none text-punk-red sm:text-3xl">
                          {endD
                            ? `${format(d, "d", { locale: dateLocale })}-${format(endD, "d", { locale: dateLocale })}`
                            : format(d, "dd", { locale: dateLocale })}
                        </span>
                        <span className="block font-punch text-xs uppercase tracking-widest text-punk-white/80">
                          {format(d, "MMM", { locale: dateLocale })}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-lg font-semibold leading-tight text-punk-white transition-colors group-hover:text-punk-red sm:text-xl">
                          {event.title}
                        </h3>
                        <p className="mt-1 font-body text-sm text-punk-white/70">
                          {event.venue
                            ? `${event.venue.name} · ${event.venue.city}`
                            : event.venueText ?? ""}
                        </p>
                        <span
                          className={`mt-2 inline-block border px-2.5 py-1 font-punch text-[10px] uppercase tracking-widest ${
                            event.type === "FESTIVAL"
                              ? "border-punk-red/60 text-punk-red/90"
                              : "border-punk-white/30 text-punk-white/70"
                          }`}
                        >
                          {event.type === "FESTIVAL" ? "Festival" : "Concierto"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="absolute right-0 top-0 h-10 w-10 border-t-2 border-r-2 border-punk-red/40 opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }}
                  />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
