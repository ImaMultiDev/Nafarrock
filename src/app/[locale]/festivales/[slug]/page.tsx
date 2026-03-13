import type { Metadata } from "next";
import { getFestivalBySlug } from "@/services/festival.service";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { format } from "date-fns";
import { getTranslations, getLocale } from "next-intl/server";
import { getDateLocale } from "@/lib/date-locale";
import { PageLayout } from "@/components/ui/PageLayout";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { SocialLinks, type SocialLinkItem } from "@/components/ui/SocialLinks";
import { Pagination } from "@/components/ui/Pagination";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { getSiteUrl } from "@/lib/site-url";

const EVENTS_PAGE_SIZE = 10;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const festival = await getFestivalBySlug(slug);
  if (!festival) return {};
  const description = festival.description ?? `Festival de rock en Nafarroa: ${festival.name}`;
  const imageUrl = festival.logoUrl ?? (festival.images && festival.images[0]);
  const canonicalUrl = `${getSiteUrl()}/festivales/${slug}`;
  return {
    title: festival.name,
    description,
    openGraph: {
      title: festival.name,
      description,
      url: canonicalUrl,
      siteName: "Nafarrock",
      type: "website",
      images: imageUrl ? [{ url: imageUrl, width: 600, height: 600, alt: festival.name }] : undefined,
    },
    twitter: { card: "summary_large_image", title: festival.name, description, images: imageUrl ? [imageUrl] : undefined },
    alternates: { canonical: canonicalUrl },
  };
}

