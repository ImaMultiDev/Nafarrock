# Nafarrock - Roadmap: Registros, Roles y Acciones

## Resumen ejecutivo

Sistema completo para convertir Nafarrock en la **plataforma #1** de bandas, eventos, salas, festivales y promotores en Navarra y País Vasco.

---

## Requisitos externos (debes configurar)

| Servicio | Uso | Variables de entorno |
|----------|-----|----------------------|
| **PostgreSQL** | Base de datos | `DATABASE_URL` |
| **Cloudinary** | Imágenes (logo, galería max 3) | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| **NextAuth** | Autenticación | `NEXTAUTH_URL`, `NEXTAUTH_SECRET` |

---

## Roles y entidades

### Admin
- Añadir bandas, eventos, salas **sin límite**
- Editar/borrar cualquier registro
- **Aprobar** registros pendientes (bandas, salas, festivales, promotores, organizadores)
- Botón "Registrar banda" (crear directamente como admin)

### Usuario registrado (tipos de cuenta)
| Tipo | Descripción | Tras aprobación |
|------|-------------|------------------|
| **BANDA** | Registra su banda | Visible en /bandas |
| **SALA** | Registra su sala/espacio | Visible en /salas, puede crear eventos |
| **FESTIVAL** | Organizador de festival | Puede crear eventos |
| **ORGANIZADOR** | Organiza eventos puntuales | Puede crear eventos |
| **PROMOTOR** | Promociona eventos | Puede crear eventos |
| **USUARIO** | Solo cuenta | Sin entidad asociada |

### Límite de eventos para validados
- **1 evento por cada 5 días** (salvo que admin apruebe excepción)
- Salas, festivales, organizadores y promotores validados pueden crear eventos

---

## Datos por usuario (registro)

| Campo | Obligatorio | Visible | Notas |
|-------|-------------|---------|-------|
| Email | ✓ | Público | |
| Contraseña | ✓ | - | |
| Nombre personal | ✓ | Público | |
| Apellidos | ✓ | Público | |
| Nombre entidad | ✓ | Público | Banda, sala, festival, etc. |
| Teléfono | Opcional | Solo admin | |
| Localidad | ✓ | Público | |
| Año fundación | Opcional | Público | |
| Redes sociales | Opcional | Público | Instagram, Facebook, etc. |
| Logo | Opcional | Público | Cloudinary |
| Imágenes | Max 3 | Público | Cloudinary, carpetas organizadas |

### Bandas (adicional)
- **Miembros**: nombre + instrumento por cada uno

---

## Datos de evento (creados por validados)

| Campo | Tipo | Notas |
|-------|------|-------|
| Fecha | DateTime | |
| Precio | String | "Entrada libre", "15€" |
| Abonos | Opcional | |
| Aforo | Opcional | |
| Imagen cartel | Opcional | Cloudinary |
| Descripción | Opcional | |
| Bandas | Relación | Cartel del evento |

---

## Fases de implementación

### Fase 1: Schema y migraciones ✅ COMPLETADA
- Expandir User (firstName, lastName, phone)
- Nuevos roles: SALA, FESTIVAL, ORGANIZADOR
- Venue con userId, approved
- BandMember (miembros de banda)
- Event con createdBy, eventLimitExempt
- Organizer entity

### Fase 2: Cloudinary ✅ COMPLETADA
- API upload con carpetas: `nafarrock/{tipo}/{id}/`
- Límite 3 imágenes por entidad
- Logo separado

### Fase 3: Registro multi-rol ✅ COMPLETADA
- Formulario dinámico por tipo
- Crear User + entidad pendiente (approved: false)

### Fase 4: Admin CRUD ✅ COMPLETADA
- Aprobar/rechazar
- Crear/editar/borrar bandas, eventos, salas
- Botón "Registrar banda"

### Fase 5: Eventos por validados ✅ COMPLETADA
- Dashboard para crear eventos
- Validación 1 evento cada 5 días
- Admin puede eximir (eventLimitExempt en edición)

### Fase 6: Dashboard usuario ✅ COMPLETADA
- Perfil propio (datos personales, estado aprobación)
- Editar datos (User: nombre, apellidos; Banda/Sala: logo, redes, etc.)
- Ver estado de aprobación
