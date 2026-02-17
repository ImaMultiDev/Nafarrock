import { getBandBySlug } from "@/services/band.service";
import { notFound } from "next/navigation";
import Link from "next/link";

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
    description: band.bio ?? `Banda de rock navarra: ${band.genres.join(", ")}`,
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
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/bandas"
        className="text-sm text-void-400 hover:text-void-100"
      >
        ← Volver a bandas
      </Link>

      <div className="mt-8 flex flex-col gap-8 md:flex-row">
        <div className="shrink-0">
          <div className="aspect-square w-64 overflow-hidden rounded-lg bg-void-800">
            {band.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={band.imageUrl}
                alt={band.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-4xl text-void-600">
                {band.name.charAt(0)}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <h1 className="font-display text-3xl font-bold text-void-50">
            {band.name}
          </h1>
          <div className="mt-4 flex flex-wrap gap-2">
            {band.genres.map((g) => (
              <span
                key={g}
                className="rounded bg-rock-900/50 px-3 py-1 text-sm text-rock-300"
              >
                {g}
              </span>
            ))}
            {band.isEmerging && (
              <span className="rounded bg-rock-600/30 px-3 py-1 text-sm text-rock-400">
                Emergente
              </span>
            )}
          </div>
          {band.location && (
            <p className="mt-2 text-void-400">📍 {band.location}</p>
          )}
          {band.bio && (
            <p className="mt-4 text-void-300 leading-relaxed">{band.bio}</p>
          )}
          {links.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-4">
              {links.map(({ label, url }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rock-400 hover:text-rock-300 underline"
                >
                  {label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
