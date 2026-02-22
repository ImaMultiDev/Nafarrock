import { prisma } from "@/lib/prisma";

export async function getAnnouncementById(id: string) {
  return prisma.announcement.findUnique({
    where: { id, status: "ACTIVE", isApproved: true },
    include: {
      promoter: { select: { id: true, name: true, slug: true } },
      venue: { select: { id: true, name: true, slug: true, city: true } },
      festival: { select: { id: true, name: true, slug: true } },
      organizer: { select: { id: true, name: true, slug: true } },
    },
  });
}
