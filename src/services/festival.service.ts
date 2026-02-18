import { prisma } from "@/lib/prisma";

export async function getFestivals(approvedOnly = true) {
  return prisma.festival.findMany({
    where: approvedOnly ? { approved: true } : undefined,
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
