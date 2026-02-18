import { prisma } from "@/lib/prisma";

export type VenueFilters = {
  city?: string;
  capacityMin?: number;
  capacityMax?: number;
  isActive?: boolean;
  approved?: boolean;
  search?: string;
};

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
