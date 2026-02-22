import { getBandBySlug } from "@/services/band.service";
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

  const links: SocialLinkItem[] = [
    band.spotifyUrl && { kind: "spotify" as const, url: band.spotifyUrl },
    band.bandcampUrl && { kind: "bandcamp" as const, url: band.bandcampUrl },
    band.instagramUrl && { kind: "instagram" as const, url: band.instagramUrl },
    band.facebookUrl && { kind: "facebook" as const, url: band.facebookUrl },
    band.youtubeUrl && { kind: "youtube" as const, url: band.youtubeUrl },
    band.webUrl && { kind: "web" as const, url: band.webUrl },
  ].filter((x): x is SocialLinkItem => Boolean(x));

  return (
    <PageLayout>
      <Link
        href="/bandas"
        className="font-punch text-xs uppercase tracking-widest text-punk-green transition-colors hover:text-punk-green/80"
      >
        ← Volver a bandas
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
              Perfil creado por Nafarrock
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {band.genres.map((g) => (
              <span
                key={g}
                className="border border-punk-green/50 bg-punk-green/10 px-3 py-1 font-punch text-xs uppercase tracking-widest text-punk-green"
              >
                {g}
              </span>
            ))}
            {band.isEmerging && (
              <span className="border border-punk-red/50 bg-punk-red/10 px-3 py-1 font-punch text-xs uppercase tracking-widest text-punk-red">
                Emergente
              </span>
            )}
          </div>
          {band.location && (
            <p className="mt-2 font-body text-punk-white/70">📍 {band.location}</p>
          )}
          {band.foundedYear && (
            <p className="mt-1 font-punch text-xs uppercase tracking-widest text-punk-green/80">
              Desde {band.foundedYear}
            </p>
          )}
          {band.bio && (
            <p className="mt-4 font-body leading-relaxed text-punk-white/80">{band.bio}</p>
          )}
          {band.members && band.members.length > 0 && (
            <div className="mt-6">
              <h3 className="font-display text-lg tracking-tighter text-punk-white">Miembros</h3>
              <ul className="mt-2 space-y-1">
                {band.members.map((m) => (
                  <li key={m.id} className="font-body text-punk-white/80">
                    {m.name} — {m.instrument}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-6">
            <Link
              href="/bolos"
              className="inline-flex items-center gap-2 border-2 border-punk-green bg-punk-green px-6 py-3 font-punch text-sm uppercase tracking-widest text-punk-black transition-all hover:bg-punk-green/90 hover:shadow-[0_0_24px_rgba(0,200,83,0.25)]"
            >
              Buscar bolos
            </Link>
          </div>
          {links.length > 0 && (
            <div className="mt-6">
              <SocialLinks links={links} variant="green" />
            </div>
          )}

          {band.events && band.events.length > 0 && (
            <div className="mt-16">
              <h2 className="font-display text-2xl tracking-tighter text-punk-white">
                Próximos eventos
              </h2>
              <ul className="mt-6 space-y-3">
                {band.events.map((be) => (
                  <li key={be.id}>
                    <Link
                      href={`/eventos/${be.event.slug}`}
                      className="flex flex-wrap items-center justify-between gap-4 border-2 border-punk-green/50 bg-punk-black p-4 transition-all hover:border-punk-green hover:shadow-[0_0_20px_rgba(0,200,83,0.15)]"
                    >
                      <span className="font-display text-punk-white">{be.event.title}</span>
                      <span className="font-punch text-xs uppercase tracking-widest text-punk-green">
                        {format(be.event.date, "d MMM yyyy", { locale: es })} · {be.event.venue.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
