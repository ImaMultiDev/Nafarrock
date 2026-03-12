import type { Metadata } from "next";
import { getEventBySlug } from "@/services/event.service";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { getTranslations, getLocale } from "next-intl/server";
import { getDateLocale } from "@/lib/date-locale";
import { PageLayout } from "@/components/ui/PageLayout";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { SocialLinks, type SocialLinkItem } from "@/components/ui/SocialLinks";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { getSiteUrl } from "@/lib/site-url";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return {};
  const venueForMeta = event.venue?.name ?? event.venueText ?? event.festival?.location ?? event.festival?.name ?? "";
  const description =
    event.description ??
    (venueForMeta ? `${event.title} en ${venueForMeta}` : event.title);
  const imageUrl = event.imageUrl ?? (event.images && event.images[0]);
  const canonicalUrl = `${getSiteUrl()}/eventos/${slug}`;

  return {
    title: event.title,
    description,
    openGraph: {
      title: event.title,
      description,
      url: canonicalUrl,
      siteName: "Nafarrock",
      type: "website",
      images: imageUrl
        ? [{ url: imageUrl, width: 1200, height: 630, alt: event.title }]
        : undefined,
      locale: "es_ES",
      alternateLocale: "eu_ES",
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
    alternates: {
      canonical: canonicalUrl,
    },
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

  const t = await getTranslations("events");
  const tEvent = await getTranslations("eventDetail");
  const locale = await getLocale();
  const dateLocale = getDateLocale(locale);
  const displayDesc = locale === "eu" && event.descriptionEu ? event.descriptionEu : event.description;

  const allImages = [
    ...(event.imageUrl ? [event.imageUrl] : []),
    ...(event.images ?? []),
  ];

  const links: SocialLinkItem[] = [
    ...(event.websiteUrl ? [{ kind: "web" as const, url: event.websiteUrl }] : []),
    ...(event.instagramUrl ? [{ kind: "instagram" as const, url: event.instagramUrl }] : []),
    ...(event.facebookUrl ? [{ kind: "facebook" as const, url: event.facebookUrl }] : []),
    ...(event.links ?? [])
      .filter((l) => l.url?.trim())
      .filter((l) => {
        if (l.kind === "web") return !event.websiteUrl;
        if (l.kind === "instagram") return !event.instagramUrl;
        if (l.kind === "facebook") return !event.facebookUrl;
        return true;
      })
      .map((l) => ({ kind: l.kind as SocialLinkItem["kind"], url: l.url, label: l.label ?? undefined })),
  ];

  const formattedDate = event.endDate
    ? locale === "eu"
      ? (() => {
          const year = format(event.date, "yyyy", { locale: dateLocale });
          const month = format(event.date, "MMMM", { locale: dateLocale });
          const monthGenitive = month.endsWith("a") ? month.slice(0, -1) + "aren" : month + "ren";
          const startDay = format(event.date, "d", { locale: dateLocale });
          const endDay = format(event.endDate!, "d", { locale: dateLocale });
          return `${year}ko ${monthGenitive} ${startDay}tik ${endDay}ra`;
        })()
      : `Del ${format(event.date, "d 'de' MMMM", { locale: dateLocale })} al ${format(event.endDate, "d 'de' MMMM, yyyy", { locale: dateLocale })}`
    : locale === "eu"
      ? (() => {
          const year = format(event.date, "yyyy", { locale: dateLocale });
          const month = format(event.date, "MMMM", { locale: dateLocale });
          const monthGenitive = month.endsWith("a") ? month.slice(0, -1) + "aren" : month + "ren";
          const day = format(event.date, "d", { locale: dateLocale });
          return `${year}ko ${monthGenitive} ${day}a`;
        })()
      : format(event.date, "EEEE d 'de' MMMM, yyyy", { locale: dateLocale });

  // Ubicación: venue (sala) > venueText (texto libre) > festival.location (lugar real) > festival.name (fallback)
  const locationDisplay = event.venue
    ? `${event.venue.name}${event.venue.city ? ` · ${event.venue.city}` : ""}`
    : event.venueText ?? event.festival?.location ?? event.festival?.name ?? "";

  return (
    <PageLayout>
      <AnimatedSection>
        {/* Volver: solo desktop */}
        <Link
          href="/eventos"
          className="hidden font-punch text-xs uppercase tracking-widest text-punk-red transition-colors hover:text-punk-red/80 md:inline-block"
        >
          {t("backToEvents")}
        </Link>

        {/* Mobile: layout optimizado similar a bandas */}
        <div className="mt-4 space-y-6 md:hidden">
          {/* Título neon - ancho completo */}
          <h1 className="neon-event-name-sign w-full">
            <span className="neon-event-name-text font-display text-xl tracking-tighter sm:text-2xl">
              {event.title}
            </span>
          </h1>
          {/* Metadata: tipo · fechas (SOLD OUT solo si no hay bloque CTA) */}
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 border-l-2 border-punk-red/40 pl-3">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span
                className={`border px-2.5 py-1 font-punch text-[10px] uppercase tracking-widest ${
                  event.type === "FESTIVAL"
                    ? "border-punk-red/50 bg-punk-red/10 text-punk-red"
                    : "border-punk-white/40 bg-punk-white/10 text-punk-white/90"
                }`}
              >
                {event.type === "FESTIVAL" ? tEvent("festival") : tEvent("concert")}
              </span>
              <span className="text-punk-red/40 font-punch">·</span>
              <span className="font-body text-sm text-punk-white/80">{formattedDate}</span>
              {event.doorsOpen && (
                <>
                  <span className="text-punk-red/40 font-punch">·</span>
                  <span className="font-body text-sm text-punk-white/70">{tEvent("doors")}: {event.doorsOpen}</span>
                </>
              )}
            </div>
            {/* Badge SOLD OUT solo cuando no hay bloque CTA (evita redundancia con bloque grande) */}
            {event.isSoldOut && !(event.price || event.ticketUrl || event.isSoldOut) && (
              <span className="shrink-0 border border-punk-red bg-punk-red/20 px-2.5 py-1 font-punch text-[10px] uppercase tracking-widest text-punk-red">
                {tEvent("soldOut")}
              </span>
            )}
          </div>
          {/* Redes: solo iconos */}
          {links.length > 0 && (
            <div className="flex items-center gap-4">
              <SocialLinks links={links} variant="red" iconOnly showLabels={false} />
            </div>
          )}
          {/* Ubicación (venue, venueText o festival.location) */}
          {locationDisplay && (
            <p className="font-body text-sm text-punk-red/90">📍 {locationDisplay}</p>
          )}
          {/* CTA entradas */}
          {(event.price || event.ticketUrl || event.isSoldOut) && (
            <div>
              {event.isSoldOut ? (
                <div className="border-2 border-punk-red bg-punk-red/20 px-6 py-4 text-center">
                  <span className="font-punch text-base uppercase tracking-widest text-punk-red">
                    SOLD OUT
                  </span>
                </div>
              ) : (
                <div className="flex flex-col gap-3 border-2 border-punk-red/50 bg-punk-black p-4">
                  {event.price && (
                    <span className="font-display text-xl text-punk-white">{event.price}</span>
                  )}
                  {event.ticketUrl && (
                    <a
                      href={event.ticketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block border-2 border-punk-red bg-punk-red px-6 py-3 text-center font-punch text-sm uppercase tracking-widest text-punk-white transition-all hover:bg-punk-blood hover:border-punk-blood hover:shadow-[0_0_30px_rgba(230,0,38,0.4)]"
                    >
                      {tEvent("buyTickets")}
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
          {/* Fotos: 1 principal + 2 horizontal */}
          {allImages.length > 0 && (
            <div className="space-y-2">
              <div className="aspect-[16/10] w-full overflow-hidden border-2 border-punk-red/50">
                <ImageLightbox
                  src={allImages[0]}
                  alt={`Cartel ${event.title}`}
                  thumbnailClassName="h-full w-full object-cover cursor-pointer"
                />
              </div>
              {allImages.length > 1 && (
                <div className="grid grid-cols-2 gap-2">
                  {allImages.slice(1, 3).map((src, i) => (
                    <ImageLightbox
                      key={i}
                      src={src}
                      alt={`Imagen ${i + 2} - ${event.title}`}
                      thumbnailClassName="aspect-[4/3] w-full object-cover border-2 border-punk-red/50 cursor-pointer"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          {/* Lugar / Festival (detalle): venue con dirección y links, o festival con enlace */}
          {(event.venue || event.venueText || event.festival) && (
            <div className="border-l-2 border-punk-red/40 pl-3">
              <h3 className="font-display text-base tracking-tighter text-punk-red">
                {event.venue || event.venueText ? tEvent("venue") : tEvent("festival")}
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                {event.festival && !event.venue && (
                  <Link
                    href={`/festivales/${event.festival.slug}`}
                    className="block shrink-0 overflow-hidden rounded border-2 border-punk-red/50 bg-punk-black transition-all hover:border-punk-red"
                  >
                    {event.festival.logoUrl ? (
                      <Image
                        src={event.festival.logoUrl}
                        alt={event.festival.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center font-display text-lg text-punk-red/60">
                        {event.festival.name.charAt(0)}
                      </div>
                    )}
                  </Link>
                )}
                <div>
                  <p className="font-display text-lg text-punk-white">
                    {event.venue ? event.venue.name : event.venueText ?? event.festival?.name ?? ""}
                  </p>
                  {event.festival?.location && !event.venue && (
                    <p className="mt-0.5 font-body text-sm text-punk-white/70">{event.festival.location}</p>
                  )}
                </div>
              </div>
              {event.venue && (
                <>
                  {event.venue.address && (
                    <p className="mt-2 font-body text-sm text-punk-white/70">{event.venue.address}</p>
                  )}
                  {event.venue.city && (
                    <p className="font-body text-sm text-punk-white/70">{event.venue.city}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={`/salas/${event.venue.slug}`}
                      className="inline-block border-2 border-punk-red px-3 py-2 font-punch text-[10px] uppercase tracking-widest text-punk-red transition-all hover:bg-punk-red hover:text-punk-black"
                    >
                      {tEvent("viewVenue")}
                    </Link>
                    {event.venue.mapUrl && (
                      <a
                        href={event.venue.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block border-2 border-punk-white/40 px-3 py-2 font-punch text-[10px] uppercase tracking-widest text-punk-white/80 transition-all hover:border-punk-green hover:text-punk-green"
                      >
                        {tEvent("viewOnMap")}
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
          {/* Promotor / Organizador */}
          {(event.promoter || event.organizer) && (
            <div className="flex flex-wrap gap-2">
              {event.promoter && (
                <Link
                  href={`/promotores/${event.promoter.slug}`}
                  className="border-2 border-punk-pink/50 bg-punk-pink/10 px-3 py-2 font-punch text-[10px] uppercase tracking-widest text-punk-pink transition-all hover:border-punk-pink"
                >
                  {event.promoter.name}
                </Link>
              )}
              {event.organizer && (
                <Link
                  href={`/organizadores/${event.organizer.slug}`}
                  className="border-2 border-punk-green/50 bg-punk-green/10 px-3 py-2 font-punch text-[10px] uppercase tracking-widest text-punk-green transition-all hover:border-punk-green"
                >
                  {event.organizer.name}
                </Link>
              )}
            </div>
          )}
          {/* Descripción */}
          {displayDesc && (
            <div>
              <h3 className="font-display text-base tracking-tighter text-punk-red">
                {tEvent("description")}
              </h3>
              <p className="mt-3 whitespace-pre-wrap font-body leading-relaxed text-punk-white/80">
                {displayDesc}
              </p>
            </div>
          )}
          {/* Publicado por Nafarrock: al final, estilo discreto */}
          {event.createdByNafarrock && (
            <p className="pt-6 font-punch text-[10px] uppercase tracking-widest text-punk-red/50">
              {tEvent("publishedByNafarrock")}
            </p>
          )}
        </div>

        {/* Desktop: layout clásico */}
        <article className="mt-10 hidden md:block">
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
                {event.type === "FESTIVAL" ? tEvent("festival") : tEvent("concert")}
              </span>
              {/* Badge SOLD OUT solo cuando no hay bloque CTA (evita redundancia) */}
              {event.isSoldOut && !(event.price || event.ticketUrl || event.isSoldOut) && (
                <span className="inline-block border-2 border-punk-red bg-punk-red/30 px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-red">
                  {tEvent("soldOut")}
                </span>
              )}
            </div>
            <h1 className="mt-4 font-display text-4xl tracking-tighter text-punk-white sm:text-5xl lg:text-6xl">
              {event.title}
            </h1>
            {links.length > 0 && (
              <div className="mt-2">
                <SocialLinks links={links} variant="red" />
              </div>
            )}
            <p className="mt-4 font-body text-lg text-punk-white/70">
              {event.endDate ? (
                locale === "eu" ? (
                  (() => {
                    const year = format(event.date, "yyyy", { locale: dateLocale });
                    const month = format(event.date, "MMMM", { locale: dateLocale });
                    const monthGenitive = month.endsWith("a") ? month.slice(0, -1) + "aren" : month + "ren";
                    const startDay = format(event.date, "d", { locale: dateLocale });
                    const endDay = format(event.endDate!, "d", { locale: dateLocale });
                    return `${year}ko ${monthGenitive} ${startDay}tik ${endDay}ra`;
                  })()
                ) : (
                  <>
                    Del {format(event.date, "d 'de' MMMM", { locale: dateLocale })} al {format(event.endDate, "d 'de' MMMM, yyyy", { locale: dateLocale })}
                  </>
                )
              ) : locale === "eu" ? (
                (() => {
                  const year = format(event.date, "yyyy", { locale: dateLocale });
                  const month = format(event.date, "MMMM", { locale: dateLocale });
                  const monthGenitive = month.endsWith("a") ? month.slice(0, -1) + "aren" : month + "ren";
                  const day = format(event.date, "d", { locale: dateLocale });
                  return `${year}ko ${monthGenitive} ${day}a`;
                })()
              ) : (
                format(event.date, "EEEE d 'de' MMMM, yyyy", { locale: dateLocale })
              )}
              {event.doorsOpen && ` · ${tEvent("doors")}: ${event.doorsOpen}`}
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
                      {tEvent("buyTickets")}
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

        {/* Lugar / Festival */}
        {(event.venue || event.venueText || event.festival) && (
          <div className="mt-12 border-l-4 border-punk-red bg-punk-black/50 p-6">
            <h2 className="font-punch text-xs uppercase tracking-widest text-punk-red/80">
              {event.venue || event.venueText ? tEvent("venue") : tEvent("festival")}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              {event.festival && !event.venue && (
                <Link
                  href={`/festivales/${event.festival.slug}`}
                  className="block shrink-0 overflow-hidden rounded border-2 border-punk-red/50 bg-punk-black transition-all hover:border-punk-red"
                >
                  {event.festival.logoUrl ? (
                    <Image
                      src={event.festival.logoUrl}
                      alt={event.festival.name}
                      width={48}
                      height={48}
                      className="h-12 w-12 object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center font-display text-lg text-punk-red/60">
                      {event.festival.name.charAt(0)}
                    </div>
                  )}
                </Link>
              )}
              <div>
                <p className="font-display text-xl text-punk-white">
                  {event.venue ? event.venue.name : event.venueText ?? event.festival?.name ?? ""}
                </p>
                {event.festival?.location && !event.venue && (
                  <p className="mt-1 font-body text-punk-white/70">{event.festival.location}</p>
                )}
              </div>
            </div>
            {event.venue && (
              <>
                {event.venue.address && (
                  <p className="mt-2 font-body text-punk-white/70">{event.venue.address}</p>
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
              </>
            )}
          </div>
        )}

        {/* Promotor / Organizador (festival ya mostrado en Lugar con logo) */}
        {(event.promoter || event.organizer) && (
          <div className="mt-10 flex flex-wrap gap-3">
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

        {/* Descripción */}
        {displayDesc && (
          <div className="mt-12">
            <h2 className="font-display text-2xl tracking-tighter text-punk-white">
              {tEvent("description")}
            </h2>
            <p className="mt-4 whitespace-pre-wrap font-body leading-relaxed text-punk-white/80">
              {displayDesc}
            </p>
          </div>
        )}
        {/* Publicado por Nafarrock: al final, estilo discreto */}
        {event.createdByNafarrock && (
          <p className="mt-16 pt-8 font-punch text-[10px] uppercase tracking-widest text-punk-red/50">
            {tEvent("publishedByNafarrock")}
          </p>
        )}
      </article>
      </AnimatedSection>
    </PageLayout>
  );
}
