import type { Metadata } from "next";
import { getFestivalBySlug } from "@/services/festival.service";
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

  const links: SocialLinkItem[] = [
    ...(festival.websiteUrl ? [{ kind: "web" as const, url: festival.websiteUrl }] : []),
    ...(festival.instagramUrl ? [{ kind: "instagram" as const, url: festival.instagramUrl }] : []),
    ...(festival.facebookUrl ? [{ kind: "facebook" as const, url: festival.facebookUrl }] : []),
  ];

  const nextEventImages = nextEvent
    ? [...(nextEvent.imageUrl ? [nextEvent.imageUrl] : []), ...(nextEvent.images ?? [])]
    : [];

  return (
    <PageLayout>
      <Link
        href="/festivales"
        className="font-punch text-xs uppercase tracking-widest text-punk-red transition-colors hover:text-punk-red/80"
      >
        {t("backToFestivals")}
      </Link>

      <div className="mt-8 flex flex-col gap-8 md:flex-row">
        <div className="min-w-0 shrink-0 space-y-4">
          <div className="aspect-square w-full max-w-64 overflow-hidden border-2 border-punk-red">
            {festival.logoUrl ? (
              <ImageLightbox
                src={festival.logoUrl}
                alt={festival.name}
                thumbnailClassName="h-full w-full object-cover cursor-pointer"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-punk-black font-display text-6xl text-punk-red/40">
                {festival.name.charAt(0)}
              </div>
            )}
          </div>
          {festival.images && festival.images.length > 0 && (() => {
            const mainImg = festival.logoUrl || festival.images[0];
            const gallery = mainImg === festival.images[0] ? festival.images.slice(1) : festival.images;
            if (gallery.length === 0) return null;
            return (
              <div className="flex flex-wrap gap-2">
                {gallery.map((url, i) => (
                  <ImageLightbox
                    key={i}
                    src={url}
                    alt={`${festival.name} ${i + 2}`}
                    thumbnailClassName="h-20 w-20 object-cover border-2 border-punk-red/50 cursor-pointer"
                  />
                ))}
              </div>
            );
          })()}
        </div>
        <div className="flex-1">
          <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
            {festival.name}
          </h1>
          {links.length > 0 && (
            <div className="mt-2">
              <SocialLinks links={links} variant="red" />
            </div>
          )}
          {!festival.userId && festival.createdByNafarrock && (
            <p className="mt-2 font-punch text-xs uppercase tracking-widest text-punk-red/90">
              {t("registeredByNafarrock")}
            </p>
          )}
          {festival.location && (
            <p className="mt-2 font-body text-punk-white/70">{festival.location}</p>
          )}
          {festival.foundedYear && (
            <p className="mt-1 font-punch text-xs uppercase tracking-widest text-punk-red/80">
              {t("from", { year: festival.foundedYear })}
            </p>
          )}
          {displayDesc && (
            <p className="mt-4 font-body leading-relaxed text-punk-white/80">
              {displayDesc}
            </p>
          )}
        </div>
      </div>

      {/* Próximo evento destacado: fecha, CTA entradas, imágenes del evento */}
      {nextEvent && (
        <div className="mt-12 border-2 border-punk-red bg-punk-black/50 p-6">
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
              <div className="flex shrink-0 flex-wrap gap-3">
                {nextEventImages.slice(0, 3).map((src, i) => (
                  <div key={i} className="overflow-hidden border-2 border-punk-red/50">
                    <ImageLightbox
                      src={src}
                      alt={`${nextEvent.title} ${i + 1}`}
                      thumbnailClassName="h-24 w-24 object-cover cursor-pointer sm:h-32 sm:w-32"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {!nextEvent && festival.events.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-2xl tracking-tighter text-punk-white">
            {t("upcoming")}
          </h2>
          <div className="mt-6 space-y-4 lg:space-y-5">
            {festival.events.map((evt) => (
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
    </PageLayout>
  );
}
