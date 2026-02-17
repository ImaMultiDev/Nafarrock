import { getVenueBySlug } from "@/services/venue.service";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const venue = await getVenueBySlug(slug);
  if (!venue) return {};
  return {
    title: venue.name,
    description: venue.description ?? `Sala de conciertos en ${venue.city}`,
  };
}

export default async function VenuePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const venue = await getVenueBySlug(slug);
  if (!venue) notFound();

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/salas" className="text-sm text-void-400 hover:text-void-100">
        ← Volver a salas
      </Link>

      <div className="mt-8">
        <h1 className="font-display text-3xl font-bold text-void-50">
          {venue.name}
        </h1>
        <p className="mt-2 text-void-400">{venue.city}</p>
        {venue.capacity && (
          <p className="mt-1 text-void-500">Aforo: {venue.capacity}</p>
        )}

        {venue.description && (
          <p className="mt-6 text-void-300 leading-relaxed">
            {venue.description}
          </p>
        )}

        {(venue.address || venue.websiteUrl || venue.mapUrl) && (
          <div className="mt-6 space-y-2">
            {venue.address && (
              <p className="text-void-400">📍 {venue.address}</p>
            )}
            {venue.websiteUrl && (
              <a
                href={venue.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-rock-400 hover:underline"
              >
                Web oficial →
              </a>
            )}
            {venue.mapUrl && (
              <a
                href={venue.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-rock-400 hover:underline"
              >
                Ver en mapa →
              </a>
            )}
          </div>
        )}

        {venue.events.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display text-xl font-semibold text-void-100">
              Próximos eventos
            </h2>
            <ul className="mt-4 space-y-3">
              {venue.events.map((event) => (
                <li key={event.id}>
                  <Link
                    href={`/eventos/${event.slug}`}
                    className="flex items-center justify-between rounded border border-void-800 p-4 hover:border-rock-600/50 transition"
                  >
                    <span className="font-medium text-void-100">
                      {event.title}
                    </span>
                    <span className="text-sm text-void-500">
                      {format(event.date, "d MMM yyyy")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
