import { prisma } from "@/lib/prisma";
import { startOfToday } from "@/lib/date";

export type EventFilters = {
  type?: "CONCIERTO" | "FESTIVAL";
  venueId?: string;
  fromDate?: Date;
  toDate?: Date;
  search?: string;
  page?: number;
  pageSize?: number;
  /** Si false (por defecto), solo eventos con fecha >= hoy */
  includePast?: boolean;
};

const DEFAULT_PAGE_SIZE = 10;

export async function getEvents(filters: EventFilters = {}) {
  const where: Record<string, unknown> = { isApproved: true };

  if (filters.type) where.type = filters.type;
  if (filters.venueId) where.venueId = filters.venueId;

  // Fechas: por defecto solo futuros/hoy; salvo includePast o si el usuario filtra explícitamente
  if (filters.fromDate || filters.toDate) {
    where.date = {};
    if (filters.fromDate)
      (where.date as Record<string, Date>).gte = filters.fromDate;
    if (filters.toDate)
      (where.date as Record<string, Date>).lte = filters.toDate;
  } else if (filters.includePast !== true) {
    (where as { date?: { gte: Date } }).date = { gte: startOfToday() };
  }

  if (filters.search) {
    const term = filters.search.trim();
    where.OR = [
      { title: { contains: term, mode: "insensitive" } },
      { description: { contains: term, mode: "insensitive" } },
      { venue: { name: { contains: term, mode: "insensitive" } } },
      { venue: { city: { contains: term, mode: "insensitive" } } },
    ];
  }

  const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;
  const page = Math.max(1, filters.page ?? 1);
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { date: "asc" },
      include: {
        venue: true,
        bands: { include: { band: true }, orderBy: { order: "asc" } },
        externalBands: { orderBy: { order: "asc" } },
      },
      skip,
      take: pageSize,
    }),
    prisma.event.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function getEventBySlug(slug: string) {
  return prisma.event.findUnique({
    where: { slug, isApproved: true },
    include: {
      venue: true,
      promoter: true,
      festival: true,
      organizer: true,
      bands: { include: { band: true }, orderBy: { order: "asc" } },
      externalBands: { orderBy: { order: "asc" } },
    },
  });
}

/** Cartel unificado: bandas registradas + externas, ordenadas por order */
export type CartelItem =
  | { type: "band"; id: string; name: string; slug: string; order: number }
  | { type: "external"; id: string; name: string; order: number };

export function getEventCartel(event: {
  bands: { id: string; order: number; band: { name: string; slug: string } }[];
  externalBands: { id: string; name: string; order: number }[];
}): CartelItem[] {
  const items: CartelItem[] = [
    ...event.bands.map((be) => ({
      type: "band" as const,
      id: be.id,
      name: be.band.name,
      slug: be.band.slug,
      order: be.order,
    })),
    ...event.externalBands.map((eb) => ({
      type: "external" as const,
      id: eb.id,
      name: eb.name,
      order: eb.order,
    })),
  ];
  return items.sort((a, b) => a.order - b.order);
}
