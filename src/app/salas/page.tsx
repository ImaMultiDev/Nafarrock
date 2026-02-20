import { getVenues } from "@/services/venue.service";
import Link from "next/link";
import { PageLayout } from "@/components/ui/PageLayout";
import { SalasFilters } from "@/components/buscador/SalasFilters";
import { Pagination } from "@/components/ui/Pagination";

export const metadata = {
  title: "Salas y espacios",
  description: "Salas de conciertos y espacios de la escena nafarroa",
};

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function SalasPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const capacityMin = params.capacityMin ? parseInt(params.capacityMin, 10) : undefined;
  const capacityMax = params.capacityMax ? parseInt(params.capacityMax, 10) : undefined;
  const { items: venues, total } = await getVenues({
    search: params.search || undefined,
    city: params.city || undefined,
    capacityMin: Number.isNaN(capacityMin) ? undefined : capacityMin,
    capacityMax: Number.isNaN(capacityMax) ? undefined : capacityMax,
    page,
  });

  return (
    <PageLayout>
      <div className="mb-10 sm:mb-16">
        <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl lg:text-7xl">
          SALAS
        </h1>
        <p className="mt-3 max-w-xl font-body text-punk-white/60 sm:mt-4">
          Espacios de la escena. {total} {total === 1 ? "sala" : "salas"} en Nafarroa.
        </p>
      </div>

      <SalasFilters />

      <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {venues.map((venue) => (
          <Link
            key={venue.id}
            href={`/salas/${venue.slug}`}
            className="group relative block min-w-0 overflow-hidden border-2 border-punk-pink bg-punk-black p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,0,110,0.2)] max-[299px]:p-3"
          >
            <div className="absolute right-0 top-0 h-16 w-16 border-t-2 border-r-2 border-punk-pink" style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }} />
            <div className="aspect-[4/3] min-h-0 min-w-0 overflow-hidden border border-punk-white/10">
              {(venue.logoUrl || venue.imageUrl || (venue.images && venue.images[0])) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={venue.logoUrl || venue.imageUrl || venue.images[0]}
                  alt={venue.name}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-punk-black/80 font-display text-4xl text-punk-pink/50">
                  {venue.name.charAt(0)}
                </div>
              )}
            </div>
            <h2 className="mt-4 font-display text-xl tracking-tighter text-punk-white group-hover:text-punk-pink transition-colors">
              {venue.name}
            </h2>
            <p className="mt-2 font-body text-sm text-punk-white/70">{venue.city}</p>
            {venue.capacity && (
              <p className="mt-2 font-punch text-xs uppercase tracking-widest text-punk-pink/80">
                Aforo: {venue.capacity} personas
              </p>
            )}
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
              city: params.city,
              capacityMin: params.capacityMin,
              capacityMax: params.capacityMax,
            }).filter((entry): entry is [string, string] => {
          const v = entry[1];
          return v != null && v !== "";
        })
          ) as Record<string, string>
        }
      />

      {venues.length === 0 && (
        <div className="border-2 border-punk-white/20 border-dashed p-16 text-center">
          <p className="font-body text-punk-white/60">
            Aún no hay salas registradas. Pronto habrá contenido. Mientras tanto, explora eventos y bandas.
          </p>
          <Link href="/" className="mt-4 inline-block font-punch text-sm uppercase tracking-widest text-punk-pink hover:text-punk-pink/80 transition-colors">
            ← Volver al inicio
          </Link>
        </div>
      )}
    </PageLayout>
  );
}
