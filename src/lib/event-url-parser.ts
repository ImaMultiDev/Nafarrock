/**
 * Parser de URLs de eventos.
 * Extrae datos de páginas con JSON-LD (schema.org Event) u Open Graph.
 */

const USER_AGENT =
  "Mozilla/5.0 (compatible; Nafarrock/1.0; +https://nafarrock.com)";

export type ParsedEventData = {
  title?: string;
  description?: string;
  imageUrl?: string;
  startDate?: string;
  endDate?: string;
  venueName?: string;
  venueAddress?: string;
  ticketUrl?: string;
  price?: string;
  webUrl?: string;
};

function extractJsonLdEvents(html: string): ParsedEventData[] {
  const results: ParsedEventData[] = [];
  const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = regex.exec(html)) !== null) {
    try {
      const json = JSON.parse(match[1].trim());
      const items = Array.isArray(json) ? json : json["@graph"] ? json["@graph"] : [json];

      for (const item of items) {
        const type = item["@type"];
        if (!type) continue;
        const types = Array.isArray(type) ? type : [type];
        if (!types.some((t: string) => /Event/i.test(t))) continue;

        const data: ParsedEventData = {};

        if (item.name) data.title = String(item.name).trim();
        if (item.description) data.description = String(item.description).trim();

        if (item.image) {
          const img = item.image;
          data.imageUrl = Array.isArray(img) ? img[0] : typeof img === "string" ? img : img?.url;
        }

        if (item.startDate) data.startDate = item.startDate;
        if (item.endDate) data.endDate = item.endDate;

        if (item.location) {
          const loc = item.location;
          if (typeof loc === "object") {
            if (loc.name) data.venueName = String(loc.name).trim();
            if (loc.address) {
              const addr = loc.address;
              if (typeof addr === "string") data.venueAddress = addr;
              else if (addr?.streetAddress) data.venueAddress = [addr.streetAddress, addr.addressLocality, addr.addressRegion].filter(Boolean).join(", ");
            }
          }
        }

        if (item.offers) {
          const offers = Array.isArray(item.offers) ? item.offers : [item.offers];
          const first = offers[0];
          if (first?.url) data.ticketUrl = first.url;
          if (first?.price !== undefined) data.price = String(first.price);
        }

        if (item.url) data.webUrl = item.url;

        if (data.title || data.startDate) results.push(data);
      }
    } catch {
      // Ignore invalid JSON
    }
  }

  return results;
}

function extractMetaTags(html: string): Partial<ParsedEventData> {
  const data: Partial<ParsedEventData> = {};
  const getMeta = (name: string): string | null => {
    const regex = new RegExp(`<meta[^>]*${name}=["']([^"']+)["'][^>]*>`, "i");
    const m = html.match(regex);
    if (m) return m[1];
    const regex2 = new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*${name}=["']([^"']+)["'][^>]*>`, "i");
    const m2 = html.match(regex2);
    return m2 ? m2[1] : null;
  };

  const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1];
  const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)?.[1];
  const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1];

  if (ogTitle) data.title = ogTitle.replace(/&amp;/g, "&");
  if (ogDesc) data.description = ogDesc.replace(/&amp;/g, "&");
  if (ogImage) data.imageUrl = ogImage;

  return data;
}

/**
 * Parsea una URL de evento y extrae los datos disponibles.
 */
export async function parseEventUrl(url: string): Promise<ParsedEventData | null> {
  const trimmed = url.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(trimmed, {
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const html = await res.text();
    const jsonLdEvents = extractJsonLdEvents(html);
    const meta = extractMetaTags(html);

    if (jsonLdEvents.length > 0) {
      const best = jsonLdEvents[0];
      return {
        ...meta,
        ...best,
        webUrl: best.webUrl ?? trimmed,
      };
    }

    if (meta.title || meta.description) {
      return {
        ...meta,
        webUrl: trimmed,
      };
    }

    return null;
  } catch {
    return null;
  }
}
