/**
 * URL base del sitio para SEO (sitemap, Open Graph, etc.)
 * En Vercel: VERCEL_URL (sin protocolo) o NEXTAUTH_URL
 */
export function getSiteUrl(): string {
  const url = process.env.NEXTAUTH_URL ?? process.env.VERCEL_URL;
  if (url) {
    return url.startsWith("http") ? url : `https://${url}`;
  }
  return "https://nafarrock.com";
}
