"use client";

import { Link } from "@/i18n/navigation";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { getDateLocale } from "@/lib/date-locale";

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
  festival: { name: string; slug: string; location: string | null } | null;
  isSoldOut?: boolean;
};

type Props = {
  events: EventItem[];
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export function EventosList({ events }: Props) {
  const tFilters = useTranslations("filters.eventos");
  const tEventDetail = useTranslations("eventDetail");
  const locale = useLocale();
  const dateLocale = getDateLocale(locale);

  return (
    <motion.div
      className="space-y-4 lg:space-y-5"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {events.map((event) => {
        const d = new Date(event.date);
        const endD = event.endDate ? new Date(event.endDate) : null;
        return (
          <motion.div key={event.id} variants={item}>
            <Link
              href={`/eventos/${event.slug}`}
              className="group relative block overflow-hidden border-2 border-punk-red bg-punk-black p-6 transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_40px_rgba(230,0,38,0.15)] md:min-h-[140px]"
            >
              {event.imageUrl && (
                <>
                  <div
                    className="absolute inset-0 opacity-[0.15] bg-cover bg-[position:center_top]"
                    style={{ backgroundImage: `url(${event.imageUrl})` }}
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-r from-punk-black via-punk-black/70 to-transparent"
                    aria-hidden
                  />
                </>
              )}
              <div
                className="absolute right-0 top-0 h-16 w-16 border-t-2 border-r-2 border-punk-red"
                style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }}
              />
              <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="shrink-0 border-2 border-punk-red/50 bg-punk-red/10 px-6 py-3 text-center">
                  <span className="block font-display text-3xl leading-none text-punk-red">
                    {endD
                      ? `${format(d, "d", { locale: dateLocale })}-${format(endD, "d", { locale: dateLocale })}`
                      : format(d, "dd", { locale: dateLocale })}
                  </span>
                  <span className="block font-punch text-xs uppercase tracking-widest text-punk-white/70">
                    {format(d, "MMM", { locale: dateLocale })}
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-xl tracking-tighter text-punk-white transition-colors group-hover:text-punk-red sm:text-2xl">
                    {event.title}
                  </h2>
                  <p className="mt-1 font-body text-punk-white/70">
                    {event.venue
                      ? `${event.venue.name} · ${event.venue.city}`
                      : event.festival?.location ?? event.venueText ?? ""}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <span
                    className={`border-2 px-4 py-2 font-punch text-xs uppercase tracking-widest ${
                      event.type === "FESTIVAL"
                        ? "border-punk-red bg-punk-red/20 text-punk-red"
                        : "border-punk-white/40 bg-punk-black text-punk-white/90"
                    }`}
                  >
                    {event.type === "FESTIVAL"
                      ? tFilters("festival")
                      : tFilters("concert")}
                  </span>
                  {event.isSoldOut && (
                    <span className="border-2 border-punk-red bg-punk-red/30 px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-red">
                      {tEventDetail("soldOut")}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
