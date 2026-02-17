import { getBandBySlug } from "@/services/band.service";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageLayout } from "@/components/ui/PageLayout";

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

  const links = [
    band.spotifyUrl && { label: "Spotify", url: band.spotifyUrl },
    band.bandcampUrl && { label: "Bandcamp", url: band.bandcampUrl },
    band.instagramUrl && { label: "Instagram", url: band.instagramUrl },
    band.youtubeUrl && { label: "YouTube", url: band.youtubeUrl },
    band.webUrl && { label: "Web", url: band.webUrl },
  ].filter(Boolean) as { label: string; url: string }[];

  return (
    <PageLayout>
      <Link
        href="/bandas"
        className="font-punch text-xs uppercase tracking-widest text-punk-green transition-colors hover:text-punk-green/80"
      >
        ← Volver a bandas
      </Link>

      <div className="mt-8 flex flex-col gap-8 md:flex-row">
        <div className="shrink-0">
          <div className="aspect-square w-64 overflow-hidden border-2 border-punk-green">
            {band.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={band.imageUrl}
                alt={band.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-punk-black font-display text-6xl text-punk-green/40">
                {band.name.charAt(0)}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
            {band.name}
          </h1>
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
          {links.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-4">
              {links.map(({ label, url }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-2 border-punk-green bg-transparent px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-green transition-all hover:bg-punk-green hover:text-punk-black"
                >
                  {label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
