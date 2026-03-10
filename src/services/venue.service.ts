import { prisma } from "@/lib/prisma";
import { startOfToday } from "@/lib/date";

export type VenueFilters = {
  city?: string;
  capacityMin?: number;
  capacityMax?: number;
  isActive?: boolean;
  approved?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
};

const DEFAULT_PAGE_SIZE = 12;

export async function getVenues(filters: VenueFilters = {}) {
  const where: Record<string, unknown> = { approved: true };
  if (filters.city) where.city = { contains: filters.city, mode: "insensitive" };
  if (filters.capacityMin != null || filters.capacityMax != null) {
    where.capacity = {};
    if (filters.capacityMin != null)
      (where.capacity as Record<string, number>).gte = filters.capacityMin;
    if (filters.capacityMax != null)
      (where.capacity as Record<string, number>).lte = filters.capacityMax;
  }
  if (typeof filters.isActive === "boolean") where.isActive = filters.isActive;
  if (typeof filters.approved === "boolean") where.approved = filters.approved;
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { city: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

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
