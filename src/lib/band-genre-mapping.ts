/**
 * Mapeo de géneros de Spotify a los géneros del formulario de bandas.
 * Los géneros del formulario: punk, rock urbano, grunge, hardcore, indie, alternativo, metal
 */

const FORM_GENRES = [
  "punk",
  "rock urbano",
  "grunge",
  "hardcore",
  "indie",
  "alternativo",
  "metal",
] as const;

type FormGenre = (typeof FORM_GENRES)[number];

const SPOTIFY_TO_FORM: Array<{ pattern: RegExp; genre: FormGenre }> = [
  { pattern: /\bpunk\b/i, genre: "punk" },
  { pattern: /\bgrunge\b/i, genre: "grunge" },
  { pattern: /\bhardcore\b/i, genre: "hardcore" },
  { pattern: /\bindie\b/i, genre: "indie" },
  { pattern: /\balternative\b/i, genre: "alternativo" },
  { pattern: /\bmetal\b/i, genre: "metal" },
  { pattern: /\brock\b/i, genre: "rock urbano" },
];

/**
 * Convierte un array de géneros de Spotify al conjunto de géneros del formulario.
 * Devuelve géneros únicos, manteniendo el orden de prioridad del mapeo.
 */
export function mapSpotifyGenresToForm(spotifyGenres: string[]): string[] {
  const result = new Set<string>();

  for (const { pattern, genre } of SPOTIFY_TO_FORM) {
    const matches = spotifyGenres.some((g) => pattern.test(g));
    if (matches) result.add(genre);
  }

  return Array.from(result);
}

export { FORM_GENRES };
