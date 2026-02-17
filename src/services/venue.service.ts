import { prisma } from "@/lib/prisma";

export async function getVenues(filters: { city?: string; isActive?: boolean } = {}) {
  const where: Record<string, unknown> = {};
  if (filters.city) where.city = { contains: filters.city, mode: "insensitive" };
  if (typeof filters.isActive === "boolean") where.isActive = filters.isActive;

  return prisma.venue.findMany({
    where,
    orderBy: { name: "asc" },
  });
}

export async function getVenueBySlug(slug: string) {
  return prisma.venue.findUnique({
    where: { slug },
    include: {
      events: {
        where: { isApproved: true },
        orderBy: { date: "asc" },
        include: { bands: { include: { band: true } } },
      },
    },
  });
}
