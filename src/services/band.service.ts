import { prisma } from "@/lib/prisma";

export type BandFilters = {
  genre?: string;
  location?: string;
  isActive?: boolean;
  isEmerging?: boolean;
  approved?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
};

const DEFAULT_PAGE_SIZE = 12;

/**
 * Servicio de dominio: Bandas
 * Lógica de negocio para listado y búsqueda
 */
export async function getBands(filters: BandFilters = {}) {
  const where: Record<string, unknown> = {};

  if (filters.genre) {
    where.genres = { has: filters.genre };
  }
  if (filters.location) {
    where.location = { contains: filters.location, mode: "insensitive" };
  }
  if (typeof filters.isActive === "boolean") {
    where.isActive = filters.isActive;
  }
  if (typeof filters.isEmerging === "boolean") {
    where.isEmerging = filters.isEmerging;
  }
  if (typeof filters.approved === "boolean") {
    where.approved = filters.approved;
  } else {
    where.approved = true;
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { bio: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;
  const page = Math.max(1, filters.page ?? 1);
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.band.findMany({
      where,
      orderBy: { name: "asc" },
      include: { user: { select: { name: true } } },
      skip,
      take: pageSize,
    }),
    prisma.band.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function getBandBySlug(slug: string, approvedOnly = true) {
  return prisma.band.findUnique({
    where: approvedOnly ? { slug, approved: true } : { slug },
    include: {
      events: { include: { event: true } },
      user: { select: { name: true, email: true } },
      members: { orderBy: { order: "asc" } },
    },
  });
}

