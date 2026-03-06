import { getBandBySlug } from "@/services/band.service";
import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { format } from "date-fns";
import { getDateLocale } from "@/lib/date-locale";
import { PageLayout } from "@/components/ui/PageLayout";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { SocialLinks, type SocialLinkItem } from "@/components/ui/SocialLinks";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const band = await getBandBySlug(slug);
  if (!band) return {};
  return {
    title: band.name,
    description: band.bio ?? `Banda de rock nafarroa: ${band.genres.join(", ")}`,
  };
}

export default async function BandPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const band = await getBandBySlug(slug);
  if (!band) notFound();

  const locale = await getLocale();
  const dateLocale = getDateLocale(locale);
  const t = await getTranslations("bandDetail");
  const displayBio = locale === "eu" && band.bioEu ? band.bioEu : band.bio;

  const links: SocialLinkItem[] = [
    ...(band.spotifyUrl ? [{ kind: "spotify" as const, url: band.spotifyUrl }] : []),
    ...(band.bandcampUrl ? [{ kind: "bandcamp" as const, url: band.bandcampUrl }] : []),
    ...(band.instagramUrl ? [{ kind: "instagram" as const, url: band.instagramUrl }] : []),
    ...(band.facebookUrl ? [{ kind: "facebook" as const, url: band.facebookUrl }] : []),
    ...(band.youtubeUrl ? [{ kind: "youtube" as const, url: band.youtubeUrl }] : []),
    ...(band.webUrl ? [{ kind: "web" as const, url: band.webUrl }] : []),
    ...(band.merchUrl ? [{ kind: "merch" as const, url: band.merchUrl }] : []),
  ];

  const statusLabel =
    band.status === "INACTIVE"
      ? t("status.inactive")
      : band.status === "PAUSED"
        ? t("status.paused")
        : t("status.active");
  const statusKey = band.status === "INACTIVE" ? "inactive" : band.status === "PAUSED" ? "paused" : "active";

  return (
    <PageLayout>
      <Link
        href="/bandas"
        className="font-punch text-xs uppercase tracking-widest text-punk-green transition-colors hover:text-punk-green/80"
      >
        ← {t("backToBands")}
      </Link>

      <div className="mt-8 flex flex-col gap-8 md:flex-row">
        <div className="min-w-0 shrink-0 space-y-4">
          <div className="aspect-square w-full max-w-64 overflow-hidden border-2 border-punk-green">
            {(band.logoUrl || band.imageUrl || (band.images && band.images[0])) ? (
              <ImageLightbox
                src={band.logoUrl || band.imageUrl || band.images[0]}
                alt={band.name}
                thumbnailClassName="h-full w-full object-cover cursor-pointer"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-punk-black font-display text-6xl text-punk-green/40">
                {band.name.charAt(0)}
              </div>
            )}
          </div>
          {band.images && band.images.length > 0 && (() => {
            const mainImg = band.logoUrl || band.imageUrl || band.images[0];
            const gallery = mainImg === band.images[0] ? band.images.slice(1) : band.images;
            if (gallery.length === 0) return null;
            return (
              <div className="flex flex-wrap gap-2">
                {gallery.map((url, i) => (
                  <ImageLightbox
                    key={i}
                    src={url}
                    alt={`${band.name} ${i + 2}`}
                    thumbnailClassName="h-20 w-20 object-cover border-2 border-punk-green/50 cursor-pointer"
                  />
                ))}
              </div>
            );
          })()}
        </div>
        <div className="flex-1">
          <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
            {band.name}
          </h1>
          {!band.userId && band.createdByNafarrock && (
            <p className="mt-2 font-punch text-xs uppercase tracking-widest text-punk-red/90">
              {t("registeredByNafarrock")}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <span
              className={`border px-3 py-1 font-punch text-xs uppercase tracking-widest ${
                statusKey === "active"
                  ? "border-punk-green/50 bg-punk-green/10 text-punk-green"
                  : statusKey === "paused"
                    ? "border-punk-yellow/50 bg-punk-yellow/10 text-punk-yellow"
                    : "border-punk-white/30 bg-punk-white/10 text-punk-white/70"
              }`}
            >
              {statusLabel}
            </span>
            {band.genres.map((g) => (
              <span
                key={g}
                className="border border-punk-green/50 bg-punk-green/10 px-3 py-1 font-punch text-xs uppercase tracking-widest text-punk-green"
              >
                {g}
              </span>
            ))}
          </div>
          {band.location && (
            <p className="mt-2 font-body text-punk-white/70">📍 {band.location}</p>
          )}
          {band.foundedYear && (
            <p className="mt-1 font-punch text-xs uppercase tracking-widest text-punk-green/80">
              {t("from", { year: band.foundedYear })}
            </p>
          )}
          {displayBio && (
            <p className="mt-4 font-body leading-relaxed text-punk-white/80">{displayBio}</p>
          )}
          {band.members && band.members.length > 0 && (
            <div className="mt-6">
              <h3 className="font-display text-lg tracking-tighter text-punk-white">{t("members")}</h3>
              <ul className="mt-2 space-y-1">
                {band.members.map((m) => (
                  <li key={m.id} className="font-body text-punk-white/80">
                    {m.name} — {m.instrument}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {links.length > 0 && (
            <div className="mt-6">
              <SocialLinks links={links} variant="green" />
            </div>
          )}

          {band.events && band.events.length > 0 && (
            <div className="mt-16">
              <h2 className="font-display text-2xl tracking-tighter text-punk-white">
                {t("upcoming")}
              </h2>
              <div className="mt-6 space-y-4 lg:space-y-5">
                {band.events.map((be) => {
                  const event = be.event;
                  return (
                    <Link
                      key={be.id}
                      href={`/eventos/${event.slug}`}
                      className="group relative block overflow-hidden border-2 border-punk-red bg-punk-black p-6 transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_40px_rgba(230,0,38,0.15)] md:min-h-[140px]"
                    >
                      {event.imageUrl && (
                        <>
                          <div
                            className="absolute inset-0 opacity-[0.15] bg-cover bg-[position:center_top]"
                            style={{ backgroundImage: `url(${event.imageUrl})` }}
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
                            {event.endDate
                              ? `${format(event.date, "d", { locale: dateLocale })}-${format(event.endDate, "d", { locale: dateLocale })}`
                              : format(event.date, "dd", { locale: dateLocale })}
                          </span>
                          <span className="block font-punch text-xs uppercase tracking-widest text-punk-white/70">
                            {format(event.date, "MMM", { locale: dateLocale })}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-display text-xl tracking-tighter text-punk-white group-hover:text-punk-red transition-colors sm:text-2xl">
                            {event.title}
                          </h3>
                          {event.venue && (
                            <p className="mt-1 font-body text-punk-white/70">
                              {event.venue.name} · {event.venue.city}
                            </p>
                          )}
                          {event.bands && event.bands.length > 0 && (
                            <p className="mt-2 font-punch text-xs uppercase tracking-widest text-punk-green/80">
                              {event.bands.map((b) => b.band.name).join(" + ")}
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2">
                          <span
                            className={`border-2 px-4 py-2 font-punch text-xs uppercase tracking-widest ${
                              event.type === "FESTIVAL"
                                ? "border-punk-red bg-punk-red/20 text-punk-red"
                                : "border-punk-white/40 bg-punk-black text-punk-white/90"
                            }`}
                          >
                            {event.type === "FESTIVAL" ? t("festival") : t("concert")}
                          </span>
                          {event.isSoldOut && (
                            <span className="border-2 border-punk-red bg-punk-red/30 px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-red">
                              {t("soldOut")}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
