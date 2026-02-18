import { prisma } from "@/lib/prisma";

export type EventFilters = {
  type?: "CONCIERTO" | "FESTIVAL";
  venueId?: string;
  fromDate?: Date;
  toDate?: Date;
  search?: string;
  page?: number;
  pageSize?: number;
};

const DEFAULT_PAGE_SIZE = 10;

export async function getEvents(filters: EventFilters = {}) {
  const where: Record<string, unknown> = { isApproved: true };

  if (filters.type) where.type = filters.type;
  if (filters.venueId) where.venueId = filters.venueId;
  if (filters.fromDate || filters.toDate) {
    where.date = {};
    if (filters.fromDate)
      (where.date as Record<string, Date>).gte = filters.fromDate;
    if (filters.toDate)
      (where.date as Record<string, Date>).lte = filters.toDate;
  }
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
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
    },
  });
}
