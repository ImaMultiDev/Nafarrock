import { prisma } from "@/lib/prisma";

export async function getOrganizers(approvedOnly = true) {
  return prisma.organizer.findMany({
    where: approvedOnly ? { approved: true } : undefined,
    orderBy: { name: "asc" },
    include: { user: { select: { name: true } } },
  });
}

export async function getOrganizerBySlug(slug: string, approvedOnly = true) {
  return prisma.organizer.findUnique({
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
