import { getVenueBySlug } from "@/services/venue.service";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PageLayout } from "@/components/ui/PageLayout";

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
    <PageLayout>
      <Link
        href="/salas"
        className="font-punch text-xs uppercase tracking-widest text-punk-pink transition-colors hover:text-punk-pink/80"
      >
        ← Volver a salas
      </Link>

      <div className="mt-12">
        <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
          {venue.name}
        </h1>
        <p className="mt-3 font-body text-punk-white/70">{venue.city}</p>
        {venue.capacity && (
          <p className="mt-2 font-punch text-xs uppercase tracking-widest text-punk-pink">
            Aforo: {venue.capacity} personas
          </p>
        )}

        {venue.description && (
          <p className="mt-8 font-body leading-relaxed text-punk-white/80">
            {venue.description}
          </p>
        )}

        {(venue.address || venue.websiteUrl || venue.mapUrl) && (
          <div className="mt-8 space-y-3">
            {venue.address && (
              <p className="font-body text-punk-white/70">📍 {venue.address}</p>
            )}
            {venue.websiteUrl && (
              <a
                href={venue.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block border-2 border-punk-pink px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-pink transition-all hover:bg-punk-pink hover:text-punk-black"
              >
                Web oficial →
              </a>
            )}
            {venue.mapUrl && (
              <a
                href={venue.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 inline-block border-2 border-punk-pink px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-pink transition-all hover:bg-punk-pink hover:text-punk-black"
              >
                Ver en mapa →
              </a>
            )}
          </div>
        )}

        {venue.events.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl tracking-tighter text-punk-white">
              Próximos eventos
            </h2>
            <ul className="mt-6 space-y-3">
              {venue.events.map((evt) => (
                <li key={evt.id}>
                  <Link
                    href={`/eventos/${evt.slug}`}
                    className="flex items-center justify-between border-2 border-punk-pink/50 bg-punk-black p-4 transition-all hover:border-punk-pink hover:shadow-[0_0_20px_rgba(255,0,110,0.15)]"
                  >
                    <span className="font-display text-punk-white">
                      {evt.title}
                    </span>
                    <span className="font-punch text-xs uppercase tracking-widest text-punk-pink">
                      {format(evt.date, "d MMM yyyy", { locale: es })}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
