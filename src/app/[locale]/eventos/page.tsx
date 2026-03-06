import { getEvents } from "@/services/event.service";
import Link from "next/link";
import { format } from "date-fns";
import { PageLayout } from "@/components/ui/PageLayout";
import { EventosFilters } from "@/components/buscador/EventosFilters";
import { Pagination } from "@/components/ui/Pagination";
import { getTranslations, getLocale } from "next-intl/server";
import { getDateLocale } from "@/lib/date-locale";

export async function generateMetadata() {
  const t = await getTranslations("events.metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function EventosPage({ searchParams }: Props) {
  const t = await getTranslations("events");
  const tActions = await getTranslations("common.actions");
  const locale = await getLocale();
  const dateLocale = getDateLocale(locale);

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const { items: events, total } = await getEvents({
    search: params.search || undefined,
    type: (params.type as "CONCIERTO" | "FESTIVAL") || undefined,
    page,
    includePast: false,
  });

  return (
    <PageLayout>
      <div className="mb-10 sm:mb-16">
        <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl lg:text-7xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-xl font-body text-punk-white/60 sm:mt-4">
          {t("subtitle", { count: total })}
        </p>
      </div>

      <EventosFilters />

      <div className="space-y-4 lg:space-y-5">
        {events.map((event) => (
          <Link
            key={event.id}
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
            <div className="absolute right-0 top-0 h-16 w-16 border-t-2 border-r-2 border-punk-red" style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }} />
            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="shrink-0 border-2 border-punk-red/50 bg-punk-red/10 px-6 py-3 text-center">
                <span className="block font-display text-3xl leading-none text-punk-red">
                  {event.endDate
                    ? `${format(event.date, "d", { locale: dateLocale })}-${format(event.endDate, "d", { locale: dateLocale })}`
                    : format(event.date, "dd", { locale: dateLocale })}
                </span>
                <span className="block font-punch text-xs uppercase tracking-widest text-punk-white/70">
                  {format(event.date, "MMM", { locale: dateLocale })}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="font-display text-xl tracking-tighter text-punk-white group-hover:text-punk-red transition-colors sm:text-2xl">
                  {event.title}
                </h2>
                <p className="mt-1 font-body text-punk-white/70">
                  {event.venue ? `${event.venue.name} · ${event.venue.city}` : ""}
                </p>
                {event.bands.length > 0 && (
                  <p className="mt-2 font-punch text-xs uppercase tracking-widest text-punk-green/80">
                    {event.bands.map((be) => be.band.name).join(" + ")}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <span
                  className={`border-2 px-4 py-2 font-punch text-xs uppercase tracking-widest ${
                    event.type === "FESTIVAL"
                      ? "border-punk-red bg-punk-red/20 text-punk-red"
                      : "border-punk-white/40 bg-punk-black text-punk-white/90"
                  }`}
                >
                  {event.type === "FESTIVAL" ? "Festival" : "Concierto"}
                </span>
                {event.isSoldOut && (
                  <span className="border-2 border-punk-red bg-punk-red/30 px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-red">
                    SOLD OUT
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Pagination
        page={page}
        totalItems={total}
        searchParams={
          Object.fromEntries(
            Object.entries({
              search: params.search,
              type: params.type,
            }).filter((entry): entry is [string, string] => {
          const v = entry[1];
          return v != null && v !== "";
        })
          ) as Record<string, string>
        }
      />

      {events.length === 0 && (
        <div className="border-2 border-punk-white/20 border-dashed p-16 text-center">
          <p className="font-body text-punk-white/60">
            {t("empty")}
          </p>
          <Link href="/" className="mt-4 inline-block font-punch text-sm uppercase tracking-widest text-punk-red hover:text-punk-red/80 transition-colors">
            {tActions("backToHome")}
          </Link>
        </div>
      )}
    </PageLayout>
  );
}
