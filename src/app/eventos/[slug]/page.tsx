import { getEventBySlug } from "@/services/event.service";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PageLayout } from "@/components/ui/PageLayout";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { SocialLinks, type SocialLinkItem } from "@/components/ui/SocialLinks";

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

  const allImages = [
    ...(event.imageUrl ? [event.imageUrl] : []),
    ...(event.images ?? []),
  ];

  const links: SocialLinkItem[] = [
    ...(event.webUrl ? [{ kind: "web" as const, url: event.webUrl }] : []),
    ...(event.instagramUrl ? [{ kind: "instagram" as const, url: event.instagramUrl }] : []),
    ...(event.facebookUrl ? [{ kind: "facebook" as const, url: event.facebookUrl }] : []),
    ...(event.twitterUrl ? [{ kind: "twitter" as const, url: event.twitterUrl }] : []),
  ];

  return (
    <PageLayout>
      <Link
        href="/eventos"
        className="font-punch text-xs uppercase tracking-widest text-punk-red transition-colors hover:text-punk-red/80"
      >
        ← Volver a eventos
      </Link>

      <article className="mt-10">
        {/* Hero: título + CTA entradas arriba a la derecha */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-block border-2 px-4 py-2 font-punch text-xs uppercase tracking-widest ${
                  event.type === "FESTIVAL"
                    ? "border-punk-red bg-punk-red/20 text-punk-red"
                    : "border-punk-white/40 bg-punk-black text-punk-white/90"
                }`}
              >
                {event.type === "FESTIVAL" ? "Festival" : "Concierto"}
              </span>
              {event.isSoldOut && (
                <span className="inline-block border-2 border-punk-red bg-punk-red/30 px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-red">
                  SOLD OUT
                </span>
              )}
            </div>
            <h1 className="mt-4 font-display text-4xl tracking-tighter text-punk-white sm:text-5xl lg:text-6xl">
              {event.title}
            </h1>
            {event.createdByNafarrock && (
              <p className="mt-2 font-punch text-xs uppercase tracking-widest text-punk-red/90">
                Evento registrado por Nafarrock
              </p>
            )}
            <p className="mt-4 font-body text-lg text-punk-white/70">
              {format(event.date, "EEEE d 'de' MMMM, yyyy", { locale: es })}
              {event.doorsOpen && ` · Puertas: ${event.doorsOpen}`}
            </p>
          </div>

          {/* CTA entradas: arriba a la derecha, nivel del título */}
          {(event.price || event.ticketUrl || event.isSoldOut) && (
            <div className="shrink-0 lg:mt-8">
              {event.isSoldOut ? (
                <div className="border-2 border-punk-red bg-punk-red/20 px-8 py-4 text-center">
                  <span className="font-punch text-lg uppercase tracking-widest text-punk-red">
                    SOLD OUT
                  </span>
                </div>
              ) : (
                <div className="flex flex-col gap-3 border-2 border-punk-red/50 bg-punk-black p-6">
                  {event.price && (
                    <span className="font-display text-2xl text-punk-white">
                      {event.price}
                    </span>
                  )}
                  {event.ticketUrl && (
                    <a
                      href={event.ticketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block border-2 border-punk-red bg-punk-red px-8 py-3 text-center font-punch text-sm uppercase tracking-widest text-punk-white transition-all hover:bg-punk-blood hover:border-punk-blood hover:shadow-[0_0_30px_rgba(230,0,38,0.4)]"
                    >
                      Comprar entradas
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Galería: imagen principal + 2 adicionales en layout atractivo */}
        {allImages.length > 0 && (
          <div className="mt-12">
            {allImages.length === 1 ? (
              <div className="overflow-hidden border-2 border-punk-red/50">
                <ImageLightbox
                  src={allImages[0]}
                  alt={`Cartel ${event.title}`}
                  thumbnailClassName="w-full max-h-[500px] object-cover cursor-pointer"
                />
              </div>
            ) : allImages.length === 2 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {allImages.map((src, i) => (
                  <div key={i} className="overflow-hidden border-2 border-punk-red/50">
                    <ImageLightbox
                      src={src}
                      alt={`Imagen ${i + 1} - ${event.title}`}
                      thumbnailClassName="h-64 w-full object-cover cursor-pointer sm:h-80 transition-opacity hover:opacity-95"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="overflow-hidden border-2 border-punk-red/50 sm:col-span-2 sm:row-span-2">
                  <ImageLightbox
                    src={allImages[0]}
                    alt={`Cartel ${event.title}`}
                    thumbnailClassName="h-64 w-full object-cover cursor-pointer sm:h-full sm:min-h-[400px] transition-opacity hover:opacity-95"
                  />
                </div>
                {allImages.slice(1).map((src, i) => (
                  <div key={i} className="overflow-hidden border-2 border-punk-red/50">
                    <ImageLightbox
                      src={src}
                      alt={`Imagen ${i + 2} - ${event.title}`}
                      thumbnailClassName="h-48 w-full object-cover cursor-pointer sm:h-48 transition-opacity hover:opacity-95"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Lugar */}
        <div className="mt-12 border-l-4 border-punk-red bg-punk-black/50 p-6">
          <h2 className="font-punch text-xs uppercase tracking-widest text-punk-red/80">
            Lugar
          </h2>
          <p className="mt-2 font-display text-xl text-punk-white">
            {event.venue.name}
          </p>
          {event.venue.address && (
            <p className="font-body text-punk-white/70">{event.venue.address}</p>
          )}
          <p className="font-body text-punk-white/70">{event.venue.city}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/salas/${event.venue.slug}`}
              className="inline-block border-2 border-punk-red px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-red transition-all hover:bg-punk-red hover:text-punk-black"
            >
              Ver sala →
            </Link>
            {event.venue.mapUrl && (
              <a
                href={event.venue.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block border-2 border-punk-white/40 px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-white/80 transition-all hover:border-punk-green hover:text-punk-green"
              >
                Ver en mapa →
              </a>
            )}
          </div>
        </div>

        {/* Promotor / Festival / Organizador */}
        {(event.festival || event.promoter || event.organizer) && (
          <div className="mt-10 flex flex-wrap gap-3">
            {event.festival && (
              <Link
                href={`/festivales/${event.festival.slug}`}
                className="border-2 border-punk-red/50 bg-punk-red/10 px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-red transition-all hover:border-punk-red hover:bg-punk-red hover:text-punk-black"
              >
                Festival: {event.festival.name}
              </Link>
            )}
            {event.promoter && (
              <Link
                href={`/promotores/${event.promoter.slug}`}
                className="border-2 border-punk-pink/50 bg-punk-pink/10 px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-pink transition-all hover:border-punk-pink hover:bg-punk-pink hover:text-punk-black"
              >
                Promotor: {event.promoter.name}
              </Link>
            )}
            {event.organizer && (
              <Link
                href={`/organizadores/${event.organizer.slug}`}
                className="border-2 border-punk-green/50 bg-punk-green/10 px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-green transition-all hover:border-punk-green hover:bg-punk-green hover:text-punk-black"
              >
                Organizador: {event.organizer.name}
              </Link>
            )}
          </div>
        )}

        {/* Redes y enlaces */}
        {links.length > 0 && (
          <div className="mt-10">
            <h2 className="font-punch text-xs uppercase tracking-widest text-punk-red/80">
              Redes y enlaces
            </h2>
            <div className="mt-3">
              <SocialLinks links={links} variant="red" />
            </div>
          </div>
        )}

        {/* Cartel de bandas */}
        {event.bands.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display text-2xl tracking-tighter text-punk-white">
              Cartel
            </h2>
            <ul className="mt-4 space-y-3">
              {event.bands.map((be, i) => (
                <li key={be.id} className="flex items-center gap-3 border-b border-punk-white/10 pb-3 last:border-0">
                  <span className="font-punch text-punk-green/70">{i + 1}.</span>
                  <Link
                    href={`/bandas/${be.band.slug}`}
                    className="font-display text-lg text-punk-white transition-colors hover:text-punk-green"
                  >
                    {be.band.name}
                  </Link>
                  {be.isHeadliner && (
                    <span className="font-punch text-xs uppercase tracking-widest text-punk-red">
                      cabecera
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Descripción */}
        {event.description && (
          <div className="mt-12">
            <h2 className="font-display text-2xl tracking-tighter text-punk-white">
              Descripción
            </h2>
            <p className="mt-4 whitespace-pre-wrap font-body leading-relaxed text-punk-white/80">
              {event.description}
            </p>
          </div>
        )}
      </article>
    </PageLayout>
  );
}
