# Plan técnico: Refactor hacia modelo editorial MVP

## Objetivo
Reorientar Nafarrock de plataforma multi-rol a radar cultural / fanzine digital, manteniendo la arquitectura existente y reutilizando moderación, rate limits y flujos de aprobación.

---

## 1. Sistema de usuarios

### Cambios en registro
| Archivo | Cambio |
|---------|--------|
| `src/app/auth/registro/RegisterForm.tsx` | Ocultar sección "Tipo de cuenta" (roles). Forzar `role: "USUARIO"` en el estado y payload. |
| `src/app/api/auth/register/route.ts` | Aceptar solo `role: "USUARIO"` en esta fase. Ignorar/sobrescribir rol si viene otro. |

**Estrategia:** No eliminar la lógica de roles en el API (bandSchema, venueSchema, etc.). Simplemente no invocarla: el frontend solo enviará `role: "USUARIO"` y los datos mínimos (email, password, nombre, apellidos). El backend ya tiene `userOnlySchema` para este caso.

### Ocultar reclamaciones
| Archivo | Cambio |
|---------|--------|
| `src/app/auth/registro/RegisterForm.tsx` | Ocultar bloque "¿Tu perfil ya existe? Búscalo y reclámalo" (solo visible cuando hay roles). |
| `src/app/auth/reclamar/page.tsx` | Opción A: Redirigir a `/` o mostrar mensaje "No disponible en esta fase". Opción B: No enlazar desde ningún sitio (dejar ruta inaccesible). |

---

## 2. Dashboard: ocultar paneles profesionales

| Archivo | Cambio |
|---------|--------|
| `src/app/dashboard/page.tsx` | Ocultar cards: Mi banda, Mi sala, Mi festival, Mi asociación, Mi organizador, Mi promotor, Mis eventos. Solo mostrar: **Mi perfil** y (si ADMIN) **Administración**. Para USUARIO estándar: añadir cards **Proponer banda** y **Proponer evento**. |
| `src/app/dashboard/page.tsx` | Ocultar banner de reclamación pendiente (o dejarlo solo para admin). |
| Navegación / middleware | Las rutas `/dashboard/banda`, `/dashboard/sala`, etc. siguen existiendo. El usuario USUARIO no verá enlaces; si accede por URL, el middleware o la página puede redirigir a `/dashboard`. |

**Estrategia:** Condicionar la renderización de cards por rol. Solo `ADMIN` ve Admin; solo `USUARIO` ve Proponer banda/evento. Los roles profesionales no se asignan en registro, así que no habrá usuarios con esos roles nuevos.

---

## 3. Sistema de propuestas (reutilizando lógica existente)

### Proponer Banda
**Flujo:** Usuario USUARIO → formulario → Band con `approved: false`, `userId: proposer`.

| Elemento | Ubicación | Acción |
|----------|-----------|--------|
| Página | `src/app/dashboard/proponer-banda/page.tsx` | Nueva. Formulario similar a BandForm (admin) pero sin entityId. |
| Formulario | Reutilizar campos de `BandForm` (nombre, bio, logo, imagen, localidad, géneros, redes, etc.). | Crear `BandProposalForm.tsx` o variante. |
| API | `src/app/api/proposals/band/route.ts` | Nueva. POST: crea Band con `approved: false`, `userId: session.user.id`, `createdByNafarrock: false`. |
| Moderación | Ya existe: `/admin/solicitudes` lista bandas con `approved: false` y `userId != null`. | Sin cambios. |

**Rate limiting:** No hay rate limiting HTTP genérico. Podemos añadir un límite simple: máx. N propuestas de banda por usuario por día (ej. 3). Opcional en fase 1.

### Proponer Evento
**Flujo:** Usuario USUARIO → formulario → Event con `isApproved: false`, `createdByUserId: proposer`.

| Elemento | Ubicación | Acción |
|----------|-----------|--------|
| Página | `src/app/dashboard/proponer-evento/page.tsx` | Nueva. Formulario similar a DashboardEventForm. |
| Formulario | Reutilizar `DashboardEventForm` o crear `EventProposalForm` que permita elegir sala de un listado de salas aprobadas. | El usuario no tiene entidad (venue/promoter), así que siempre elige venue de un select. |
| API | `src/app/api/proposals/event/route.ts` | Nueva. POST: crea Event con `isApproved: false`, `createdByUserId: session.user.id`. No llama a `canUserCreateEvent` (que exige rol profesional). Aplicar límite 1 evento cada 5 días por usuario (reutilizar lógica de `validated-event.ts` adaptada para USUARIO). |
| Moderación | Ya existe: `/admin/eventos` lista eventos con `isApproved: false`. ApproveButton ya aprobado. | Sin cambios. |

**Reutilización de rate limit:** La función `canUserCreateEvent` comprueba ventana de 5 días. Crearemos `canUserProposeEvent(userId, date)` que solo compruebe el límite de 5 días para eventos con `createdByUserId = userId`, sin exigir rol ni entidad aprobada.

