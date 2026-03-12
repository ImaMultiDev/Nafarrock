import type { Metadata } from "next";
import { getVenueBySlug } from "@/services/venue.service";
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
  const venue = await getVenueBySlug(slug);
  if (!venue) return {};
  const description = venue.description ?? `Sala de conciertos en ${venue.city}`;
  const imageUrl = venue.logoUrl ?? venue.imageUrl ?? (venue.images && venue.images[0]);
  const canonicalUrl = `${getSiteUrl()}/salas/${slug}`;
  return {
    title: venue.name,
    description,
    openGraph: {
      title: venue.name,
      description,
      url: canonicalUrl,
      siteName: "Nafarrock",
      type: "website",
      images: imageUrl ? [{ url: imageUrl, width: 600, height: 600, alt: venue.name }] : undefined,
    },
    twitter: { card: "summary_large_image", title: venue.name, description, images: imageUrl ? [imageUrl] : undefined },
    alternates: { canonical: canonicalUrl },
  };
}

export default async function VenuePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const eventsPage = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const venue = await getVenueBySlug(slug, eventsPage, EVENTS_PAGE_SIZE);
  if (!venue) notFound();

  const eventsTotal = "eventsTotal" in venue ? venue.eventsTotal : venue.events?.length ?? 0;

  const locale = await getLocale();
  const dateLocale = getDateLocale(locale);
  const t = await getTranslations("venueDetail");
  const displayDesc = locale === "eu" && venue.descriptionEu ? venue.descriptionEu : venue.description;

  const mainImg = venue.logoUrl || venue.imageUrl || (venue.images && venue.images[0]);
  const allImages = mainImg
    ? [mainImg, ...(venue.images ?? []).filter((url) => url !== mainImg)]
    : (venue.images ?? []);

  const venueLinks: SocialLinkItem[] = [
    ...(venue.websiteUrl ? [{ kind: "web" as const, url: venue.websiteUrl, label: t("officialWeb") }] : []),
    ...(venue.mapUrl ? [{ kind: "map" as const, url: venue.mapUrl, label: t("viewOnMap") }] : []),
    ...(venue.instagramUrl ? [{ kind: "instagram" as const, url: venue.instagramUrl }] : []),
    ...(venue.facebookUrl ? [{ kind: "facebook" as const, url: venue.facebookUrl }] : []),
  ];

  const locationDisplay = [venue.city, venue.address].filter(Boolean).join(" · ");

  return (
    <PageLayout>
      <AnimatedSection>
        {/* Volver: solo desktop */}
        <Link
          href="/salas"
          className="hidden font-punch text-xs uppercase tracking-widest text-punk-pink transition-colors hover:text-punk-pink/80 md:inline-block"
        >
          {t("backToVenues")}
        </Link>

        {/* Mobile: layout unificado como eventos */}
        <div className="mt-4 space-y-6 md:hidden">
          {/* Título neon */}
          <h1 className="neon-venue-name-sign w-full">
            <span className="neon-venue-name-text font-display text-xl tracking-tighter sm:text-2xl">
              {venue.name}
            </span>
          </h1>
          {/* Metadata: ciudad · aforo */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 border-l-2 border-punk-pink/40 pl-3">
            {venue.city && (
              <span className="font-body text-sm text-punk-white/80">{venue.city}</span>
            )}
            {venue.city && venue.capacity && <span className="text-punk-pink/40 font-punch">·</span>}
            {venue.capacity && (
              <span className="font-punch text-xs uppercase tracking-widest text-punk-pink/90">
                {t("capacity", { count: venue.capacity })}
              </span>
            )}
          </div>
          {/* Redes: solo iconos */}
          {venueLinks.length > 0 && (
            <div className="flex items-center gap-4">
              <SocialLinks links={venueLinks} variant="pink" iconOnly showLabels={false} />
            </div>
          )}
          {/* Ubicación */}
          {locationDisplay && (
            <p className="font-body text-sm text-punk-pink/90">📍 {locationDisplay}</p>
          )}
          {/* CTA: Web y Mapa (si hay) */}
          {(venue.websiteUrl || venue.mapUrl) && (
            <div className="flex flex-wrap gap-2">
              {venue.websiteUrl && (
                <a
                  href={venue.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border-2 border-punk-pink bg-punk-pink px-4 py-3 font-punch text-xs uppercase tracking-widest text-punk-black transition-all hover:bg-punk-pink/90 hover:shadow-[0_0_20px_rgba(255,0,110,0.3)]"
                >
                  {t("officialWeb")}
                </a>
              )}
              {venue.mapUrl && (
                <a
                  href={venue.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border-2 border-punk-white/40 px-4 py-3 font-punch text-xs uppercase tracking-widest text-punk-white/90 transition-all hover:border-punk-pink hover:text-punk-pink"
                >
                  {t("viewOnMap")}
                </a>
              )}
            </div>
          )}
          {/* Fotos: 1 principal + 2 horizontal (igual que eventos) */}
          {mainImg && (
            <div className="space-y-2">
              <div className="aspect-[16/10] w-full overflow-hidden border-2 border-punk-pink/50">
                <ImageLightbox
                  src={mainImg}
                  alt={venue.name}
                  thumbnailClassName="h-full w-full object-cover cursor-pointer"
                />
              </div>
              {allImages.length > 1 && (
                <div className="grid grid-cols-2 gap-2">
                  {allImages.slice(1, 3).map((src, i) => (
                    <ImageLightbox
                      key={i}
                      src={src}
                      alt={`${venue.name} ${i + 2}`}
                      thumbnailClassName="aspect-[4/3] w-full object-cover border-2 border-punk-pink/50 cursor-pointer"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          {/* Descripción */}
          {displayDesc && (
            <div>
              <h3 className="font-display text-base tracking-tighter text-punk-pink">
                {t("description")}
              </h3>
              <p className="mt-3 whitespace-pre-wrap font-body leading-relaxed text-punk-white/80">
                {displayDesc}
              </p>
            </div>
          )}
          {/* Próximos eventos */}
          {(venue.events?.length ?? 0) > 0 && (
            <div>
              <h3 className="font-display text-base tracking-tighter text-punk-pink">
                {t("upcoming")}
              </h3>
              <div className="mt-4 space-y-3">
                {venue.events.map((evt) => (
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
                        <div className="mt-1 flex flex-wrap gap-2">
                          <span
                            className={`border px-2 py-0.5 font-punch text-[10px] uppercase tracking-widest ${
                              evt.type === "FESTIVAL"
                                ? "border-punk-red bg-punk-red/20 text-punk-red"
                                : "border-punk-white/40 text-punk-white/90"
                            }`}
                          >
                            {evt.type === "FESTIVAL" ? t("festival") : t("concert")}
                          </span>
                          {evt.isSoldOut && (
                            <span className="border border-punk-red bg-punk-red/30 px-2 py-0.5 font-punch text-[10px] uppercase tracking-widest text-punk-red">
                              {t("soldOut")}
                            </span>
                          )}
                        </div>
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
          {!venue.userId && venue.createdByNafarrock && (
            <p className="pt-6 font-punch text-[10px] uppercase tracking-widest text-punk-pink/50">
              {t("registeredByNafarrock")}
            </p>
          )}
        </div>

        {/* Desktop: layout clásico */}
        <article className="mt-10 hidden md:block">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl lg:text-6xl">
                {venue.name}
              </h1>
              {venueLinks.length > 0 && (
                <div className="mt-2">
                  <SocialLinks links={venueLinks} variant="pink" />
                </div>
              )}
              {locationDisplay && (
                <p className="mt-4 font-body text-lg text-punk-white/70">
                  📍 {locationDisplay}
                </p>
              )}
              {venue.capacity && (
                <p className="mt-2 font-punch text-xs uppercase tracking-widest text-punk-pink">
                  {t("capacity", { count: venue.capacity })}
                </p>
              )}
            </div>
          </div>

          {/* Galería */}
          {mainImg && (
            <div className="mt-12">
              {allImages.length === 1 ? (
                <div className="overflow-hidden border-2 border-punk-pink/50">
                  <ImageLightbox
                    src={mainImg}
                    alt={venue.name}
                    thumbnailClassName="w-full max-h-[500px] object-cover cursor-pointer"
                  />
                </div>
              ) : allImages.length === 2 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {allImages.map((src, i) => (
                    <div key={i} className="overflow-hidden border-2 border-punk-pink/50">
                      <ImageLightbox
                        src={src}
                        alt={`${venue.name} ${i + 1}`}
                        thumbnailClassName="h-64 w-full object-cover cursor-pointer sm:h-80 transition-opacity hover:opacity-95"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="overflow-hidden border-2 border-punk-pink/50 sm:col-span-2 sm:row-span-2">
                    <ImageLightbox
                      src={mainImg}
                      alt={venue.name}
                      thumbnailClassName="h-64 w-full object-cover cursor-pointer sm:h-full sm:min-h-[400px] transition-opacity hover:opacity-95"
                    />
                  </div>
                  {allImages.slice(1).map((src, i) => (
                    <div key={i} className="overflow-hidden border-2 border-punk-pink/50">
                      <ImageLightbox
                        src={src}
                        alt={`${venue.name} ${i + 2}`}
                        thumbnailClassName="h-48 w-full object-cover cursor-pointer sm:h-48 transition-opacity hover:opacity-95"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Ubicación */}
          {(venue.address || venue.city) && (
            <div className="mt-12 border-l-4 border-punk-pink bg-punk-black/50 p-6">
              <h2 className="font-punch text-xs uppercase tracking-widest text-punk-pink/80">
                {t("location")}
              </h2>
              <p className="mt-2 font-display text-xl text-punk-white">{venue.name}</p>
              {venue.address && (
                <p className="mt-2 font-body text-punk-white/70">📍 {venue.address}</p>
              )}
              {venue.city && (
                <p className="font-body text-punk-white/70">{venue.city}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-3">
                {venue.websiteUrl && (
                  <a
                    href={venue.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block border-2 border-punk-pink px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-pink transition-all hover:bg-punk-pink hover:text-punk-black"
                  >
                    {t("officialWeb")} →
                  </a>
                )}
                {venue.mapUrl && (
                  <a
                    href={venue.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block border-2 border-punk-white/40 px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-white/80 transition-all hover:border-punk-pink hover:text-punk-pink"
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

          {/* Próximos eventos */}
          {(venue.events?.length ?? 0) > 0 && (
            <div className="mt-16">
              <h2 className="font-display text-2xl tracking-tighter text-punk-white">
                {t("upcoming")}
              </h2>
              <div className="mt-6 space-y-4 lg:space-y-5">
                {venue.events.map((evt) => (
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
          {!venue.userId && venue.createdByNafarrock && (
            <p className="mt-16 pt-8 font-punch text-[10px] uppercase tracking-widest text-punk-pink/50">
              {t("registeredByNafarrock")}
            </p>
          )}
        </article>
      </AnimatedSection>
    </PageLayout>
  );
}
