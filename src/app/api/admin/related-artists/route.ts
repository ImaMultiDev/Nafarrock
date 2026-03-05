import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { getRelatedArtists, extractArtistIdFromUrl } from "@/lib/spotify";
import { getArtistArea, isFromNavarraOrEuskadi } from "@/lib/musicbrainz";

const CONCURRENCY = 3;
const FALLBACK_COUNT = 10;

async function processWithConcurrency<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const batch = items.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
}

export type RelatedArtistItem = {
  id: string;
  name: string;
  imageUrl: string | null;
  spotifyUrl: string;
  isRegistered: boolean;
};

export async function GET(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const bandId = searchParams.get("bandId");
  if (!bandId) {
    return NextResponse.json(
      { message: "bandId requerido", artists: [] },
      { status: 400 }
    );
  }

  try {
    const band = await prisma.band.findUnique({
      where: { id: bandId },
      select: { spotifyUrl: true },
    });

    if (!band) {
      return NextResponse.json(
        { message: "Banda no encontrada", artists: [] },
        { status: 404 }
      );
    }

    const spotifyArtistId = extractArtistIdFromUrl(band.spotifyUrl);
    if (!spotifyArtistId) {
      return NextResponse.json({
        artists: [],
        message: "La banda no tiene URL de Spotify. Añádela para ver sugerencias.",
      });
    }

    const spotifyArtists = await getRelatedArtists(spotifyArtistId);
    if (spotifyArtists.length === 0) {
      return NextResponse.json({
        artists: [],
        message: "No hay artistas similares en Spotify.",
      });
    }

    const checkIsRegistered = async (artistId: string): Promise<boolean> => {
      const count = await prisma.band.count({
        where: {
          spotifyUrl: { contains: artistId },
        },
      });
      return count > 0;
    };

    const checkRegion = async (artistName: string): Promise<boolean> => {
      const normalized = artistName.trim().toLowerCase();
      const nameHash = createHash("sha256").update(normalized).digest("hex");

      const cached = await prisma.artistRegionCache.findUnique({
        where: { nameHash },
      });
      if (cached !== null) return cached.isFromRegion;

      const area = await getArtistArea(artistName);
      const isFromRegion = isFromNavarraOrEuskadi(area);

      await prisma.artistRegionCache.upsert({
        where: { nameHash },
        create: { nameHash, isFromRegion },
        update: { isFromRegion },
      });

      return isFromRegion;
    };

    const regionResults = await processWithConcurrency(
      spotifyArtists.map((a) => a.name),
      checkRegion
    );

    const filtered = spotifyArtists
      .map((a, i) => ({ artist: a, isFromRegion: regionResults[i] }))
      .filter(({ isFromRegion }) => isFromRegion);

    const toShow =
      filtered.length > 0 ? filtered : spotifyArtists.slice(0, FALLBACK_COUNT).map((a) => ({ artist: a, isFromRegion: false }));

    const artists: RelatedArtistItem[] = await Promise.all(
      toShow.map(async ({ artist }) => {
        const images = artist.images ?? [];
        const bestImage = images.length > 0
          ? [...images].sort((a, b) => (b.height ?? 0) - (a.height ?? 0))[0]?.url ?? null
          : null;

        const isRegistered = await checkIsRegistered(artist.id);

        return {
          id: artist.id,
          name: artist.name,
          imageUrl: bestImage,
          spotifyUrl: artist.external_urls?.spotify ?? `https://open.spotify.com/artist/${artist.id}`,
          isRegistered,
        };
      })
    );

    return NextResponse.json({ artists });
  } catch (err) {
    console.error("[related-artists] Error:", err);
    return NextResponse.json(
      { artists: [], message: "Error al obtener artistas relacionados." },
      { status: 500 }
    );
  }
}
