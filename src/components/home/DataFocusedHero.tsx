"use client";

import Image from "next/image";
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
  featuredEvents: EventItem[];
};

export function DataFocusedHero({ featuredEvents }: Props) {
  const locale = useLocale();
  const dateLocale = getDateLocale(locale);
  const t = useTranslations("home");
  const tFeatured = useTranslations("home.featuredEvents");

  return (
    <section className="relative overflow-hidden border-b-2 border-punk-red/30 bg-punk-black">
      {/* Fondo sutil */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(230,0,38,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(230,0,38,0.5) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 px-4 py-6 sm:px-6 sm:py-8 lg:px-12 lg:py-10">
        <div className="mx-auto max-w-7xl 2xl:max-w-content-wide">
          {/* Logo + tagline compacto */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6 flex flex-col items-center gap-2 sm:mb-8 lg:mb-10"
          >
            <Link href="/" className="transition-opacity hover:opacity-90">
              <Image
                src="/logo.png"
                alt="Nafarrock"
                width={120}
                height={120}
                className="h-14 w-auto sm:h-16 lg:h-20"
                priority
              />
            </Link>
            <p className="font-punch text-[10px] uppercase tracking-[0.25em] text-punk-green/90 sm:text-xs">
              {t("tagline")}
            </p>
          </motion.div>

          {/* Eventos destacados: foco principal */}
          {featuredEvents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h2 className="mb-4 flex items-center justify-center gap-2 font-punch text-xs uppercase tracking-[0.2em] text-punk-yellow sm:mb-5 sm:text-sm">
                <Star size={16} className="fill-punk-yellow text-punk-yellow" />
                {tFeatured("title")}
              </h2>

              {/* Mobile: 1 card grande o scroll horizontal | Desktop: grid 2-3 cards */}
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide [scroll-snap-type:x_mandatory] lg:grid lg:grid-cols-2 lg:overflow-visible lg:gap-6 xl:grid-cols-3">
                {featuredEvents.slice(0, 3).map((event) => {
                  const d = new Date(event.date);
                  const endD = event.endDate ? new Date(event.endDate) : null;
                  return (
                    <Link
                      key={event.id}
                      href={`/eventos/${event.slug}`}
                      className="group relative flex min-w-[85vw] shrink-0 snap-center overflow-hidden rounded-xl border-2 border-punk-yellow/50 bg-punk-black transition-all duration-300 hover:border-punk-yellow hover:shadow-[0_0_30px_rgba(255,214,10,0.2)] lg:min-w-0"
                    >
                      {/* Imagen de fondo - más visible */}
                      {event.imageUrl ? (
                        <>
                          <div
                            className="absolute inset-0 bg-cover bg-center opacity-40 transition-opacity group-hover:opacity-50"
                            style={{ backgroundImage: `url(${event.imageUrl})` }}
                          />
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-punk-black via-punk-black/80 to-punk-black/40" />
                        </>
                      ) : (
                        <div className="absolute inset-0 bg-punk-black/90" />
                      )}

                      <div className="absolute right-0 top-0 z-20 border-b-2 border-l-2 border-punk-yellow/70 bg-punk-yellow/25 px-3 py-1.5 font-punch text-[10px] uppercase tracking-widest text-punk-yellow">
                        {tFeatured("badge")}
                      </div>

                      <div className="relative z-10 flex min-h-[140px] flex-col justify-end p-4 sm:min-h-[160px] sm:p-5 lg:min-h-[180px] lg:p-6">
                        <div className="mb-3 flex items-start gap-3">
                          <div className="shrink-0 border-2 border-punk-yellow/60 bg-punk-yellow/15 px-3 py-2 text-center sm:px-4">
                            <span className="block font-display text-xl leading-none text-punk-yellow sm:text-2xl">
                              {endD
                                ? `${format(d, "d", { locale: dateLocale })}-${format(endD, "d", { locale: dateLocale })}`
                                : format(d, "dd", { locale: dateLocale })}
                            </span>
                            <span className="block font-punch text-[10px] uppercase tracking-widest text-punk-white/80 sm:text-xs">
                              {format(d, "MMM", { locale: dateLocale })}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-display text-lg font-semibold leading-tight text-punk-white transition-colors group-hover:text-punk-yellow sm:text-xl lg:text-2xl">
                              {event.title}
                            </h3>
                            <p className="mt-1 font-body text-sm text-punk-white/70">
                              {event.venue
                                ? `${event.venue.name} · ${event.venue.city}`
                                : event.venueText ?? ""}
                            </p>
                            <span
                              className={`mt-2 inline-block border px-2 py-0.5 font-punch text-[10px] uppercase tracking-widest ${
                                event.type === "FESTIVAL"
                                  ? "border-punk-yellow/60 text-punk-yellow"
                                  : "border-punk-white/40 text-punk-white/80"
                              }`}
                            >
                              {event.type === "FESTIVAL" ? "Festival" : "Concierto"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* CTA rápido si no hay destacados */}
          {featuredEvents.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center"
            >
              <Link
                href="/eventos"
                className="rounded-lg border-2 border-punk-red bg-punk-red/20 px-8 py-4 font-punch text-sm uppercase tracking-widest text-punk-red transition-colors hover:bg-punk-red hover:text-punk-white"
              >
                {t("cta.exploreEvents")}
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
