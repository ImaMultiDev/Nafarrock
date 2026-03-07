import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { searchArtists as spotifySearch, isSpotifyConfigured } from "@/lib/spotify";
import { getArtistArea, isFromNavarraOrEuskadi } from "@/lib/musicbrainz";

const MAX_RESULTS = 12;
const CONCURRENCY = 3;
const FALLBACK_COUNT = 8;

type DiscoveryArtist = {
  id: string;
  name: string;
  imageUrl: string | null;
  spotifyUrl: string | null;
  source: "spotify";
  isRegistered: boolean;
};

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

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

export async function GET(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json(
      { message: "Introduce al menos 2 caracteres para buscar", artists: [] },
      { status: 400 }
    );
  }

  try {
    if (!isSpotifyConfigured()) {
      return NextResponse.json({
        artists: [],
        message: "Spotify no está configurado. Configura SPOTIFY_CLIENT_ID y SPOTIFY_CLIENT_SECRET para usar Descubrir bandas.",
      });
    }

    const candidates: Array<{ name: string; id: string; imageUrl: string | null; spotifyUrl: string | null }> = [];

    try {
      const spotifyArtists = await spotifySearch(q, 20, "ES");
      for (const a of spotifyArtists) {
        const images = a.images ?? [];
        const bestImage = images.length > 0
          ? [...images].sort((x, y) => (y.height ?? 0) - (x.height ?? 0))[0]?.url ?? null
          : null;
        candidates.push({
          name: a.name,
          id: a.id,
          imageUrl: bestImage,
          spotifyUrl: a.external_urls?.spotify ?? `https://open.spotify.com/artist/${a.id}`,
        });
      }
    } catch (err) {
      console.error("[band-discovery] Spotify error:", err);
      return NextResponse.json({
        artists: [],
        message: "Error al buscar en Spotify. Comprueba las credenciales.",
      });
    }

    if (candidates.length === 0) {
      return NextResponse.json({
        artists: [],
        message: "No se encontraron bandas para esta búsqueda.",
      });
    }

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
      candidates.map((c) => c.name),
      checkRegion
    );

    const filtered = candidates
      .map((c, i) => ({ ...c, isFromRegion: regionResults[i] }))
      .filter((c) => c.isFromRegion);

    const toShow =
      filtered.length > 0
        ? filtered.slice(0, MAX_RESULTS)
        : candidates.slice(0, FALLBACK_COUNT).map((c) => ({ ...c, isFromRegion: false }));

    const checkIsRegistered = async (c: (typeof toShow)[0]): Promise<boolean> => {
      if (c.spotifyUrl) {
        const match = c.spotifyUrl.match(/artist\/([a-zA-Z0-9]+)/);
        const artistId = match?.[1];
        if (artistId) {
          const count = await prisma.band.count({
            where: { spotifyUrl: { contains: artistId } },
          });
          if (count > 0) return true;
        }
      }
      const count = await prisma.band.count({
        where: { name: { equals: c.name, mode: "insensitive" } },
      });
      return count > 0;
    };

    const artists: DiscoveryArtist[] = await Promise.all(
      toShow.map(async (c) => ({
        id: c.id,
        name: c.name,
        imageUrl: c.imageUrl,
        spotifyUrl: c.spotifyUrl,
        source: "spotify" as const,
        isRegistered: await checkIsRegistered(c),
      }))
    );

    const message =
      filtered.length === 0 && candidates.length > 0
        ? "No hay bandas de la región para esta búsqueda. Mostrando algunas sugerencias."
        : undefined;

    return NextResponse.json({ artists, message });
  } catch (err) {
    console.error("[band-discovery] Error:", err);
    return NextResponse.json(
      { artists: [], message: "Error al buscar. Inténtalo de nuevo." },
      { status: 500 }
    );
  }
}
