import { prisma } from "./prisma";

type EntityType = "event" | "band" | "boardAnnouncement";

export async function createInboxMessage(params: {
  userId: string;
  kind: "PROPOSAL_APPROVED" | "PROPOSAL_REJECTED";
  entityType: EntityType;
  entityId: string;
  entityName: string;
  body?: string | null;
}) {
  const { userId, kind, entityType, entityId, entityName, body } = params;
  const titles: Record<string, Record<string, string>> = {
    event: {
      PROPOSAL_APPROVED: "Evento aprobado",
      PROPOSAL_REJECTED: "Evento rechazado",
    },
    band: {
      PROPOSAL_APPROVED: "Banda aprobada",
      PROPOSAL_REJECTED: "Banda rechazada",
    },
    boardAnnouncement: {
      PROPOSAL_APPROVED: "Anuncio aprobado",
      PROPOSAL_REJECTED: "Anuncio rechazado",
    },
  };
  const title = titles[entityType]?.[kind] ?? `${entityType} ${kind}`;
  return prisma.inboxMessage.create({
    data: {
      userId,
      kind,
      entityType,
      entityId,
      title: `${title}: ${entityName}`,
      body: body?.trim() || null,
    },
  });
}
