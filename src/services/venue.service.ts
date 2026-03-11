import { prisma } from "@/lib/prisma";
import { startOfToday } from "@/lib/date";

export type VenueFilters = {
  city?: string;
  capacityMin?: number;
  capacityMax?: number;
  category?: string;
  isActive?: boolean;
  approved?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
};

const DEFAULT_PAGE_SIZE = 12;

const VENUE_CATEGORIES = ["TABERNA_BAR", "SALA_CONCIERTOS", "RECINTO_ABIERTO", "GAZTETXE"] as const;

export async function getVenues(filters: VenueFilters = {}) {
  const andConditions: Record<string, unknown>[] = [{ approved: true }];
  if (filters.city) andConditions.push({ city: { contains: filters.city, mode: "insensitive" } });
  if (filters.category) {
    if (filters.category === "SIN_CATEGORIA") {
      andConditions.push({ category: null });
    } else if (VENUE_CATEGORIES.includes(filters.category as (typeof VENUE_CATEGORIES)[number])) {
      andConditions.push({ category: filters.category });
    }
  }
  if (filters.capacityMin != null || filters.capacityMax != null) {
    const cap: Record<string, number> = {};
    if (filters.capacityMin != null) cap.gte = filters.capacityMin;
    if (filters.capacityMax != null) cap.lte = filters.capacityMax;
    andConditions.push({ capacity: cap });
  }
  if (typeof filters.isActive === "boolean") andConditions.push({ isActive: filters.isActive });
  if (typeof filters.approved === "boolean") andConditions.push({ approved: filters.approved });
  if (filters.search) {
    andConditions.push({
      OR: [
        { name: { contains: filters.search, mode: "insensitive" } },
        { city: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ],
    });
  }
  const where = andConditions.length === 1 ? andConditions[0] : { AND: andConditions };

  const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;
  const page = Math.max(1, filters.page ?? 1);
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.venue.findMany({
      where,
      orderBy: { name: "asc" },
      skip,
      take: pageSize,
    }),
    prisma.venue.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

const EVENTS_PAGE_SIZE = 10;

export async function getVenueBySlug(
  slug: string,
  eventsPage?: number,
  eventsPageSize = EVENTS_PAGE_SIZE
) {
  const venue = await prisma.venue.findUnique({
    where: { slug, approved: true },
  });
  if (!venue) return null;

  const eventsWhere = {
    venueId: venue.id,
    isApproved: true,
    date: { gte: startOfToday() },
  };

  if (eventsPage != null && eventsPage >= 1) {
    const page = Math.max(1, eventsPage);
    const skip = (page - 1) * eventsPageSize;
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where: eventsWhere,
        orderBy: { date: "asc" },
        skip,
        take: eventsPageSize,
        include: {
          bands: { include: { band: true } },
          venue: true,
        },
      }),
      prisma.event.count({ where: eventsWhere }),
    ]);
    return {
      ...venue,
      events,
      eventsTotal: total,
      eventsPage: page,
      eventsPageSize,
    };
  }

  const events = await prisma.event.findMany({
    where: eventsWhere,
    orderBy: { date: "asc" },
    include: {
      bands: { include: { band: true } },
      venue: true,
    },
  });
  return { ...venue, events };
}
