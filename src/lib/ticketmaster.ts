/**
 * Cliente para Ticketmaster Discovery API v2.
 * Búsqueda de eventos por ciudad.
 */

const TM_BASE = "https://app.ticketmaster.com/discovery/v2";

const CITIES_NAVARRA_EUSKADI = [
  "Pamplona",
  "Iruña",
  "Bilbao",
  "Donostia",
  "San Sebastian",
  "Vitoria",
  "Vitoria-Gasteiz",
  "Tudela",
  "Barakaldo",
  "Getxo",
  "Irún",
];

const MUSIC_SEGMENT_ID = "KZFzniwnSyZfZ7v7nJ";

export type TicketmasterEvent = {
  id: string;
  name: string;
  url: string;
  startDate?: string;
  imageUrl?: string;
  venueName?: string;
  venueCity?: string;
};

export async function searchMusicEvents(
  apiKey: string,
  options?: { city?: string; size?: number; page?: number }
): Promise<TicketmasterEvent[]> {
  const params = new URLSearchParams({
    apikey: apiKey,
    countryCode: "ES",
    segmentId: MUSIC_SEGMENT_ID,
    size: String(options?.size ?? 10),
    sort: "date,asc",
  });

  if (options?.city) {
    params.set("city", options.city);
  }
  if (options?.page !== undefined && options.page > 0) {
    params.set("page", String(options.page));
  }

  const res = await fetch(`${TM_BASE}/events.json?${params}`);
  if (!res.ok) return [];

  const data = (await res.json()) as { _embedded?: { events?: unknown[] } };
  const rawEvents = data._embedded?.events ?? [];
  return rawEvents.map((e) => {
    const ev = e as {
      id: string;
      name: string;
      url?: string;
      dates?: { start?: { localDate?: string; localTime?: string } };
      images?: Array<{ url: string; width?: number }>;
      _embedded?: { venues?: Array<{ name?: string; city?: { name?: string } }> };
    };
    const images = ev.images ?? [];
    const bestImage = images.find((i) => (i.width ?? 0) >= 400) ?? images[0];
    const venue = ev._embedded?.venues?.[0];
    const start = ev.dates?.start;
    let startDate = start?.localDate ?? "";
    if (start?.localTime) startDate += `T${start.localTime}`;

    return {
      id: ev.id,
      name: ev.name,
      url: ev.url ?? `https://www.ticketmaster.com/event/${ev.id}`,
      startDate: startDate || undefined,
      imageUrl: bestImage?.url,
      venueName: venue?.name,
      venueCity: venue?.city?.name,
    };
  });
}

/**
 * Busca eventos de música en las ciudades de Navarra y País Vasco.
 * @param page Página (0 = primera, 1 = siguiente, etc.) para obtener eventos distintos.
 */
export async function searchEventsInRegion(
  apiKey: string,
  limitPerCity = 5,
  page = 0
): Promise<TicketmasterEvent[]> {
  const seen = new Set<string>();
  const results: TicketmasterEvent[] = [];

  for (const city of CITIES_NAVARRA_EUSKADI) {
    const events = await searchMusicEvents(apiKey, {
      city,
      size: limitPerCity,
      page: page > 0 ? page : undefined,
    });
    for (const e of events) {
      if (!seen.has(e.id)) {
        seen.add(e.id);
        results.push(e);
      }
    }
  }

  return results
    .sort((a, b) => (a.startDate ?? "").localeCompare(b.startDate ?? ""))
    .slice(0, 15);
}

export function isTicketmasterConfigured(): boolean {
  return !!process.env.TICKETMASTER_API_KEY?.trim();
}

/**
 * Extrae el ID de evento de URLs de Ticketmaster o Universe.
 * Ejemplos:
 *   ticketmaster.es/event/slug/1607678797 → 1607678797
 *   ticketmaster.com/event/1607678797 → 1607678797
 *   universe.com/events/slug-0QRK6H → 0QRK6H
 */
export function extractEventIdFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();

    if (host.includes("ticketmaster.")) {
      const segments = u.pathname.split("/").filter(Boolean);
      const last = segments[segments.length - 1];
      if (last && /^[\dA-Za-z]+$/.test(last)) return last;
      return null;
    }

    if (host.includes("universe.com")) {
      const match = u.pathname.match(/\/events\/[^/]+-([A-Za-z0-9]+)(?:\?|$)/);
      if (match) return match[1];
      const last = u.pathname.split("/").pop() ?? "";
      const idPart = last.split("-").pop();
      return idPart && /^[A-Za-z0-9]+$/.test(idPart) ? idPart : null;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Obtiene los detalles de un evento por ID desde la Ticketmaster Discovery API.
 */
export async function getEventById(
  apiKey: string,
  eventId: string
): Promise<TicketmasterEvent | null> {
  const res = await fetch(
    `${TM_BASE}/events/${encodeURIComponent(eventId)}.json?apikey=${apiKey}`
  );
  if (!res.ok) return null;

  const data = (await res.json()) as { id?: string; name?: string; url?: string; dates?: unknown; images?: unknown[]; _embedded?: { venues?: unknown[] } };
  const ev = data as {
    id: string;
    name: string;
    url?: string;
    dates?: { start?: { localDate?: string; localTime?: string } };
    images?: Array<{ url: string; width?: number }>;
    _embedded?: { venues?: Array<{ name?: string; city?: { name?: string } }> };
  };

  const images = ev.images ?? [];
  const bestImage = images.find((i) => (i.width ?? 0) >= 400) ?? images[0];
  const venue = ev._embedded?.venues?.[0] as { name?: string; city?: { name?: string } } | undefined;
  const start = ev.dates?.start;
  let startDate = start?.localDate ?? "";
  if (start?.localTime) startDate += `T${start.localTime}`;

  return {
    id: ev.id,
    name: ev.name,
    url: ev.url ?? `https://www.ticketmaster.com/event/${ev.id}`,
    startDate: startDate || undefined,
    imageUrl: bestImage?.url,
    venueName: venue?.name,
    venueCity: venue?.city?.name,
  };
}