export default async function FestivalPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const eventsPage = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const festival = await getFestivalBySlug(slug, true, eventsPage, EVENTS_PAGE_SIZE);
  if (!festival) notFound();

  const eventsTotal = "eventsTotal" in festival ? festival.eventsTotal : festival.events?.length ?? 0;
  const nextEvent = ("nextEvent" in festival ? festival.nextEvent : null) ?? festival.events?.[0] ?? null;

  const locale = await getLocale();
  const dateLocale = getDateLocale(locale);
  const t = await getTranslations("festivalDetail");
  const displayDesc = locale === "eu" && festival.descriptionEu ? festival.descriptionEu : festival.description;

  const mainImg = festival.logoUrl || (festival.images && festival.images[0]);
  const allImages = mainImg
    ? [mainImg, ...(festival.images ?? []).filter((url) => url !== mainImg)]
    : (festival.images ?? []);

  const festivalLinks: SocialLinkItem[] = [
    ...(festival.websiteUrl ? [{ kind: "web" as const, url: festival.websiteUrl, label: t("officialWeb") }] : []),
    ...(festival.instagramUrl ? [{ kind: "instagram" as const, url: festival.instagramUrl }] : []),
    ...(festival.facebookUrl ? [{ kind: "facebook" as const, url: festival.facebookUrl }] : []),
  ];

  const mapUrl =
    festival.latitude != null && festival.longitude != null
      ? `https://www.google.com/maps?q=${festival.latitude},${festival.longitude}`
      : null;

  const nextEventImages = nextEvent
    ? [...(nextEvent.imageUrl ? [nextEvent.imageUrl] : []), ...(nextEvent.images ?? [])]
    : [];

  return (
    <PageLayout>
      <AnimatedSection>
        {/* Volver: solo desktop */}
        <Link
          href="/festivales"
          className="hidden font-punch text-xs uppercase tracking-widest text-punk-red transition-colors hover:text-punk-red/80 md:inline-block"
        >
          {t("backToFestivals")}
        </Link>

        {/* Mobile: layout unificado como salas/eventos */}
        <div className="mt-4 space-y-6 lg:hidden">
          {/* Título neon */}
          <h1 className="neon-festival-name-sign w-full">
            <span className="neon-festival-name-text font-display text-xl tracking-tighter sm:text-2xl">
              {festival.name}
            </span>
          </h1>
          {/* Metadata: año (ubicación va debajo de redes) */}
          {festival.foundedYear && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 border-l-2 border-punk-red/40 pl-3">
              <span className="font-punch text-xs uppercase tracking-widest text-punk-red/90">
                {t("from", { year: festival.foundedYear })}
              </span>
            </div>
          )}
          {/* Redes: solo iconos */}
          {festivalLinks.length > 0 && (
            <div className="flex items-center gap-4">
              <SocialLinks links={festivalLinks} variant="red" iconOnly showLabels={false} />
            </div>
          )}
          {/* Ubicación */}
          {festival.location && (
            <p className="font-body text-sm text-punk-red/90">📍 {festival.location}</p>
          )}
          {/* CTA: Web y Mapa (si hay) */}
          {(festival.websiteUrl || mapUrl) && (
            <div className="flex flex-wrap gap-2">
              {festival.websiteUrl && (
                <a
                  href={festival.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border-2 border-punk-red bg-punk-red px-4 py-3 font-punch text-xs uppercase tracking-widest text-punk-black transition-all hover:bg-punk-red/90 hover:shadow-[0_0_20px_rgba(230,0,38,0.3)]"
                >
                  {t("officialWeb")}
                </a>
              )}
              {mapUrl && (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border-2 border-punk-white/40 px-4 py-3 font-punch text-xs uppercase tracking-widest text-punk-white/90 transition-all hover:border-punk-red hover:text-punk-red"
                >
                  {t("viewOnMap")}
                </a>
              )}
            </div>
          )}
          {/* Fotos: 1 principal + 2 horizontal (igual que eventos/salas) */}
          {mainImg && (
            <div className="space-y-2">
              <div className="aspect-[16/10] w-full overflow-hidden border-2 border-punk-red/50">
                <ImageLightbox
                  src={mainImg}
                  alt={festival.name}
                  thumbnailClassName="h-full w-full object-cover cursor-pointer"
                />
              </div>
              {allImages.length > 1 && (
                <div className="grid grid-cols-2 gap-2">
                  {allImages.slice(1, 3).map((src, i) => (
                    <ImageLightbox
                      key={i}
                      src={src}
                      alt={`${festival.name} ${i + 2}`}
                      thumbnailClassName="aspect-[4/3] w-full object-cover border-2 border-punk-red/50 cursor-pointer"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          {/* Descripción */}
          {displayDesc && (
            <div>
              <h3 className="font-display text-base tracking-tighter text-punk-red">
                {t("description")}
              </h3>
              <p className="mt-3 whitespace-pre-wrap font-body leading-relaxed text-punk-white/80">
                {displayDesc}
              </p>
            </div>
          )}
          {/* Próximo evento destacado o lista de próximos */}
          {nextEvent && (
            <div>
              <h3 className="font-display text-base tracking-tighter text-punk-red">
                {t("nextEvent")}
              </h3>
              <div className="mt-4 space-y-3">
                <div className="group relative overflow-hidden border-2 border-punk-red bg-punk-black p-4 transition-all duration-300">
                  <div className="absolute right-0 top-0 h-12 w-12 border-t-2 border-r-2 border-punk-red" style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }} />
                  <Link
                    href={`/eventos/${nextEvent.slug}`}
                    className="relative z-10 block"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="shrink-0 border-2 border-punk-red/50 bg-punk-red/10 px-4 py-2 text-center">
                        <span className="block font-display text-2xl leading-none text-punk-red">
                          {nextEvent.endDate
                            ? `${format(nextEvent.date, "d", { locale: dateLocale })}-${format(nextEvent.endDate, "d", { locale: dateLocale })}`
                            : format(nextEvent.date, "dd", { locale: dateLocale })}
                        </span>
                        <span className="block font-punch text-[10px] uppercase tracking-widest text-punk-white/70">
                          {format(nextEvent.date, "MMM", { locale: dateLocale })}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-display text-lg tracking-tighter text-punk-white transition-colors group-hover:text-punk-red line-clamp-2">
                          {nextEvent.title}
                        </h4>
                        <p className="mt-1 font-body text-sm text-punk-white/70">
                          {nextEvent.endDate
                            ? locale === "eu"
                              ? (() => {
                                  const year = format(nextEvent.date, "yyyy", { locale: dateLocale });
                                  const month = format(nextEvent.date, "MMMM", { locale: dateLocale });
                                  const monthGenitive = month.endsWith("a") ? month.slice(0, -1) + "aren" : month + "ren";
                                  const startDay = format(nextEvent.date, "d", { locale: dateLocale });
                                  const endDay = format(nextEvent.endDate!, "d", { locale: dateLocale });
                                  return `${year}ko ${monthGenitive} ${startDay}tik ${endDay}ra`;
                                })()
                              : `Del ${format(nextEvent.date, "d 'de' MMMM", { locale: dateLocale })} al ${format(nextEvent.endDate, "d 'de' MMMM, yyyy", { locale: dateLocale })}`
                            : format(nextEvent.date, "EEEE d 'de' MMMM, yyyy", { locale: dateLocale })}
                          {nextEvent.venue ? ` · ${nextEvent.venue.name}` : nextEvent.venueText ? ` · ${nextEvent.venueText}` : ""}
                        </p>
                      </div>
                    </div>
                  </Link>
                  <div className="relative z-10 mt-3 flex flex-wrap items-center gap-2">
                    {nextEvent.isSoldOut ? (
                      <span className="border border-punk-red bg-punk-red/30 px-2 py-0.5 font-punch text-[10px] uppercase tracking-widest text-punk-red">
                        {t("soldOut")}
                      </span>
                    ) : nextEvent.ticketUrl ? (
                      <a
                        href={nextEvent.ticketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block border-2 border-punk-red bg-punk-red px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-black transition-all hover:bg-punk-blood hover:border-punk-blood"
                      >
                        {t("buyTickets")}
                      </a>
                    ) : null}
                    <Link
                      href={`/eventos/${nextEvent.slug}`}
                      className="inline-block border-2 border-punk-white/40 px-4 py-2 font-punch text-[10px] uppercase tracking-widest text-punk-white/80 transition-all hover:border-punk-red hover:text-punk-red"
                    >
                      Ver evento →
                    </Link>
                  </div>
                  {nextEventImages.length > 0 && (
                    <div className="relative z-10 mt-3 grid grid-cols-2 gap-0 w-fit">
                      {nextEventImages.slice(0, 2).map((src, i) => (
                        <ImageLightbox
                          key={i}
                          src={src}
                          alt={`${nextEvent.title} ${i + 1}`}
                          thumbnailClassName="h-16 w-16 object-cover border-2 border-punk-red/50 cursor-pointer"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {/* Lista de próximos eventos (cuando no hay nextEvent o hay más eventos) */}
          {((!nextEvent && (festival.events?.length ?? 0) > 0) ||
            (nextEvent && (festival.events?.length ?? 0) > 1)) && (
            <div>
              <h3 className="font-display text-base tracking-tighter text-punk-red">
                {t("upcoming")}
              </h3>
              <div className="mt-4 space-y-3">
                {(nextEvent ? festival.events?.filter((e) => e.id !== nextEvent.id) ?? [] : festival.events ?? []).map((evt) => (
                  <Link
                    key={evt.id}
                    href={`/eventos/${evt.slug}`}
                    className="group relative block overflow-hidden border-2 border-punk-red bg-punk-black p-4 transition-all duration-300 active:scale-[0.99] hover:shadow-[0_0_40px_rgba(230,0,38,0.15)]"
                  >
                    <div className="absolute right-0 top-0 h-12 w-12 border-t-2 border-r-2 border-punk-red" style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }} />
                    <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="shrink-0 border-2 border-punk-red/50 bg-punk-red/10 px-4 py-2 text-center">
                        <span className="block font-display text-2xl leading-none text-punk-red">
                          {evt.endDate
                            ? `${format(evt.date, "d", { locale: dateLocale })}-${format(evt.endDate, "d", { locale: dateLocale })}`
                            : format(evt.date, "dd", { locale: dateLocale })}
                        </span>
                        <span className="block font-punch text-[10px] uppercase tracking-widest text-punk-white/70">
                          {format(evt.date, "MMM", { locale: dateLocale })}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-display text-lg tracking-tighter text-punk-white transition-colors group-hover:text-punk-red line-clamp-2">
                          {evt.title}
                        </h4>
                        {(evt.venue || evt.venueText) && (
                          <p className="mt-0.5 font-body text-sm text-punk-white/70">
                            {evt.venue ? `${evt.venue.name} · ${evt.venue.city}` : evt.venueText ?? ""}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {eventsTotal > EVENTS_PAGE_SIZE && (
                <Pagination
                  page={eventsPage}
                  totalItems={eventsTotal}
                  pageSize={EVENTS_PAGE_SIZE}
                />
              )}
            </div>
          )}
          {/* Registrado por Nafarrock: al final, estilo discreto */}
          {!festival.userId && festival.createdByNafarrock && (
            <p className="pt-6 font-punch text-[10px] uppercase tracking-widest text-punk-red/50">
              {t("registeredByNafarrock")}
            </p>
          )}
        </div>

        {/* Desktop: layout clásico */}
        <article className="mt-10 hidden lg:block">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl lg:text-6xl">
                {festival.name}
              </h1>
              {festivalLinks.length > 0 && (
                <div className="mt-2">
                  <SocialLinks links={festivalLinks} variant="red" />
                </div>
              )}
              {festival.location && (
                <p className="mt-4 font-body text-lg text-punk-white/70">
                  📍 {festival.location}
                </p>
              )}
              {festival.foundedYear && (
                <p className="mt-2 font-punch text-xs uppercase tracking-widest text-punk-red">
                  {t("from", { year: festival.foundedYear })}
                </p>
              )}
            </div>
          </div>

          {/* Galería */}
          {mainImg && (
            <div className="mt-12">
              {allImages.length === 1 ? (
                <div className="overflow-hidden border-2 border-punk-red/50">
                  <ImageLightbox
                    src={mainImg}
                    alt={festival.name}
                    thumbnailClassName="w-full max-h-[500px] object-cover cursor-pointer"
                  />
                </div>
              ) : allImages.length === 2 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {allImages.map((src, i) => (
                    <div key={i} className="overflow-hidden border-2 border-punk-red/50">
                      <ImageLightbox
                        src={src}
                        alt={`${festival.name} ${i + 1}`}
                        thumbnailClassName="h-64 w-full object-cover cursor-pointer sm:h-80 transition-opacity hover:opacity-95"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="overflow-hidden border-2 border-punk-red/50 sm:col-span-2 sm:row-span-2">
                    <ImageLightbox
                      src={mainImg}
                      alt={festival.name}
                      thumbnailClassName="h-64 w-full object-cover cursor-pointer sm:h-full sm:min-h-[400px] transition-opacity hover:opacity-95"
                    />
                  </div>
                  {allImages.slice(1).map((src, i) => (
                    <div key={i} className="overflow-hidden border-2 border-punk-red/50">
                      <ImageLightbox
                        src={src}
                        alt={`${festival.name} ${i + 2}`}
                        thumbnailClassName="h-48 w-full object-cover cursor-pointer sm:h-48 transition-opacity hover:opacity-95"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Ubicación */}
          {festival.location && (
            <div className="mt-12 border-l-4 border-punk-red bg-punk-black/50 p-6">
              <h2 className="font-punch text-xs uppercase tracking-widest text-punk-red/80">
                {t("location")}
              </h2>
              <p className="mt-2 font-display text-xl text-punk-white">{festival.name}</p>
              <p className="mt-2 font-body text-punk-white/70">📍 {festival.location}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {festival.websiteUrl && (
                  <a
                    href={festival.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block border-2 border-punk-red px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-red transition-all hover:bg-punk-red hover:text-punk-black"
                  >
                    {t("officialWeb")} →
                  </a>
                )}
                {mapUrl && (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block border-2 border-punk-white/40 px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-white/80 transition-all hover:border-punk-red hover:text-punk-red"
                  >
                    {t("viewOnMap")} →
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Descripción */}
          {displayDesc && (
            <div className="mt-12">
              <h2 className="font-display text-2xl tracking-tighter text-punk-white">
                {t("description")}
              </h2>
              <p className="mt-4 whitespace-pre-wrap font-body leading-relaxed text-punk-white/80">
                {displayDesc}
              </p>
            </div>
          )}

          {/* Próximo evento destacado */}
          {nextEvent && (
            <div className="mt-16 border-2 border-punk-red bg-punk-black/50 p-6">
              <h2 className="font-punch text-xs uppercase tracking-widest text-punk-red/80">
                {t("nextEvent")}
              </h2>
              <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <Link
                    href={`/eventos/${nextEvent.slug}`}
                    className="font-display text-2xl text-punk-white hover:text-punk-red sm:text-3xl"
                  >
                    {nextEvent.title}
                  </Link>
                  <p className="mt-2 font-body text-punk-white/70">
                    {nextEvent.endDate
                      ? locale === "eu"
                        ? (() => {
                            const year = format(nextEvent.date, "yyyy", { locale: dateLocale });
                            const month = format(nextEvent.date, "MMMM", { locale: dateLocale });
                            const monthGenitive = month.endsWith("a") ? month.slice(0, -1) + "aren" : month + "ren";
                            const startDay = format(nextEvent.date, "d", { locale: dateLocale });
                            const endDay = format(nextEvent.endDate!, "d", { locale: dateLocale });
                            return `${year}ko ${monthGenitive} ${startDay}tik ${endDay}ra`;
                          })()
                        : `Del ${format(nextEvent.date, "d 'de' MMMM", { locale: dateLocale })} al ${format(nextEvent.endDate, "d 'de' MMMM, yyyy", { locale: dateLocale })}`
                      : format(nextEvent.date, "EEEE d 'de' MMMM, yyyy", { locale: dateLocale })}
                    {nextEvent.venue ? ` · ${nextEvent.venue.name}` : nextEvent.venueText ? ` · ${nextEvent.venueText}` : ""}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {nextEvent.isSoldOut ? (
                      <span className="border-2 border-punk-red bg-punk-red/20 px-6 py-3 font-punch text-sm uppercase tracking-widest text-punk-red">
                        {t("soldOut")}
                      </span>
                    ) : nextEvent.ticketUrl ? (
                      <a
                        href={nextEvent.ticketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border-2 border-punk-red bg-punk-red px-6 py-3 font-punch text-sm uppercase tracking-widest text-punk-black transition-all hover:bg-punk-blood hover:border-punk-blood hover:shadow-[0_0_30px_rgba(230,0,38,0.4)]"
                      >
                        {t("buyTickets")}
                      </a>
                    ) : null}
                    <Link
                      href={`/eventos/${nextEvent.slug}`}
                      className="border-2 border-punk-white/40 px-6 py-3 font-punch text-sm uppercase tracking-widest text-punk-white/80 transition-all hover:border-punk-red hover:text-punk-red"
                    >
                      Ver evento →
                    </Link>
                  </div>
                </div>
                {nextEventImages.length > 0 && (
                  <div className="grid shrink-0 grid-flow-col gap-0">
                    {nextEventImages.slice(0, 3).map((src, i) => (
                      <div key={i} className="overflow-hidden border-2 border-punk-red/50">
                        <ImageLightbox
                          src={src}
                          alt={`${nextEvent.title} ${i + 1}`}
                          thumbnailClassName="h-24 w-24 object-cover cursor-pointer sm:h-32 sm:w-32 transition-opacity hover:opacity-95"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lista de próximos eventos (si hay más o no hay nextEvent) */}
          {(!nextEvent || (festival.events?.length ?? 0) > 1) && (festival.events?.length ?? 0) > 0 && (
            <div className="mt-16">
              <h2 className="font-display text-2xl tracking-tighter text-punk-white">
                {t("upcoming")}
              </h2>
              <div className="mt-6 space-y-4 lg:space-y-5">
                {(nextEvent ? festival.events?.filter((e) => e.id !== nextEvent.id) ?? [] : festival.events ?? []).map((evt) => (
                  <Link
                    key={evt.id}
                    href={`/eventos/${evt.slug}`}
                    className="group relative block overflow-hidden border-2 border-punk-red bg-punk-black p-6 transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_40px_rgba(230,0,38,0.15)] md:min-h-[140px]"
                  >
                    {evt.imageUrl && (
                      <>
                        <div
                          className="absolute inset-0 bg-cover bg-[position:center_top] opacity-[0.15]"
                          style={{ backgroundImage: `url(${evt.imageUrl})` }}
                        />
                        <div
                          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-punk-black via-punk-black/70 to-transparent"
                          aria-hidden
                        />
                      </>
                    )}
                    <div className="absolute right-0 top-0 h-16 w-16 border-t-2 border-r-2 border-punk-red" style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }} />
                    <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="shrink-0 border-2 border-punk-red/50 bg-punk-red/10 px-6 py-3 text-center">
                        <span className="block font-display text-3xl leading-none text-punk-red">
                          {evt.endDate
                            ? `${format(evt.date, "d", { locale: dateLocale })}-${format(evt.endDate, "d", { locale: dateLocale })}`
                            : format(evt.date, "dd", { locale: dateLocale })}
                        </span>
                        <span className="block font-punch text-xs uppercase tracking-widest text-punk-white/70">
                          {format(evt.date, "MMM", { locale: dateLocale })}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display text-xl tracking-tighter text-punk-white transition-colors group-hover:text-punk-red sm:text-2xl">
                          {evt.title}
                        </h3>
                        {(evt.venue || evt.venueText) && (
                          <p className="mt-1 font-body text-punk-white/70">
                            {evt.venue ? `${evt.venue.name} · ${evt.venue.city}` : evt.venueText ?? ""}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <span
                          className={`border-2 px-4 py-2 font-punch text-xs uppercase tracking-widest ${
                            evt.type === "FESTIVAL"
                              ? "border-punk-red bg-punk-red/20 text-punk-red"
                              : "border-punk-white/40 bg-punk-black text-punk-white/90"
                          }`}
                        >
                          {evt.type === "FESTIVAL" ? t("festival") : t("concert")}
                        </span>
                        {evt.isSoldOut && (
                          <span className="border-2 border-punk-red bg-punk-red/30 px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-red">
                            {t("soldOut")}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {eventsTotal > EVENTS_PAGE_SIZE && (
                <Pagination
                  page={eventsPage}
                  totalItems={eventsTotal}
                  pageSize={EVENTS_PAGE_SIZE}
                />
              )}
            </div>
          )}

          {/* Registrado por Nafarrock: al final, estilo discreto */}
          {!festival.userId && festival.createdByNafarrock && (
            <p className="mt-16 pt-8 font-punch text-[10px] uppercase tracking-widest text-punk-red/50">
              {t("registeredByNafarrock")}
            </p>
          )}
        </article>
      </AnimatedSection>
    </PageLayout>
  );
}
