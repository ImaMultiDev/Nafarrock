import { prisma } from "@/lib/prisma";

export type PromoterFilters = { search?: string; approved?: boolean };

export async function getPromoters(filters: PromoterFilters = {}, approvedOnly = true) {
  const where: Record<string, unknown> = approvedOnly ? { approved: true } : {};
  if (typeof filters.approved === "boolean") where.approved = filters.approved;
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  return prisma.promoter.findMany({
    where: Object.keys(where).length ? where : undefined,
    orderBy: { name: "asc" },
    include: { user: { select: { name: true } } },
  });
}

export async function getPromoterBySlug(slug: string, approvedOnly = true) {
  return prisma.promoter.findUnique({
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
