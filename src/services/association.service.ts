import { prisma } from "@/lib/prisma";
import { startOfToday } from "@/lib/date";

export type AssociationFilters = { search?: string; approved?: boolean; page?: number; pageSize?: number };

const DEFAULT_PAGE_SIZE = 12;

export async function getAssociations(filters: AssociationFilters = {}, approvedOnly = true) {
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
    prisma.asociacion.findMany({
      where: w,
      orderBy: { name: "asc" },
      include: { user: { select: { name: true } } },
      skip,
      take: pageSize,
    }),
    prisma.asociacion.count({ where: w }),
  ]);

  return { items, total, page, pageSize };
}

export async function getAssociationBySlug(slug: string, approvedOnly = true) {
  return prisma.asociacion.findUnique({
    where: approvedOnly ? { slug, approved: true } : { slug },
    include: {
      user: { select: { name: true } },
      events: {
        where: { isApproved: true, date: { gte: startOfToday() } },
        orderBy: { date: "asc" },
        include: {
          venue: true,
          bands: { include: { band: true }, orderBy: { order: "asc" } },
        },
      },
    },
  });
}
