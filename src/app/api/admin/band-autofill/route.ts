import { NextResponse } from "next/server";
import { createHash } from "crypto";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { z } from "zod";
import { searchArtists as spotifySearch } from "@/lib/spotify";
import {
  searchArtists as mbSearch,
  getArtistWithUrls,
  extractUrlsFromRelations,
  mapAreaToLocation,
} from "@/lib/musicbrainz";
import { mapSpotifyGenresToForm } from "@/lib/band-genre-mapping";

const bodySchema = z.object({
  bandName: z.string().min(1).max(200),
});

export type BandAutofillData = {
  name?: string;
  bio?: string;
  genres?: string[];
  imageUrl?: string;
  logoUrl?: string;
  spotifyUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  webUrl?: string;
  bandcampUrl?: string;
  foundedYear?: number;
  location?: string;
};

const BIO_PROMPT = `Genera una biografía breve (2-4 párrafos) en castellano para una banda de rock/música alternativa.
- Usa solo el nombre de la banda y los géneros que te proporciono.
- Tono informativo y natural para una ficha de catálogo musical.
- No inventes datos concretos (fechas, miembros, discos) si no los conoces.
- Máximo 300 palabras.
- Devuelve solo el texto, sin títulos ni explicaciones.`;

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Nombre de banda inválido", data: null },
      { status: 400 }
    );
  }

  const bandName = parsed.data.bandName.trim();
  const normalized = bandName.toLowerCase();
  const nameHash = createHash("sha256").update(normalized).digest("hex");

  try {
    // 1. Consultar caché
    const cached = await prisma.bandAutofillCache.findUnique({
      where: { nameHash },
    });
    if (cached) {
      const data = cached.data as BandAutofillData;
      return NextResponse.json({ data });
    }

    // 2. Spotify (fuente principal)
    let data: BandAutofillData = {};
    let spotifyArtist: Awaited<ReturnType<typeof spotifySearch>>[0] | null = null;

    if (process.env.SPOTIFY_CLIENT_ID?.trim() && process.env.SPOTIFY_CLIENT_SECRET?.trim()) {
      try {
        const artists = await spotifySearch(bandName);
        spotifyArtist = artists[0] ?? null;

        if (spotifyArtist) {
          data.name = spotifyArtist.name;
          data.spotifyUrl = spotifyArtist.external_urls?.spotify;
          data.genres = mapSpotifyGenresToForm(spotifyArtist.genres ?? []);

          const images = spotifyArtist.images ?? [];
          if (images.length > 0) {
            const sorted = [...images].sort((a, b) => (b.height ?? 0) - (a.height ?? 0));
            data.imageUrl = sorted[0]?.url;
            const smaller = images.find((i) => (i.height ?? 0) <= 300) ?? sorted[sorted.length - 1];
            data.logoUrl = smaller?.url ?? data.imageUrl;
          }
        }
      } catch (err) {
        console.error("[band-autofill] Spotify error:", err);
      }
    }

    // 3. MusicBrainz (complementario)
    try {
      const mbArtists = await mbSearch(bandName);
      const mbArtist = mbArtists[0];
      if (mbArtist) {
        const fullArtist = await getArtistWithUrls(mbArtist.id);
        if (fullArtist) {
          if (!data.name) data.name = fullArtist.name;

          const urls = extractUrlsFromRelations(fullArtist);
          if (urls.instagramUrl) data.instagramUrl = urls.instagramUrl;
          if (urls.facebookUrl) data.facebookUrl = urls.facebookUrl;
          if (urls.youtubeUrl) data.youtubeUrl = urls.youtubeUrl;
          if (urls.webUrl) data.webUrl = urls.webUrl;
          if (urls.bandcampUrl) data.bandcampUrl = urls.bandcampUrl;

          const begin = fullArtist["life-span"]?.begin;
          if (begin) {
            const year = parseInt(begin.slice(0, 4), 10);
            if (!isNaN(year) && year >= 1900 && year <= new Date().getFullYear()) {
              data.foundedYear = year;
            }
          }

          const loc = mapAreaToLocation(fullArtist);
          if (loc) data.location = loc;
        }
      }
    } catch (err) {
      console.error("[band-autofill] MusicBrainz error:", err);
    }

    // Si no hay datos de ninguna fuente
    if (!data.name && !data.genres?.length && !data.imageUrl) {
      return NextResponse.json({
        data: null,
        message: "No se encontró información para esta banda",
      });
    }

    // 4. Generar biografía con IA si tenemos nombre y géneros
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (apiKey && (data.name || bandName) && (data.genres?.length ?? 0) > 0) {
      try {
        const openai = new OpenAI({ apiKey });
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: BIO_PROMPT },
            {
              role: "user",
              content: `Banda: ${data.name ?? bandName}. Géneros: ${(data.genres ?? []).join(", ")}.`,
            },
          ],
          temperature: 0.5,
        });
        const bio = completion.choices[0]?.message?.content?.trim();
        if (bio) data.bio = bio;
      } catch (err) {
        console.error("[band-autofill] OpenAI bio error:", err);
      }
    }

    // Asegurar nombre si solo tenemos de MusicBrainz o como fallback
    if (!data.name) data.name = bandName;

    // 5. Guardar en caché
    await prisma.bandAutofillCache.create({
      data: { nameHash, data: data as object },
    });

    return NextResponse.json({ data });
  } catch (err) {
    console.error("[band-autofill] Error:", err);
    return NextResponse.json(
      { data: null, message: "Error al buscar información. Inténtalo de nuevo." },
      { status: 500 }
    );
  }
}