---

## 4. Admin: simplificación de entidades

| Archivo | Cambio |
|---------|--------|
| `src/app/admin/layout.tsx` | Ocultar enlaces: Promotores, Organizadores, Festivales, Asociaciones, Reclamaciones. Mantener: Solicitudes, Bandas, Importar bandas, Salas, Eventos, Usuarios. Opcional: Anuncios/Bolos (si se usan). |
| `src/app/admin/page.tsx` | Ocultar cards de Promotores, Organizadores, Festivales, Asociaciones, Reclamaciones. Mantener: Bandas, Eventos, Salas, Usuarios, Solicitudes, Anuncios. |
| Salas | Mantener CRUD de salas. Las salas son informativas (asociadas a eventos). Sin cambios en modelo. |

**Estrategia:** Comentar o condicionar con `false` los enlaces/cards que no queremos. No eliminar rutas (`/admin/promotores`, etc.) para no romper referencias; simplemente no enlazarlas.

---

## 5. Dependencias y flujos a preservar

| Flujo | Estado |
|-------|--------|
| Admin crea banda | `POST /api/admin/bands` → Band con `approved: true`. Sin cambios. |
| Admin crea evento | `POST /api/admin/events` → Event con `isApproved: true`. Sin cambios. |
| Admin aprueba banda/sala/etc. | `ApproveButton` → API existente. Sin cambios. |
| Admin aprueba evento | `ApproveButton` en `/admin/eventos`. Sin cambios. |
| Login, recuperación, verificación email | Sin cambios. |
| Schema Prisma, modelos | Sin cambios. |
| Auth callbacks (effectiveRole, etc.) | Sin cambios. USUARIO no tendrá entidad, effectiveRole = USUARIO. |

---

## 6. Orden de implementación sugerido

1. **Registro:** Ocultar selector de roles, forzar USUARIO.
2. **Dashboard:** Ocultar paneles profesionales, añadir Proponer banda y Proponer evento.
3. **API propuestas banda:** `POST /api/proposals/band`.
4. **Página y formulario Proponer banda.**
5. **API propuestas evento:** `POST /api/proposals/event` + `canUserProposeEvent`.
6. **Página y formulario Proponer evento.**
7. **Admin:** Ocultar enlaces y cards de roles avanzados.
8. **Reclamaciones:** Ocultar acceso a `/auth/reclamar`.

---

## 7. Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Usuarios existentes con roles BANDA, SALA, etc. | No tocar. Siguen existiendo en BD. Simplemente no mostramos sus paneles si decidimos ocultarlos por configuración. O mostramos solo a ADMIN. |
| Rutas huérfanas | Mantener rutas; solo ocultar enlaces. Si alguien tiene bookmark a `/dashboard/banda`, puede seguir funcionando (o redirigir a dashboard). |
| Rate limit de propuestas | Implementar en APIs de propuestas. Límite 5 días para eventos; opcional para bandas. |

---

## 8. Archivos nuevos

- `src/app/dashboard/proponer-banda/page.tsx`
- `src/app/dashboard/proponer-banda/BandProposalForm.tsx` (o reutilizar BandForm con props)
- `src/app/api/proposals/band/route.ts`
- `src/app/dashboard/proponer-evento/page.tsx`
- `src/app/dashboard/proponer-evento/EventProposalForm.tsx` (o reutilizar DashboardEventForm)
- `src/app/api/proposals/event/route.ts`
- `src/lib/validated-event.ts` → añadir `canUserProposeEvent(userId, date)` para límite 5 días

## 9. Archivos a modificar

- `src/app/auth/registro/RegisterForm.tsx`
- `src/app/api/auth/register/route.ts` (opcional, si queremos forzar USUARIO en backend)
- `src/app/dashboard/page.tsx`
- `src/app/admin/layout.tsx`
- `src/app/admin/page.tsx`
- `src/app/auth/reclamar/page.tsx` (ocultar o redirigir)

---

## 10. Estado de implementación ✅

| # | Tarea | Estado |
|---|-------|--------|
| 1 | Registro: ocultar roles, forzar USUARIO | ✅ |
| 2 | Dashboard: ocultar paneles, añadir Proponer | ✅ |
| 3 | API propuestas banda | ✅ |
| 4 | Página y formulario Proponer banda | ✅ |
| 5 | API propuestas evento + canUserProposeEvent | ✅ |
| 6 | Página y formulario Proponer evento | ✅ |
| 7 | Admin: ocultar enlaces roles avanzados | ✅ |
| 8 | Reclamaciones: ocultar acceso | ✅ |

**Archivos con `EDITORIAL_MVP_MODE = true`:** RegisterForm, register/route, dashboard/page, admin/layout, admin/page, auth/reclamar, auth/login, bolos/page, Header.
