/**
 * Flags de funcionalidad para mostrar/ocultar secciones temporalmente.
 * Cambiar a false para re-activar.
 */
export const ESCENA_HIDDEN = false; // Escena visible: Bandas, Salas, Festivales

/**
 * Variante del home:
 * - "editorial": diseño actual (hero con guitarra, explorar, manifiesto)
 * - "data-focused": eventos destacados y próximos como foco principal, UI centrada en datos
 */
export const HOME_VARIANT: "editorial" | "data-focused" = "data-focused";

/**
 * Variante de la página /eventos:
 * - "classic": diseño actual (panel inferior móvil, lista virtual, cards desktop)
 * - "optimized": UI/UX optimizada mobile-first y desktop
 */
export const EVENTOS_VARIANT: "classic" | "optimized" = "optimized";

/**
 * Variante de la página /bandas:
 * - "classic": diseño actual (panel inferior móvil, lista virtual, cards desktop)
 * - "optimized": UI/UX optimizada mobile-first y desktop
 */
export const BANDAS_VARIANT: "classic" | "optimized" = "optimized";

/**
 * Variante de la página /festivales:
 * - "classic": diseño actual (panel inferior móvil, lista virtual, cards desktop)
 * - "optimized": UI/UX optimizada mobile-first y desktop con scroll-hide
 */
export const FESTIVALES_VARIANT: "classic" | "optimized" = "optimized";

/**
 * Variante de la página /salas (espacios):
 * - "classic": diseño actual (panel inferior móvil, lista virtual, cards desktop)
 * - "optimized": UI/UX optimizada mobile-first y desktop con scroll-hide
 */
export const SALAS_VARIANT: "classic" | "optimized" = "optimized";

/**
 * Variante de la página /tablon (anuncios):
 * - "classic": diseño actual (panel inferior móvil, lista virtual, cards desktop)
 * - "optimized": UI/UX optimizada mobile-first y desktop con scroll-hide
 */
export const TABLON_VARIANT: "classic" | "optimized" = "optimized";
