/**
 * Cliente para Spotify Web API.
 * Usa Client Credentials flow para búsqueda de artistas (sin OAuth de usuario).
 */

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

let cachedToken: { access_token: string; expires_at: number } | null = null;

async function getAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId?.trim() || !clientSecret?.trim()) {
    throw new Error("SPOTIFY_CLIENT_ID y SPOTIFY_CLIENT_SECRET son requeridos");
  }

  if (cachedToken && cachedToken.expires_at > Date.now() + 60000) {
    return cachedToken.access_token;
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Spotify token error: ${err}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    access_token: data.access_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };
  return cachedToken.access_token;
}

export type SpotifyArtist = {
  id: string;
  name: string;
  genres: string[];
  images: Array<{ url: string; height: number; width: number }>;
  external_urls: { spotify: string };
};

export type SpotifySearchResult = {
  artists: {
    items: SpotifyArtist[];
  };
};

/**
 * Busca artistas por nombre o género.
 * @param market - Código ISO (ej: ES) para sesgar resultados hacia ese mercado.
 */
export async function searchArtists(query: string, limit = 5, market?: string): Promise<SpotifyArtist[]> {
  const token = await getAccessToken();
  const params = new URLSearchParams({
    q: query.trim(),
    type: "artist",
    limit: String(Math.min(Math.max(limit, 1), 50)),
  });
  if (market?.trim()) params.set("market", market.trim());

  const res = await fetch(`${SPOTIFY_API_BASE}/search?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Spotify search error: ${err}`);
  }

  const data = (await res.json()) as SpotifySearchResult;
  return data.artists?.items ?? [];
}

export function isSpotifyConfigured(): boolean {
  return !!(
    process.env.SPOTIFY_CLIENT_ID?.trim() &&
    process.env.SPOTIFY_CLIENT_SECRET?.trim()
  );
}

/**
 * Obtiene artistas relacionados desde Spotify.
 * Máximo 20 artistas.
 */
export async function getRelatedArtists(spotifyArtistId: string): Promise<SpotifyArtist[]> {
  const token = await getAccessToken();

  const res = await fetch(
    `${SPOTIFY_API_BASE}/artists/${encodeURIComponent(spotifyArtistId)}/related-artists`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Spotify related artists error: ${err}`);
  }

  const data = (await res.json()) as { artists: SpotifyArtist[] };
  return data.artists ?? [];
}

/**
 * Extrae el Spotify Artist ID de una URL de Spotify.
 * Ej: https://open.spotify.com/artist/3TVXtAsR1Inumwj472S9r4 → 3TVXtAsR1Inumwj472S9r4
 */
export function extractArtistIdFromUrl(spotifyUrl: string | null | undefined): string | null {
  if (!spotifyUrl?.trim()) return null;
  const match = spotifyUrl.match(/spotify\.com\/artist\/([a-zA-Z0-9]+)/);
  return match?.[1] ?? null;
}
