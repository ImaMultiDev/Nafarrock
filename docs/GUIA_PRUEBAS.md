# Nafarrock – Guía de pruebas manuales

Guía paso a paso para comprobar que todo funciona correctamente. Marca cada casilla al completarla.

**Última actualización:** Editar/borrar evento por creador, Cartel en eventos, Páginas públicas Festival/Promotor/Organizador

---

## Requisitos previos

- [V] PostgreSQL ejecutándose con base de datos configurada
- [V] Variables `.env` configuradas: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- [V] Cloudinary configurado: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- [V] `npm install` ejecutado
- [V] `npx prisma migrate dev` (o `prisma db push`) aplicado
- [V] `npm run dev` en ejecución

---

## 0. Crear usuario admin

El admin se crea en la tabla `users` con `role = ADMIN`. Opciones:

### Opción A: Seed (recomendado)

```bash
npm run db:seed
```

- **Obligatorio**: define `ADMIN_EMAIL` y `ADMIN_PASSWORD` en `.env` (o en Vercel). El seed falla si no están definidas.

Si el email ya existe (p. ej. te registraste antes), el seed lo promueve a ADMIN y actualiza la contraseña.

### Opción B: Promover usuario existente en BD

En **Prisma Studio** (`npx prisma studio`):

1. Tabla `users` → localiza tu usuario por email
2. Campo `role` → cambiar de `USUARIO` (o BANDA, etc.) a `ADMIN`
3. Guardar

