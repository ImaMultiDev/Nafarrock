import { Suspense } from "react";
import { getBands } from "@/services/band.service";
import { getEvents } from "@/services/event.service";
import { getVenues } from "@/services/venue.service";
import BandSearchForm from "./BandSearchForm";
import Link from "next/link";

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
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-void-50">
        Buscador avanzado
      </h1>
      <p className="mt-2 text-void-400">
        Filtra por género, localidad, activo/inactivo, emergente
      </p>

      <Suspense fallback={<div className="mt-8 h-48 animate-pulse rounded-lg bg-void-800" />}>
        <BandSearchForm
          defaultSearch={search}
          defaultGenre={genre}
          defaultLocation={location}
          defaultActive={active}
          defaultEmerging={emerging}
        />
      </Suspense>

      <div className="mt-12 space-y-12">
        <section>
          <h2 className="font-display text-xl font-semibold text-void-100">
            Bandas ({bands.length})
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bands.slice(0, 9).map((band) => (
              <Link
                key={band.id}
                href={`/bandas/${band.slug}`}
                className="rounded-lg border border-void-800 p-4 hover:border-rock-600/50"
              >
                <span className="font-medium text-void-100">{band.name}</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {band.genres.slice(0, 2).map((g) => (
                    <span
                      key={g}
                      className="text-xs text-void-500"
                    >{g}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
          {bands.length > 9 && (
            <p className="mt-2 text-sm text-void-500">
              Mostrando 9 de {bands.length}. Ajusta filtros para ver más.
            </p>
          )}
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-void-100">
            Eventos ({events.length})
          </h2>
          <div className="mt-4 space-y-2">
            {events.slice(0, 5).map((event) => (
              <Link
                key={event.id}
                href={`/eventos/${event.slug}`}
                className="block rounded border border-void-800 p-3 hover:border-rock-600/50"
              >
                {event.title} · {event.venue.name}
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-void-100">
            Salas ({venues.length})
          </h2>
          <div className="mt-4 space-y-2">
            {venues.slice(0, 5).map((venue) => (
              <Link
                key={venue.id}
                href={`/salas/${venue.slug}`}
                className="block rounded border border-void-800 p-3 hover:border-rock-600/50"
              >
                {venue.name} · {venue.city}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
