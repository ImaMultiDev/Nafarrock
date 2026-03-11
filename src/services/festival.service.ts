import { prisma } from "@/lib/prisma";
import { startOfToday } from "@/lib/date";

export type FestivalFilters = { search?: string; approved?: boolean; page?: number; pageSize?: number };

const DEFAULT_PAGE_SIZE = 12;

export async function getFestivals(filters: FestivalFilters = {}, approvedOnly = true) {
  const where: Record<string, unknown> = approvedOnly ? { approved: true } : {};
  if (typeof filters.approved === "boolean") where.approved = filters.approved;
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { location: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  const w = Object.keys(where).length ? where : undefined;
  const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;
  const page = Math.max(1, filters.page ?? 1);
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.festival.findMany({
      where: w,
      orderBy: { name: "asc" },
      include: { user: { select: { name: true } } },
      skip,
      take: pageSize,
    }),
    prisma.festival.count({ where: w }),
  ]);

  return { items, total, page, pageSize };
}

const EVENTS_PAGE_SIZE = 10;

export async function getFestivalBySlug(
  slug: string,
  approvedOnly = true,
  eventsPage?: number,
  eventsPageSize = EVENTS_PAGE_SIZE
) {
  const festival = await prisma.festival.findUnique({
    where: approvedOnly ? { slug, approved: true } : { slug },
    include: {
      user: { select: { name: true } },
    },
  });
  if (!festival) return null;

  const eventsWhere = {
    festivalId: festival.id,
    isApproved: true,
    date: { gte: startOfToday() },
  };

  if (eventsPage != null && eventsPage >= 1) {
    const page = Math.max(1, eventsPage);
    const skip = (page - 1) * eventsPageSize;
    const [events, total, nextEvent] = await Promise.all([
      prisma.event.findMany({
        where: eventsWhere,
        orderBy: { date: "asc" },
        skip,
        take: eventsPageSize,
        include: {
          venue: true,
          bands: { include: { band: true }, orderBy: { order: "asc" } },
        },
      }),
      prisma.event.count({ where: eventsWhere }),
      page > 1
        ? prisma.event.findFirst({
            where: eventsWhere,
            orderBy: { date: "asc" },
            include: { venue: true },
          })
        : null,
    ]);
    return {
      ...festival,
      events,
      eventsTotal: total,
      eventsPage: page,
      eventsPageSize,
      nextEvent: page === 1 ? (events[0] ?? null) : (nextEvent ?? null),
    };
  }

  const events = await prisma.event.findMany({
    where: eventsWhere,
    orderBy: { date: "asc" },
    include: {
      venue: true,
      bands: { include: { band: true }, orderBy: { order: "asc" } },
    },
  });
  return { ...festival, events, nextEvent: events[0] ?? null };
}