### Opción C: SQL directo

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'tu-email@ejemplo.com';
```

---

## 1. Autenticación y registro

### 1.1 Login

- [V] Ir a `/auth/login`
- [V] Introducir credenciales incorrectas → mensaje de error
- [V] Introducir credenciales correctas → redirección exitosa
- [V] Tras login, Header muestra estado de sesión
- [V] Botón/logout funciona y cierra sesión

### 1.2 Registro – Usuario básico

- [V] Ir a `/auth/registro`
- [V] Seleccionar rol "Usuario"
- [V] Completar email, contraseña, nombre, apellidos
- [V] Enviar → cuenta creada, redirección a login
- [V] Login con la nueva cuenta → acceso al dashboard

### 1.3 Registro – Banda

- [V] Ir a `/auth/registro`
- [V] Seleccionar rol "Banda"
- [V] Completar datos personales y entidad (nombre banda, localidad, etc.)
- [V] Añadir al menos un miembro (nombre + instrumento)
- [V] Opcional: subir logo, completar redes sociales
- [V] Enviar → cuenta creada
- [V] Login → en dashboard aparece "Mi banda"
- [V] Banda creada con `approved: false` (pendiente)

### 1.4 Registro – Sala

- [V] Ir a `/auth/registro` y registrar nueva cuenta
- [V] Seleccionar rol "Sala"
- [V] Completar nombre sala, ciudad, dirección, etc.
- [V] Enviar → cuenta y sala creadas
- [V] Sala creada con `approved: false`

### 1.5 Registro – Festival

- [V] Registrar con rol "Festival"
- [V] Completar nombre, localidad, descripción, redes
- [V] Verificar que se crea la entidad Festival pendiente

### 1.6 Registro – Organizador

- [V] Registrar con rol "Organizador"
- [V] Completar datos
- [V] Verificar que se crea entidad Organizer pendiente

### 1.7 Registro – Promotor

- [V] Registrar con rol "Promotor"
- [V] Completar datos
- [V] Verificar que se crea entidad Promoter pendiente

---

## 2. Panel de administración

**Requisito:** Usuario con rol ADMIN (crear manualmente en BD o mediante seed).

### 2.1 Acceso

- [V] Sin login, `/admin` → redirección a login
- [V] Con login no-admin → acceso denegado
- [V] Con login admin → acceso al panel admin

### 2.2 Bandas

- [V] `/admin/bandas` lista todas las bandas
- [V] Banda pendiente muestra estado "Pendiente" (rojo)
- [V] Botón "Aprobar" → banda pasa a "Aprobada" (verde)
- [V] Botón "Editar" → formulario de edición cargado correctamente
- [V] Editar nombre, bio, géneros, aprobación → guardar → cambios visibles
- [ ] Checkbox "Exento de límite 5 días" (si aplica)
- [V] Botón "Registrar banda" → formulario creación
- [V] Crear banda nueva como admin → se crea con `approved: true`
- [V] Botón "Borrar" → confirmación y eliminación correcta

### 2.3 Salas

- [V] `/admin/salas` lista todas las salas
- [V] Aprobar sala pendiente
- [V] Editar sala (nombre, ciudad, capacidad, redes, aprobación)
- [V] Crear sala nueva como admin
- [V] Borrar sala (comprobar restricciones si tiene eventos)

### 2.4 Eventos

- [V] `/admin/eventos` lista todos los eventos
- [V] Aprobar evento pendiente
- [V] Editar evento (título, fecha, sala, bandas, aprobación, exento límite)
- [V] Crear evento nuevo (seleccionar sala, bandas opcionales)
- [V] Borrar evento

### 2.5 Promotores

- [V] `/admin/promotores` lista promotores
- [V] Aprobar/desaprobar promotor pendiente
- [V] Ver datos del promotor

### 2.6 Organizadores

- [V] `/admin/organizadores` lista organizadores
- [V] Aprobar/desaprobar organizador pendiente

### 2.7 Festivales

- [V] `/admin/festivales` lista festivales
- [V] Aprobar/desaprobar festival pendiente

### 2.8 Usuarios

- [V] `/admin/usuarios` lista usuarios con sus entidades
- [V] Se ven bandas, salas, promotores, organizadores, festivales
- [V] Estado aprobado/pendiente visible por entidad

---

## 3. Dashboard usuario

### 3.1 Panel principal

- [V] `/dashboard` accesible solo con login
- [V] Muestra cards: Mi perfil, Mi banda (si BANDA), Mi sala (si SALA), Mis eventos, Admin (si ADMIN)
- [V] Diseño coherente con estética punk

### 3.2 Perfil

- [V] `/dashboard/perfil` muestra datos personales
- [V] Email visible (solo lectura)
- [V] Editar nombre y apellidos → guardar → cambios aplicados
- [V] Si tiene entidad: se muestra estado de aprobación (Aprobada / Pendiente)
- [V] Botón "Editar banda/sala" visible cuando corresponda

### 3.3 Mi banda

- [ ] `/dashboard/banda` accesible para rol BANDA
- [ ] Formulario con nombre, logo, biografía, localidad, año, géneros, redes
- [ ] Subir logo vía Cloudinary
- [ ] Editar miembros (añadir, quitar, cambiar orden)
- [ ] Guardar → cambios reflejados
- [ ] Galería: hasta 3 imágenes adicionales

### 3.4 Mi sala

- [ ] `/dashboard/sala` accesible para rol SALA
- [ ] Formulario con nombre, logo, ciudad, dirección, descripción, aforo, redes
- [ ] Subir logo
- [ ] Galería: hasta 3 imágenes
- [ ] Guardar → cambios aplicados

### 3.5 Mi festival / Mi organizador / Mi promotor

- [ ] Usuarios con estos roles ven enlace en perfil
- [ ] Pueden editar nombre, descripción, logo, redes
- [ ] Estado de aprobación visible

### 3.6 Mis eventos

- [ ] `/dashboard/eventos` accesible para SALA, FESTIVAL, ORGANIZADOR, PROMOTOR (con entidad aprobada)
- [ ] Si entidad no aprobada: mensaje explicativo
- [ ] Formulario crear evento: título, tipo, fecha, sala, bandas, precio, descripción
- [ ] SALA: solo puede elegir su propia sala
- [ ] Otros: eligen entre salas aprobadas
- [ ] Crear evento → queda pendiente de aprobación
- [ ] Listado de "Tus eventos" con estado Aprobado/Pendiente
- [ ] Límite 5 días: crear 2 eventos con fechas cercanas (< 5 días) → segundo rechazado con mensaje

---

## 4. Páginas públicas

### 4.1 Home

- [ ] `/` carga correctamente
- [ ] Hero, secciones, footer visibles
- [ ] Enlaces de navegación funcionan

### 4.2 Bandas

- [ ] `/bandas` lista bandas aprobadas
- [ ] No muestra bandas pendientes
- [ ] Click en banda → `/bandas/[slug]`
- [ ] Página de banda muestra: nombre, bio, géneros, localidad, miembros, imágenes, redes

### 4.3 Salas

- [ ] `/salas` lista salas aprobadas
- [ ] Click en sala → `/salas/[slug]`
- [ ] Datos completos: nombre, ciudad, dirección, aforo, imágenes, redes

### 4.4 Eventos

- [ ] `/eventos` lista eventos aprobados ordenados por fecha
- [ ] Click en evento → `/eventos/[slug]`
- [ ] Muestra título, fecha, sala, bandas, precio, descripción

### 4.5 Buscador

- [ ] `/buscar` permite buscar bandas
- [ ] Filtros por género funcionan

---

## 5. Subida de imágenes (Cloudinary)

### 5.1 Logo

- [ ] Subir logo en registro banda → se guarda
- [ ] Subir logo en Mi banda → se actualiza
- [ ] Subir logo en Mi sala → se actualiza
- [ ] Formato: JPG, PNG, WebP, GIF
- [ ] Tamaño máx. 5 MB

### 5.2 Galería (hasta 3 imágenes)

- [ ] En Mi banda: añadir hasta 3 imágenes
- [ ] En Mi sala: añadir hasta 3 imágenes
- [ ] Eliminar imagen y añadir otra
- [ ] Límite 3 respetado (no permite más)

---

## 6. Validaciones y límites

### 6.1 Límite eventos (5 días)

- [ ] Usuario validado crea evento fecha X
- [ ] Intentar crear otro evento en fecha X±5 días → error
- [ ] Crear evento en fecha X+6 días → éxito
- [ ] Admin marca evento como "Exento de límite" → usuario puede crear otro cercano

### 6.2 Roles y permisos

- [ ] USUARIO: no puede crear eventos
- [ ] BANDA: puede editar banda, no crear eventos
- [ ] SALA aprobada: puede crear eventos (solo en su sala)
- [ ] PROMOTOR aprobado: puede crear eventos (cualquier sala aprobada)
- [ ] FESTIVAL/ORGANIZADOR aprobados: pueden crear eventos

---

## 7. Build y despliegue

- [ ] `npm run build` sin errores
- [ ] No hay errores de TypeScript
- [ ] No hay errores de ESLint críticos

---

## Historial de tareas completadas

| Fecha / Fase | Tarea                                            | Estado |
| ------------ | ------------------------------------------------ | ------ |
| Fase 1       | Schema Prisma, roles, entidades                  | ✅     |
| Fase 2       | Cloudinary, API upload                           | ✅     |
| Fase 3       | Registro multi-rol                               | ✅     |
| Fase 4       | Admin CRUD bandas, salas, eventos                | ✅     |
| Fase 5       | Validados crear eventos, límite 5 días           | ✅     |
| Fase 6       | Dashboard usuario, perfil, Mi banda, Mi sala     | ✅     |
| Mejora 1     | Admin: promotores, organizadores, festivales     | ✅     |
| Mejora 2     | Dashboard: edición festival/organizador/promotor | ✅     |
| Mejora 3     | Banda: edición miembros                          | ✅     |
| Mejora 4     | Galería imágenes (3) Band/Sala                   | ✅     |
| Mejora 5     | Slug al cambiar nombre                           | ✅     |
| Mejora 6     | Dashboard: editar/borrar evento por creador      | ✅     |
| Mejora 7     | Cartel/imagen en crear/editar evento             | ✅     |
| Mejora 8     | Páginas públicas Festival, Promotor, Organizador | ✅     |
