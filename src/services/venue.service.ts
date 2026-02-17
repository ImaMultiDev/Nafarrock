import { prisma } from "@/lib/prisma";

export async function getVenues(filters: { city?: string; isActive?: boolean; approved?: boolean } = {}) {
  const where: Record<string, unknown> = { approved: true };
  if (filters.city) where.city = { contains: filters.city, mode: "insensitive" };
  if (typeof filters.isActive === "boolean") where.isActive = filters.isActive;
  if (typeof filters.approved === "boolean") where.approved = filters.approved;

  return prisma.venue.findMany({
    where,
    orderBy: { name: "asc" },
  });
}

export async function getVenueBySlug(slug: string) {
  return prisma.venue.findUnique({
    where: { slug, approved: true },
    include: {
      events: {
        where: { isApproved: true },
        orderBy: { date: "asc" },
        include: { bands: { include: { band: true } } },
      },
    },
  });
}
