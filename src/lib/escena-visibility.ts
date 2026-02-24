import type { Session } from "next-auth";

/**
 * Roles que pueden ver promotores, organizadores y asociaciones.
 * Usuarios normales (USUARIO) y anónimos no tienen acceso.
 */
const RESTRICTED_ESCENA_VIEWER_ROLES = [
  "ADMIN",
  "BANDA",
  "SALA",
  "FESTIVAL",
  "PROMOTOR",
  "ORGANIZADOR",
  "ASOCIACION",
] as const;

export function canViewRestrictedEscena(session: Session | null): boolean {
  const role = session?.user?.role;
  return !!role && RESTRICTED_ESCENA_VIEWER_ROLES.includes(role as (typeof RESTRICTED_ESCENA_VIEWER_ROLES)[number]);
}
