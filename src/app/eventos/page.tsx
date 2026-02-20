import { getEvents } from "@/services/event.service";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PageLayout } from "@/components/ui/PageLayout";
import { EventosFilters } from "@/components/buscador/EventosFilters";
import { Pagination } from "@/components/ui/Pagination";

export const metadata = {
  title: "Eventos",
  description: "Conciertos y festivales en Nafarroa",
};

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function EventosPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  let fromDate = params.fromDate ? new Date(params.fromDate) : undefined;
  const toDate = params.toDate ? new Date(params.toDate) : undefined;
  if (fromDate && fromDate < today) fromDate = today;
  const { items: events, total } = await getEvents({
    search: params.search || undefined,
    type: (params.type as "CONCIERTO" | "FESTIVAL") || undefined,
    fromDate,
    toDate,
    page,
    includePast: false,
  });

  return (
    <PageLayout>
      <div className="mb-10 sm:mb-16">
        <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl lg:text-7xl">
          EVENTOS
        </h1>
        <p className="mt-3 max-w-xl font-body text-punk-white/60 sm:mt-4">
          Conciertos y festivales. {total} {total === 1 ? "evento" : "eventos"} en la escena nafarroa.
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
        searchParams={Object.fromEntries(
          Object.entries({
            search: params.search,
            type: params.type,
            fromDate: params.fromDate,
            toDate: params.toDate,
          }).filter(([, v]) => v != null && v !== "")
        )}
      />

      {events.length === 0 && (
        <div className="border-2 border-punk-white/20 border-dashed p-16 text-center">
          <p className="font-body text-punk-white/60">
            No hay eventos próximos. Pronto habrá contenido. Mientras tanto, explora bandas, salas y la escena.
          </p>
          <Link href="/" className="mt-4 inline-block font-punch text-sm uppercase tracking-widest text-punk-red hover:text-punk-red/80 transition-colors">
            ← Volver al inicio
          </Link>
        </div>
      )}
    </PageLayout>
  );
}
