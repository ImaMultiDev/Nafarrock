/**
 * Extrae el ID de vídeo de URLs de YouTube para embed.
 * Soporta: watch?v=ID, youtu.be/ID, embed/ID
 */
export function getYouTubeEmbedUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const u = url.trim();
  // YouTube watch: ?v=VIDEO_ID
  const watchMatch = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  // Ya es embed
  const embedMatch = u.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return u;
  return null;
}
