/**
 * Cliente para MusicBrainz API.
 * No requiere API key; solo User-Agent identificativo.
 */

const MUSICBRAINZ_BASE = "https://musicbrainz.org/ws/2";
const USER_AGENT = "Nafarrock/1.0 (https://nafarrock.com; admin band autofill)";

const headers = {
  Accept: "application/json",
  "User-Agent": USER_AGENT,
};

export type MusicBrainzArtist = {
  id: string;
  name: string;
  "life-span"?: { begin?: string; end?: string };
  country?: string;
  area?: { name?: string };
  relations?: Array<{
    type?: string;
    url?: { resource?: string };
  }>;
};

export type MusicBrainzSearchResponse = {
  artists?: Array<{
    id: string;
    name: string;
    country?: string;
    area?: { name?: string };
  }>;
};

/**
 * Busca artistas por nombre o término.
 */
export async function searchArtists(query: string, limit = 10): Promise<MusicBrainzArtist[]> {
  const params = new URLSearchParams({
    query: query.trim(),
    limit: String(Math.min(Math.max(limit, 1), 25)),
  });

  const res = await fetch(`${MUSICBRAINZ_BASE}/artist/?${params}`, { headers });

  if (!res.ok) {
    throw new Error(`MusicBrainz search error: ${res.status}`);
  }

  const data = (await res.json()) as MusicBrainzSearchResponse;
  return data.artists ?? [];
}

/**
 * Obtiene un artista por ID con relaciones (URLs sociales, etc.).
 */
export async function getArtistWithUrls(mbid: string): Promise<MusicBrainzArtist | null> {
  const res = await fetch(
    `${MUSICBRAINZ_BASE}/artist/${mbid}?inc=url-rels&fmt=json`,
    { headers }
  );

  if (!res.ok) return null;

  return (await res.json()) as MusicBrainzArtist;
}

/** Mapeo de tipos de relación MusicBrainz a nuestros campos */
const RELATION_TYPE_MAP: Record<string, string> = {
  instagram: "instagramUrl",
  facebook: "facebookUrl",
  youtube: "youtubeUrl",
  "official homepage": "webUrl",
  bandcamp: "bandcampUrl",
};

/** Fallback: detectar tipo por dominio de la URL */
const URL_DOMAIN_MAP: Array<{ pattern: RegExp; field: string }> = [
  { pattern: /instagram\.com/i, field: "instagramUrl" },
  { pattern: /facebook\.com|fb\.com/i, field: "facebookUrl" },
  { pattern: /youtube\.com|youtu\.be/i, field: "youtubeUrl" },
  { pattern: /bandcamp\.com/i, field: "bandcampUrl" },
];

/**
 * Extrae URLs de las relaciones de un artista.
 */
export function extractUrlsFromRelations(artist: MusicBrainzArtist): Record<string, string> {
  const urls: Record<string, string> = {};
  const relations = artist.relations ?? [];

  for (const rel of relations) {
    const resource = rel.url?.resource;
    if (!resource?.startsWith("http")) continue;

    const type = (rel.type ?? "").toLowerCase();
    const field = RELATION_TYPE_MAP[type];
    if (field && !urls[field]) {
      urls[field] = resource;
      continue;
    }
    // Fallback: detectar por dominio
    for (const { pattern, field } of URL_DOMAIN_MAP) {
      if (pattern.test(resource) && !urls[field]) {
        urls[field] = resource;
        break;
      }
    }
  }

  return urls;
}

/**
 * Mapea país/área de MusicBrainz a territorio del formulario (Nafarroa, Araba, Bizkaia, Gipuzkoa).
 */
export function mapAreaToLocation(artist: MusicBrainzArtist): string | undefined {
  const area = artist.area?.name ?? artist.country ?? "";
  if (!area) return undefined;

  const lower = area.toLowerCase();
  if (lower.includes("navarr") || lower.includes("nafarroa")) return "Nafarroa";
  if (lower.includes("álava") || lower.includes("araba")) return "Araba";
  if (lower.includes("vizcaya") || lower.includes("bizkaia")) return "Bizkaia";
  if (lower.includes("guipúzcoa") || lower.includes("gipuzkoa")) return "Gipuzkoa";
  if (lower.includes("euskadi") || lower.includes("país vasco")) return undefined; // No podemos saber cuál

  return undefined;
}

/**
 * Obtiene el área/país de un artista desde MusicBrainz.
 * Usado para filtrar artistas por región (Navarra / País Vasco).
 */
export async function getArtistArea(artistName: string): Promise<string | undefined> {
  const params = new URLSearchParams({
    query: artistName.trim(),
    limit: "1",
  });

  const res = await fetch(`${MUSICBRAINZ_BASE}/artist/?${params}`, { headers });
  if (!res.ok) return undefined;

  const data = (await res.json()) as MusicBrainzSearchResponse;
  const artist = data.artists?.[0];
  if (!artist) return undefined;

  const areaFromSearch = artist.area?.name ?? artist.country ?? "";
  if (areaFromSearch) return areaFromSearch;

  const fullArtist = await getArtistWithUrls(artist.id);
  return fullArtist?.area?.name ?? fullArtist?.country ?? undefined;
}

/**
 * Determina si un artista pertenece a Navarra o País Vasco según el área de MusicBrainz.
 */
export function isFromNavarraOrEuskadi(area: string | undefined): boolean {
  if (!area?.trim()) return false;
  const lower = area.toLowerCase();
  if (lower.includes("navarr") || lower.includes("nafarroa")) return true;
  if (lower.includes("álava") || lower.includes("araba")) return true;
  if (lower.includes("vizcaya") || lower.includes("bizkaia")) return true;
  if (lower.includes("guipúzcoa") || lower.includes("gipuzkoa")) return true;
  if (lower.includes("euskadi") || lower.includes("país vasco") || lower.includes("basque country")) return true;
  return false;
}
