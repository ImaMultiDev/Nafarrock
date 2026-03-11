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
        festival: true,
        bands: { include: { band: true } },
        links: true,
      },
      skip,
      take: pageSize,
    }),
    prisma.event.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

/** Eventos destacados para el Hero (máx. 4, los más próximos) */
export async function getFeaturedEvents(limit = 4) {
  return prisma.event.findMany({
    where: { isApproved: true, isFeatured: true, date: { gte: startOfToday() } },
    orderBy: { date: "asc" },
    take: limit,
    include: {
      venue: true,
      bands: { include: { band: true }, orderBy: { order: "asc" } },
    },
  });
}

export async function getEventBySlug(slug: string) {
  return prisma.event.findUnique({
    where: { slug, isApproved: true },
      include: {
        venue: true,
        promoter: true,
        festival: true,
        organizer: true,
        bands: { include: { band: true } },
        links: true,
      },
  });
}

