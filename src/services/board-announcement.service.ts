import { prisma } from "@/lib/prisma";

export type BoardAnnouncementFilters = {
  category?: "SE_BUSCA_MUSICO" | "SE_BUSCAN_BANDAS" | "CONCURSO" | "LOCAL_MATERIAL" | "SERVICIOS" | "OTROS";
  territory?: string;
  page?: number;
  pageSize?: number;
};

const DEFAULT_PAGE_SIZE = 10;

export async function getBoardAnnouncements(
  filters: BoardAnnouncementFilters = {}
) {
  const where: Record<string, unknown> = { approved: true };

  if (filters.category) where.category = filters.category;
  if (filters.territory) where.territory = filters.territory;

  const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;
  const page = Math.max(1, filters.page ?? 1);
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.boardAnnouncement.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.boardAnnouncement.count({ where }),
  ]);

  return { items, total, page, pageSize };
}
