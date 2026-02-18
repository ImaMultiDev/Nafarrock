import { getEvents } from "@/services/event.service";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PageLayout } from "@/components/ui/PageLayout";
import { EventosFilters } from "@/components/buscador/EventosFilters";

export const metadata = {
  title: "Eventos",
  description: "Conciertos y festivales en Nafarroa",
};

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function EventosPage({ searchParams }: Props) {
  const params = await searchParams;
  const fromDate = params.fromDate ? new Date(params.fromDate) : undefined;
  const toDate = params.toDate ? new Date(params.toDate) : undefined;
  const events = await getEvents({
    search: params.search || undefined,
    type: (params.type as "CONCIERTO" | "FESTIVAL") || undefined,
    fromDate,
    toDate,
  });

  return (
    <PageLayout>
      <div className="mb-10 sm:mb-16">
        <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl lg:text-7xl">
          EVENTOS
        </h1>
        <p className="mt-3 max-w-xl font-body text-punk-white/60 sm:mt-4">
          Conciertos y festivales. {events.length} eventos próximos en la escena nafarroa.
        </p>
      </div>

      <EventosFilters />

      <div className="space-y-4 lg:space-y-5">
        {events.map((event) => (
          <Link
            key={event.id}
            href={`/eventos/${event.slug}`}
            className="group relative block overflow-hidden border-2 border-punk-red bg-punk-black p-6 transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_40px_rgba(230,0,38,0.15)]"
          >
            <div className="absolute right-0 top-0 h-16 w-16 border-t-2 border-r-2 border-punk-red" style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }} />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="shrink-0 border-2 border-punk-red/50 bg-punk-red/10 px-6 py-3 text-center">
                <span className="block font-display text-3xl leading-none text-punk-red">
                  {format(event.date, "dd", { locale: es })}
                </span>
                <span className="block font-punch text-xs uppercase tracking-widest text-punk-white/70">
                  {format(event.date, "MMM", { locale: es })}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="font-display text-xl tracking-tighter text-punk-white group-hover:text-punk-red transition-colors sm:text-2xl">
                  {event.title}
                </h2>
                <p className="mt-1 font-body text-punk-white/70">
                  {event.venue.name} · {event.venue.city}
                </p>
                {event.bands.length > 0 && (
                  <p className="mt-2 font-punch text-xs uppercase tracking-widest text-punk-green/80">
                    {event.bands.map((be) => be.band.name).join(" + ")}
                  </p>
                )}
              </div>
              <span
                className={`shrink-0 border-2 px-4 py-2 font-punch text-xs uppercase tracking-widest ${
                  event.type === "FESTIVAL"
                    ? "border-punk-red bg-punk-red/20 text-punk-red"
                    : "border-punk-white/40 bg-punk-black text-punk-white/90"
                }`}
              >
                {event.type === "FESTIVAL" ? "Festival" : "Concierto"}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {events.length === 0 && (
        <div className="border-2 border-punk-white/20 border-dashed p-16 text-center">
          <p className="font-body text-punk-white/60">
            No hay eventos próximos. Pronto habrá contenido.
          </p>
          <Link href="/" className="mt-4 inline-block font-punch text-sm uppercase tracking-widest text-punk-red hover:text-punk-red/80 transition-colors">
            Volver al inicio →
          </Link>
        </div>
      )}
    </PageLayout>
  );
}
