import { prisma } from "./prisma";

const EVENT_CREATOR_ROLES = ["SALA", "FESTIVAL", "ORGANIZADOR", "PROMOTOR"] as const;
const DAYS_BETWEEN_EVENTS = 5;

export type CanCreateEventResult =
  | { ok: true }
  | { ok: false; reason: "no_role" | "not_approved" | "limit_exceeded"; message: string };

/**
 * Verifica si un usuario puede crear un evento.
 * - Debe tener rol SALA, FESTIVAL, ORGANIZADOR o PROMOTOR
 * - Su entidad (venue, festival, organizer, promoter) debe estar aprobada
 * - No puede crear más de 1 evento cada 5 días (salvo eventLimitExempt en eventos existentes)
 */
export async function canUserCreateEvent(
  userId: string,
  newEventDate: Date,
  excludeEventId?: string
): Promise<CanCreateEventResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      venueProfile: true,
      festivalProfile: true,
      organizerProfile: true,
      promoterProfile: true,
    },
  });

  if (!user) return { ok: false, reason: "no_role", message: "Usuario no encontrado" };

  const role = user.role as string;
  if (!EVENT_CREATOR_ROLES.includes(role as (typeof EVENT_CREATOR_ROLES)[number])) {
    return {
      ok: false,
      reason: "no_role",
      message: "Tu tipo de cuenta no puede crear eventos. Regístrate como sala, festival, organizador o promotor.",
    };
  }

  const entity =
    user.venueProfile ??
    user.festivalProfile ??
    user.organizerProfile ??
    user.promoterProfile;

  if (!entity) {
    return {
      ok: false,
      reason: "not_approved",
      message: "No tienes una entidad asociada. Completa el registro.",
    };
  }

  const approved = "approved" in entity ? entity.approved : false;
  if (!approved) {
    return {
      ok: false,
      reason: "not_approved",
      message: "Tu entidad aún no está aprobada. Espera a que el administrador la revise.",
    };
  }

  // Límite 1 evento cada 5 días: no puede haber otro evento en ±5 días
  const windowStart = new Date(newEventDate);
  windowStart.setDate(windowStart.getDate() - DAYS_BETWEEN_EVENTS);
  const windowEnd = new Date(newEventDate);
  windowEnd.setDate(windowEnd.getDate() + DAYS_BETWEEN_EVENTS);

  const where: { createdByUserId: string; eventLimitExempt: boolean; date: { gte: Date; lte: Date }; id?: { not: string } } = {
    createdByUserId: userId,
    eventLimitExempt: false,
    date: { gte: windowStart, lte: windowEnd },
  };
  if (excludeEventId) where.id = { not: excludeEventId };

  const existingInWindow = await prisma.event.count({ where });

  if (existingInWindow >= 1) {
    return {
      ok: false,
      reason: "limit_exceeded",
      message: `Para garantizar visibilidad para todos, ahora mismo puedes publicar 1 evento cada ${DAYS_BETWEEN_EVENTS} días. Ya tienes uno en esa ventana. Con Plan PRO podrás ampliar este límite.`,
    };
  }

  return { ok: true };
}

/**
 * Obtiene los IDs de entidad para asociar al evento según el rol del usuario.
 */
export async function getEventCreatorIds(userId: string): Promise<{
  venueId?: string;
  promoterId?: string;
  organizerId?: string;
  festivalId?: string;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      venueProfile: true,
      festivalProfile: true,
      organizerProfile: true,
      promoterProfile: true,
    },
  });

  if (!user) return {};

  const role = user.role as string;
  const result: {
    venueId?: string;
    promoterId?: string;
    organizerId?: string;
    festivalId?: string;
  } = {};

  if (role === "SALA" && user.venueProfile?.approved) {
    result.venueId = user.venueProfile.id;
  }
  if (role === "PROMOTOR" && user.promoterProfile?.approved) {
    result.promoterId = user.promoterProfile.id;
  }
  if (role === "ORGANIZADOR" && user.organizerProfile?.approved) {
    result.organizerId = user.organizerProfile.id;
  }
  if (role === "FESTIVAL" && user.festivalProfile?.approved) {
    result.festivalId = user.festivalProfile.id;
  }

  return result;
}
