"use client";

import { Link } from "@/i18n/navigation";
import { format } from "date-fns";
import { useLocale } from "next-intl";
import { getDateLocale } from "@/lib/date-locale";
import type { Locale } from "date-fns";
import { useTranslations } from "next-intl";

type EventItem = {
  id: string;
  slug: string;
  title: string;
  date: string;
  endDate: string | null;
  type: string;
  imageUrl: string | null;
  venue: { name: string; city: string } | null;
  venueText: string | null;
  festival: { name: string; slug: string; location: string | null } | null;
  isSoldOut?: boolean;
};

type Props = {
  event: EventItem;
  dateLocale: Locale;
};

export function EventosOptimizedCard({ event, dateLocale }: Props) {
  const tFilters = useTranslations("filters.eventos");
  const tEventDetail = useTranslations("eventDetail");
  const d = new Date(event.date);
  const endD = event.endDate ? new Date(event.endDate) : null;

  return (
    <Link
      href={`/eventos/${event.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border-2 border-punk-white/10 bg-punk-black transition-all duration-300 hover:border-punk-red/50 hover:shadow-[0_0_24px_rgba(230,0,38,0.12)] active:scale-[0.99]"
    >
      {/* Imagen: zona superior, altura fija, más visible */}
      <div className="relative h-32 w-full shrink-0 overflow-hidden sm:h-40 lg:h-44">
        {event.imageUrl ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{ backgroundImage: `url(${event.imageUrl})` }}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-punk-black via-punk-black/40 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-punk-black/80" />
        )}
        {/* Badge fecha sobre imagen */}
        <div className="absolute bottom-2 left-2 border-2 border-punk-red/70 bg-punk-black/90 px-3 py-2 backdrop-blur-sm">
          <span className="block font-display text-xl leading-none text-punk-red sm:text-2xl">
            {endD
              ? `${format(d, "d", { locale: dateLocale })}-${format(endD, "d", { locale: dateLocale })}`
              : format(d, "dd", { locale: dateLocale })}
          </span>
          <span className="block font-punch text-[10px] uppercase tracking-widest text-punk-white/80">
            {format(d, "MMM", { locale: dateLocale })}
          </span>
        </div>
        {event.type === "FESTIVAL" && (
          <span className="absolute right-2 top-2 border border-punk-red/60 bg-punk-red/25 px-2 py-1 font-punch text-[10px] uppercase tracking-widest text-punk-red backdrop-blur-sm">
            {tFilters("festival")}
          </span>
        )}
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h2 className="font-display text-lg font-semibold leading-tight text-punk-white transition-colors group-hover:text-punk-red line-clamp-2 sm:text-xl">
          {event.title}
        </h2>
        <p className="font-body text-sm text-punk-white/70 line-clamp-1">
          {event.venue
            ? `${event.venue.name} · ${event.venue.city}`
            : event.festival?.location ?? event.venueText ?? ""}
        </p>
        <div className="mt-auto flex flex-wrap gap-2">
          {event.type !== "FESTIVAL" && (
            <span className="border border-punk-white/40 px-2.5 py-1 font-punch text-[10px] uppercase tracking-widest text-punk-white/80">
              {tFilters("concert")}
            </span>
          )}
          {event.isSoldOut && (
            <span className="border border-punk-red bg-punk-red/25 px-2.5 py-1 font-punch text-[10px] uppercase tracking-widest text-punk-red">
              {tEventDetail("soldOut")}
            </span>
          )}
        </div>
      </div>

      {/* Esquina decorativa */}
      <div
        className="absolute right-0 top-0 h-10 w-10 border-t-2 border-r-2 border-punk-red/30 opacity-0 transition-opacity group-hover:opacity-100"
        style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }}
      />
    </Link>
  );
}
