import { getEventBySlug } from "@/services/event.service";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return {};
  return {
    title: event.title,
    description: event.description ?? `${event.title} en ${event.venue.name}`,
  };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/eventos"
        className="text-sm text-void-400 hover:text-void-100"
      >
        ← Volver a eventos
      </Link>

      <article className="mt-8">
        <span
          className={`inline-block rounded px-3 py-1 text-sm ${
            event.type === "FESTIVAL"
              ? "bg-rock-600/30 text-rock-400"
              : "bg-void-700 text-void-300"
          }`}
        >
          {event.type === "FESTIVAL" ? "Festival" : "Concierto"}
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold text-void-50">
          {event.title}
        </h1>
        <p className="mt-2 text-xl text-void-400">
          {format(event.date, "EEEE d 'de' MMMM, yyyy", { locale: es })}
          {event.doorsOpen && ` · Puertas: ${event.doorsOpen}`}
        </p>

        <div className="mt-8 rounded-lg border border-void-800 bg-void-900/50 p-6">
          <h2 className="font-display text-lg font-semibold text-void-100">
            Lugar
          </h2>
          <p className="mt-1 font-medium">{event.venue.name}</p>
          {event.venue.address && (
            <p className="text-void-400">{event.venue.address}</p>
          )}
          <p className="text-void-400">{event.venue.city}</p>
          {event.venue.mapUrl && (
            <a
              href={event.venue.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-rock-400 hover:underline"
            >
              Ver en mapa →
            </a>
          )}
        </div>

        {event.bands.length > 0 && (
          <div className="mt-6">
            <h2 className="font-display text-lg font-semibold text-void-100">
              Cartel
            </h2>
            <ul className="mt-2 space-y-2">
              {event.bands.map((be, i) => (
                <li key={be.id} className="flex items-center gap-2">
                  <span className="text-void-500">{i + 1}.</span>
                  <Link
                    href={`/bandas/${be.band.slug}`}
                    className="text-rock-400 hover:text-rock-300 hover:underline"
                  >
                    {be.band.name}
                  </Link>
                  {be.isHeadliner && (
                    <span className="text-xs text-rock-500">(cabecera)</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {event.description && (
          <div className="mt-6">
            <h2 className="font-display text-lg font-semibold text-void-100">
              Descripción
            </h2>
            <p className="mt-2 text-void-300 whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
        )}

        {(event.price || event.ticketUrl) && (
          <div className="mt-6 flex flex-wrap gap-4">
            {event.price && (
              <span className="rounded bg-void-800 px-4 py-2 text-void-200">
                {event.price}
              </span>
            )}
            {event.ticketUrl && (
              <a
                href={event.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded bg-rock-600 px-4 py-2 text-white hover:bg-rock-500 transition-colors"
              >
                Comprar entradas
              </a>
            )}
          </div>
        )}
      </article>
    </main>
  );
}
