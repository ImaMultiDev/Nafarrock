import { prisma } from "@/lib/prisma";

export async function getPromoters(approvedOnly = true) {
  return prisma.promoter.findMany({
    where: approvedOnly ? { approved: true } : undefined,
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
