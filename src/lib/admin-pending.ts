import { prisma } from "./prisma";

export async function getAdminPendingCounts(): Promise<{
  solicitudes: number;
  reclamaciones: number;
}> {
  const [solicitudes, reclamaciones] = await Promise.all([
    prisma.$transaction([
      prisma.band.count({ where: { approved: false, userId: { not: null } } }),
      prisma.venue.count({ where: { approved: false, userId: { not: null } } }),
      prisma.festival.count({ where: { approved: false, userId: { not: null } } }),
      prisma.asociacion.count({ where: { approved: false, userId: { not: null } } }),
      prisma.promoter.count({ where: { approved: false } }),
      prisma.organizer.count({ where: { approved: false } }),
    ]).then((counts) => counts.reduce((a, b) => a + b, 0)),
    prisma.profileClaim.count({ where: { status: "PENDING_CLAIM" } }),
  ]);

  return { solicitudes, reclamaciones };
}
