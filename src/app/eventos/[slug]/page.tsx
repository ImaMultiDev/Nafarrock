import { getEventBySlug } from "@/services/event.service";
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
    <PageLayout>
      <Link
        href="/eventos"
        className="font-punch text-xs uppercase tracking-widest text-punk-red transition-colors hover:text-punk-red/80"
      >
        ← Volver a eventos
      </Link>

      <article className="mt-12">
        <span
          className={`inline-block border-2 px-4 py-2 font-punch text-xs uppercase tracking-widest ${
            event.type === "FESTIVAL"
              ? "border-punk-red bg-punk-red/20 text-punk-red"
              : "border-punk-white/40 bg-punk-black text-punk-white/90"
          }`}
        >
          {event.type === "FESTIVAL" ? "Festival" : "Concierto"}
        </span>
        <h1 className="mt-6 font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
          {event.title}
        </h1>
        <p className="mt-3 font-body text-xl text-punk-white/70">
          {format(event.date, "EEEE d 'de' MMMM, yyyy", { locale: es })}
          {event.doorsOpen && ` · Puertas: ${event.doorsOpen}`}
        </p>

        <div className="mt-10 border-2 border-punk-red/50 bg-punk-black p-6">
          <h2 className="font-display text-xl tracking-tighter text-punk-red">
            Lugar
          </h2>
          <p className="mt-2 font-display text-lg text-punk-white">
            {event.venue.name}
          </p>
          {event.venue.address && (
            <p className="font-body text-punk-white/70">{event.venue.address}</p>
          )}
          <p className="font-body text-punk-white/70">{event.venue.city}</p>
          {event.venue.mapUrl && (
            <a
              href={event.venue.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block border-2 border-punk-red px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-red transition-all hover:bg-punk-red hover:text-punk-black"
            >
              Ver en mapa →
            </a>
          )}
        </div>

        {event.bands.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display text-xl tracking-tighter text-punk-white">
              Cartel
            </h2>
            <ul className="mt-4 space-y-2">
              {event.bands.map((be, i) => (
                <li key={be.id} className="flex items-center gap-3">
                  <span className="font-punch text-punk-green/70">{i + 1}.</span>
                  <Link
                    href={`/bandas/${be.band.slug}`}
                    className="font-display text-punk-white transition-colors hover:text-punk-green"
                  >
                    {be.band.name}
                  </Link>
                  {be.isHeadliner && (
                    <span className="font-punch text-xs uppercase tracking-widest text-punk-red">
                      (cabecera)
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {event.description && (
          <div className="mt-10">
            <h2 className="font-display text-xl tracking-tighter text-punk-white">
              Descripción
            </h2>
            <p className="mt-4 whitespace-pre-wrap font-body leading-relaxed text-punk-white/80">
              {event.description}
            </p>
          </div>
        )}

        {(event.price || event.ticketUrl) && (
          <div className="mt-10 flex flex-wrap gap-4">
            {event.price && (
              <span className="border-2 border-punk-white/30 bg-punk-black px-4 py-3 font-punch text-sm uppercase tracking-widest text-punk-white">
                {event.price}
              </span>
            )}
            {event.ticketUrl && (
              <a
                href={event.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-punk-red bg-punk-red px-6 py-3 font-punch text-sm uppercase tracking-widest text-punk-white transition-all hover:bg-punk-blood hover:border-punk-blood hover:shadow-[0_0_30px_rgba(230,0,38,0.4)]"
              >
                Comprar entradas
              </a>
            )}
          </div>
        )}
      </article>
    </PageLayout>
  );
}
