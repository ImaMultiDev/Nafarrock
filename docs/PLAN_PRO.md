# Plan PRO — Nafarrock

**Estado:** Documentado y preparado. **NO activo.** Sin implementación de pagos.

---

## ¿Qué es el Plan PRO?

El Plan PRO es un nivel de visibilidad y contacto para **promotores** y **organizadores** de la escena. Permite maximizar la exposición y el acceso a datos de contacto de bandas y salas.

---

## ¿A quién aplica?

| Entidad       | Sin PRO           | Con PRO                        |
|---------------|-------------------|--------------------------------|
| **Promotores** | Visibilidad limitada | Visibilidad completa + contacto |
| **Organizadores** | Visibilidad limitada | Visibilidad completa + contacto |
| **Festivales** | Sin restricción   | Sin restricción                |
| **Bandas / Salas** | Sin restricción | Sin restricción                |

---

## Lógica de visibilidad (futura)

- **No PRO:** Solo nombre y ficha pública básica. Sin acceso a datos de contacto de bandas/salas.
- **PRO:** Ficha completa, datos de contacto visibles, prioridad en resultados de búsqueda, posibilidad de destacar en sección Escena.

---

## Estructura técnica preparada

### Schema (Prisma)

Se han añadido flags en el modelo para control futuro:

- `isPro: Boolean` en Promoter y Organizer
- `planType: String?` (opcional, para futuros planes: "PRO", "PRO_PLUS", etc.)

El admin puede marcar manualmente usuarios como PRO en esta fase.

### Estado actual

- **NO** se implementan pagos
- **NO** se integran pasarelas de pago
- **NO** se bloquean registros ni funcionalidades
- Los flags existen en BD para pruebas manuales por admin

---

## Integración de pagos (futuro)

Cuando se active el Plan PRO en producción:

1. Integrar pasarela (Stripe, PayPal, etc.)
2. Definir precios y periodicidad (mensual, anual)
3. Flujo: registro → selección plan → pago → activación `isPro`
4. Renovaciones y bajas

---

## Notas

- Colectivos: entidad prevista para futuras ampliaciones.
- Este documento sirve como referencia para la fase de monetización.

*Última actualización: Febrero 2025*
