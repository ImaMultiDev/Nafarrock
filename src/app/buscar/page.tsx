import { Suspense } from "react";
import { getBands } from "@/services/band.service";
import { getEvents } from "@/services/event.service";
import { getVenues } from "@/services/venue.service";
import BandSearchForm from "./BandSearchForm";
import Link from "next/link";
import { PageLayout } from "@/components/ui/PageLayout";

export const metadata = {
  title: "Buscador avanzado",
  description: "Busca bandas, eventos y salas por género, localidad y más",
};

type SearchParams = { searchParams: Promise<Record<string, string | undefined>> };

export default async function BuscarPage({ searchParams }: SearchParams) {
  const params = await searchParams;
  const search = params.search ?? "";
  const genre = params.genre ?? "";
  const location = params.location ?? "";
  const active = params.active;
  const emerging = params.emerging;

  const [bands, events, venues] = await Promise.all([
    getBands({
      search: search || undefined,
      genre: genre || undefined,
      location: location || undefined,
      isActive: active === "true" ? true : active === "false" ? false : undefined,
      isEmerging: emerging === "true" ? true : undefined,
    }),
    getEvents(),
    getVenues({ city: location || undefined }),
  ]);

  return (
    <PageLayout>
      <div className="mb-10 sm:mb-16">
        <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl lg:text-7xl">
          BUSCAR
        </h1>
        <p className="mt-3 max-w-xl font-body text-punk-white/60 sm:mt-4">
          Filtra por género, localidad, activo/inactivo, emergente.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="h-48 animate-pulse rounded border-2 border-punk-acid/30 bg-punk-black" />
        }
      >
        <BandSearchForm
          defaultSearch={search}
          defaultGenre={genre}
          defaultLocation={location}
          defaultActive={active}
          defaultEmerging={emerging}
        />
      </Suspense>

      <div className="mt-16 space-y-16">
        <section>
          <h2 className="font-display text-3xl tracking-tighter text-punk-green sm:text-4xl">
            Bandas ({bands.length})
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bands.slice(0, 9).map((band) => (
              <Link
                key={band.id}
                href={`/bandas/${band.slug}`}
                className="group border-2 border-punk-green/50 bg-punk-black p-4 transition-all hover:border-punk-green hover:shadow-[0_0_20px_rgba(0,200,83,0.15)]"
              >
                <span className="font-display text-lg tracking-tighter text-punk-white group-hover:text-punk-green transition-colors">
                  {band.name}
                </span>
                <div className="mt-2 flex flex-wrap gap-1">
                  {band.genres.slice(0, 2).map((g) => (
                    <span key={g} className="font-punch text-xs text-punk-green/70">
                      {g}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
          {bands.length > 9 && (
            <p className="mt-3 font-body text-sm text-punk-white/50">
              Mostrando 9 de {bands.length}. Ajusta filtros para ver más.
            </p>
          )}
        </section>

        <section>
          <h2 className="font-display text-3xl tracking-tighter text-punk-red sm:text-4xl">
            Eventos ({events.length})
          </h2>
          <div className="mt-6 space-y-3">
            {events.slice(0, 5).map((event) => (
              <Link
                key={event.id}
                href={`/eventos/${event.slug}`}
                className="group block border-2 border-punk-red/50 bg-punk-black p-4 transition-all hover:border-punk-red hover:shadow-[0_0_20px_rgba(230,0,38,0.15)]"
              >
                <span className="font-display text-punk-white group-hover:text-punk-red transition-colors">
                  {event.title}
                </span>
                <span className="ml-2 font-body text-punk-white/60">
                  · {event.venue.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-3xl tracking-tighter text-punk-pink sm:text-4xl">
            Salas ({venues.length})
          </h2>
          <div className="mt-6 space-y-3">
            {venues.slice(0, 5).map((venue) => (
              <Link
                key={venue.id}
                href={`/salas/${venue.slug}`}
                className="block border-2 border-punk-pink/50 bg-punk-black p-4 transition-all hover:border-punk-pink hover:shadow-[0_0_20px_rgba(255,0,110,0.15)]"
              >
                <span className="font-display text-punk-white">
                  {venue.name}
                </span>
                <span className="ml-2 font-body text-punk-white/60">
                  · {venue.city}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
