import { prisma } from "@/lib/prisma";

export type FestivalFilters = { search?: string; approved?: boolean };

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
  return prisma.festival.findMany({
    where: Object.keys(where).length ? where : undefined,
    orderBy: { name: "asc" },
    include: { user: { select: { name: true } } },
  });
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
