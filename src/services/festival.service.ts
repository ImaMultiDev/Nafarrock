import { prisma } from "@/lib/prisma";

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

export async function getFestivalBySlug(slug: string, approvedOnly = true) {
  return prisma.festival.findUnique({
    where: approvedOnly ? { slug, approved: true } : { slug },
    include: {
      user: { select: { name: true } },
      events: {
        where: { isApproved: true },
        orderBy: { date: "asc" },
        include: {
          venue: true,
          bands: { include: { band: true }, orderBy: { order: "asc" } },
        },
      },
    },
  });
}
