import { prisma } from "./prisma";

const CONTACT_ALLOWED_ROLES = ["ADMIN", "BANDA", "SALA", "FESTIVAL", "ASOCIACION", "ORGANIZADOR", "PROMOTOR"] as const;

export type ContactAccessResult =
  | { canAccess: true; userName?: string; userEmail: string; role: string; entityName?: string }
  | { canAccess: false; reason: string };

/**
 * Verifica si el usuario puede acceder al formulario de contacto.
 * Solo usuarios aprobados con rol distinto de USUARIO.
 */
export async function canUserAccessContact(userId: string): Promise<ContactAccessResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      bandProfile: true,
      venueProfile: true,
      festivalProfile: true,
      associationProfile: true,
      organizerProfile: true,
      promoterProfile: true,
    },
  });

  if (!user) return { canAccess: false, reason: "Usuario no encontrado" };

  const role = user.role as string;
  if (!CONTACT_ALLOWED_ROLES.includes(role as (typeof CONTACT_ALLOWED_ROLES)[number])) {
    return { canAccess: false, reason: "Solo cuentas de banda, sala, festival, asociación, organizador o promotor aprobadas pueden contactar." };
  }

  // ADMIN siempre puede
  if (role === "ADMIN") {
    return {
      canAccess: true,
      userName: user.name ?? user.firstName ?? undefined,
      userEmail: user.email,
      role: "Administrador",
    };
  }

  const entity =
    user.bandProfile ??
    user.venueProfile ??
    user.festivalProfile ??
    user.associationProfile ??
    user.organizerProfile ??
    user.promoterProfile;

  if (!entity) {
    return { canAccess: false, reason: "No tienes un perfil asociado. Completa el registro." };
  }

  const approved = "approved" in entity ? entity.approved : false;
  if (!approved) {
    return { canAccess: false, reason: "Tu perfil aún no está aprobado. Podrás contactar cuando el administrador lo apruebe." };
  }

  const entityName = "name" in entity ? entity.name : undefined;
  const userName = user.name ?? user.firstName ?? entityName ?? user.email;

  return {
    canAccess: true,
    userName,
    userEmail: user.email,
    role,
    entityName,
  };
}
