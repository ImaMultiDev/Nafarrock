import type { Metadata } from "next";
import { getVenueBySlug } from "@/services/venue.service";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { getTranslations, getLocale } from "next-intl/server";
import { getDateLocale } from "@/lib/date-locale";
import { PageLayout } from "@/components/ui/PageLayout";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { SocialLinks, type SocialLinkItem } from "@/components/ui/SocialLinks";
import { Pagination } from "@/components/ui/Pagination";
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

  return (
    <PageLayout>
      <Link
        href="/salas"
        className="font-punch text-xs uppercase tracking-widest text-punk-pink transition-colors hover:text-punk-pink/80"
      >
        {t("backToVenues")}
      </Link>

      <div className="mt-8 flex flex-col gap-8 md:flex-row">
        <div className="min-w-0 shrink-0 space-y-4">
          <div className="aspect-square w-full max-w-64 overflow-hidden border-2 border-punk-pink">
            {(venue.logoUrl || venue.imageUrl || (venue.images && venue.images[0])) ? (
              <ImageLightbox
                src={venue.logoUrl || venue.imageUrl || venue.images[0]}
                alt={venue.name}
                thumbnailClassName="h-full w-full object-cover cursor-pointer"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-punk-black font-display text-6xl text-punk-pink/40">
                {venue.name.charAt(0)}
              </div>
            )}
          </div>
          {venue.images && venue.images.length > 0 && (() => {
            const mainImg = venue.logoUrl || venue.imageUrl || venue.images[0];
            const gallery = mainImg === venue.images[0] ? venue.images.slice(1) : venue.images;
            if (gallery.length === 0) return null;
            return (
              <div className="flex flex-wrap gap-2">
                {gallery.map((url, i) => (
                  <ImageLightbox
                    key={i}
                    src={url}
                    alt={`${venue.name} ${i + 2}`}
                    thumbnailClassName="h-20 w-20 object-cover border-2 border-punk-pink/50 cursor-pointer"
                  />
                ))}
              </div>
            );
          })()}
        </div>
        <div className="flex-1">
          <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
            {venue.name}
          </h1>
          {!venue.userId && venue.createdByNafarrock && (
            <p className="mt-2 font-punch text-xs uppercase tracking-widest text-punk-red/90">
              {t("registeredByNafarrock")}
            </p>
          )}
          <p className="mt-3 font-body text-punk-white/70">{venue.city}</p>
        {venue.capacity && (
          <p className="mt-2 font-punch text-xs uppercase tracking-widest text-punk-pink">
            {t("capacity", { count: venue.capacity })}
          </p>
        )}

        {displayDesc && (
          <p className="mt-8 font-body leading-relaxed text-punk-white/80">
            {displayDesc}
          </p>
        )}

        {(venue.address || venue.websiteUrl || venue.mapUrl || venue.instagramUrl || venue.facebookUrl) && (
          <div className="mt-8 space-y-3">
            {venue.address && (
              <p className="font-body text-punk-white/70">📍 {venue.address}</p>
            )}
            {(() => {
              const links: SocialLinkItem[] = [
                ...(venue.websiteUrl ? [{ kind: "web" as const, url: venue.websiteUrl, label: "Web oficial" }] : []),
                ...(venue.mapUrl ? [{ kind: "map" as const, url: venue.mapUrl, label: "Ver en mapa" }] : []),
                ...(venue.instagramUrl ? [{ kind: "instagram" as const, url: venue.instagramUrl }] : []),
                ...(venue.facebookUrl ? [{ kind: "facebook" as const, url: venue.facebookUrl }] : []),
              ];
              return links.length > 0 ? (
                <SocialLinks links={links} variant="pink" />
              ) : null;
            })()}
          </div>
        )}

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
                        className="absolute inset-0 opacity-[0.15] bg-cover bg-[position:center_top]"
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
                      <h3 className="font-display text-xl tracking-tighter text-punk-white group-hover:text-punk-red transition-colors sm:text-2xl">
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
        </div>
      </div>
    </PageLayout>
  );
}
