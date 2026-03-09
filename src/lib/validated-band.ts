import { prisma } from "./prisma";

const DAYS_BETWEEN_PROPOSALS = 5;

export type CanProposeResult =
  | { ok: true }
  | { ok: false; reason: "limit_exceeded"; message: string };

/**
 * Verifica si un usuario puede proponer una banda (límite anti-spam).
 * 1 banda cada 5 días por usuario.
 */
export async function canUserProposeBand(
  userId: string,
  excludeId?: string
): Promise<CanProposeResult> {
  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - DAYS_BETWEEN_PROPOSALS);
  const windowEnd = new Date();
  windowEnd.setDate(windowEnd.getDate() + DAYS_BETWEEN_PROPOSALS);

  const where: {
    userId: string;
    createdAt: { gte: Date; lte: Date };
    id?: { not: string };
  } = {
    userId,
    createdAt: { gte: windowStart, lte: windowEnd },
  };
  if (excludeId) where.id = { not: excludeId };

  const existingInWindow = await prisma.band.count({ where });

  if (existingInWindow >= 1) {
    return {
      ok: false,
      reason: "limit_exceeded",
      message: `Puedes proponer 1 banda cada ${DAYS_BETWEEN_PROPOSALS} días. Ya tienes una propuesta en esa ventana.`,
    };
  }

  return { ok: true };
}
