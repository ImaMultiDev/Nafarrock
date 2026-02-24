/**
 * Enlaces a redes sociales - actualizar con URLs reales
 * Correo: enlace interno al formulario de contacto (según rol)
 */
export const SOCIAL_LINKS = [
  {
    name: "Instagram",
    href: "https://instagram.com/nafarrock",
    icon: "instagram" as const,
  },
  {
    name: "Facebook",
    href: "https://facebook.com/nafarrock",
    icon: "facebook" as const,
  },
  {
    name: "YouTube",
    href: "https://youtube.com/@nafarrock",
    icon: "youtube" as const,
  },
  {
    name: "Correo",
    href: "/contacto",
    icon: "mail" as const,
    internal: true,
  },
];
