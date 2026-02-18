# Nafarrock – Guía de pruebas manuales

Guía paso a paso para comprobar que todo funciona correctamente. Marca cada casilla al completarla.

**Última actualización:** Editar/borrar evento por creador, Cartel en eventos, Páginas públicas Festival/Promotor/Organizador

---

## Requisitos previos

- [ ] PostgreSQL ejecutándose con base de datos configurada
- [ ] Variables `.env` configuradas: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- [ ] Cloudinary configurado: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- [ ] `npm install` ejecutado
- [ ] `npx prisma migrate dev` (o `prisma db push`) aplicado
- [ ] `npm run dev` en ejecución

---

## 1. Autenticación y registro

### 1.1 Login
- [ ] Ir a `/auth/login`
- [ ] Introducir credenciales incorrectas → mensaje de error
- [ ] Introducir credenciales correctas → redirección exitosa
- [ ] Tras login, Header muestra estado de sesión
- [ ] Botón/logout funciona y cierra sesión

### 1.2 Registro – Usuario básico
- [ ] Ir a `/auth/registro`
- [ ] Seleccionar rol "Usuario"
- [ ] Completar email, contraseña, nombre, apellidos
- [ ] Enviar → cuenta creada, redirección a login
- [ ] Login con la nueva cuenta → acceso al dashboard

### 1.3 Registro – Banda
- [ ] Ir a `/auth/registro`
- [ ] Seleccionar rol "Banda"
- [ ] Completar datos personales y entidad (nombre banda, localidad, etc.)
- [ ] Añadir al menos un miembro (nombre + instrumento)
- [ ] Opcional: subir logo, completar redes sociales
- [ ] Enviar → cuenta creada
- [ ] Login → en dashboard aparece "Mi banda"
- [ ] Banda creada con `approved: false` (pendiente)

### 1.4 Registro – Sala
- [ ] Ir a `/auth/registro` y registrar nueva cuenta
- [ ] Seleccionar rol "Sala"
- [ ] Completar nombre sala, ciudad, dirección, etc.
- [ ] Enviar → cuenta y sala creadas
- [ ] Sala creada con `approved: false`

### 1.5 Registro – Festival
- [ ] Registrar con rol "Festival"
- [ ] Completar nombre, localidad, descripción, redes
- [ ] Verificar que se crea la entidad Festival pendiente

### 1.6 Registro – Organizador
- [ ] Registrar con rol "Organizador"
- [ ] Completar datos
- [ ] Verificar que se crea entidad Organizer pendiente

### 1.7 Registro – Promotor
- [ ] Registrar con rol "Promotor"
- [ ] Completar datos
- [ ] Verificar que se crea entidad Promoter pendiente

---

## 2. Panel de administración

**Requisito:** Usuario con rol ADMIN (crear manualmente en BD o mediante seed).

### 2.1 Acceso
- [ ] Sin login, `/admin` → redirección a login
- [ ] Con login no-admin → acceso denegado
- [ ] Con login admin → acceso al panel admin

### 2.2 Bandas
- [ ] `/admin/bandas` lista todas las bandas
- [ ] Banda pendiente muestra estado "Pendiente" (rojo)
- [ ] Botón "Aprobar" → banda pasa a "Aprobada" (verde)
- [ ] Botón "Editar" → formulario de edición cargado correctamente
- [ ] Editar nombre, bio, géneros, aprobación → guardar → cambios visibles
- [ ] Checkbox "Exento de límite 5 días" (si aplica)
- [ ] Botón "Registrar banda" → formulario creación
- [ ] Crear banda nueva como admin → se crea con `approved: true`
- [ ] Botón "Borrar" → confirmación y eliminación correcta

### 2.3 Salas
- [ ] `/admin/salas` lista todas las salas
- [ ] Aprobar sala pendiente
- [ ] Editar sala (nombre, ciudad, capacidad, redes, aprobación)
- [ ] Crear sala nueva como admin
- [ ] Borrar sala (comprobar restricciones si tiene eventos)

### 2.4 Eventos
- [ ] `/admin/eventos` lista todos los eventos
- [ ] Aprobar evento pendiente
- [ ] Editar evento (título, fecha, sala, bandas, aprobación, exento límite)
- [ ] Crear evento nuevo (seleccionar sala, bandas opcionales)
- [ ] Borrar evento

### 2.5 Promotores
- [ ] `/admin/promotores` lista promotores
- [ ] Aprobar/desaprobar promotor pendiente
- [ ] Ver datos del promotor

### 2.6 Organizadores
- [ ] `/admin/organizadores` lista organizadores
- [ ] Aprobar/desaprobar organizador pendiente

### 2.7 Festivales
- [ ] `/admin/festivales` lista festivales
- [ ] Aprobar/desaprobar festival pendiente

### 2.8 Usuarios
- [ ] `/admin/usuarios` lista usuarios con sus entidades
- [ ] Se ven bandas, salas, promotores, organizadores, festivales
- [ ] Estado aprobado/pendiente visible por entidad

---

## 3. Dashboard usuario

### 3.1 Panel principal
- [ ] `/dashboard` accesible solo con login
- [ ] Muestra cards: Mi perfil, Mi banda (si BANDA), Mi sala (si SALA), Mis eventos, Admin (si ADMIN)
- [ ] Diseño coherente con estética punk

### 3.2 Perfil
- [ ] `/dashboard/perfil` muestra datos personales
- [ ] Email visible (solo lectura)
- [ ] Editar nombre y apellidos → guardar → cambios aplicados
- [ ] Si tiene entidad: se muestra estado de aprobación (Aprobada / Pendiente)
- [ ] Botón "Editar banda/sala" visible cuando corresponda

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

| Fecha / Fase | Tarea | Estado |
|--------------|-------|--------|
| Fase 1 | Schema Prisma, roles, entidades | ✅ |
| Fase 2 | Cloudinary, API upload | ✅ |
| Fase 3 | Registro multi-rol | ✅ |
| Fase 4 | Admin CRUD bandas, salas, eventos | ✅ |
| Fase 5 | Validados crear eventos, límite 5 días | ✅ |
| Fase 6 | Dashboard usuario, perfil, Mi banda, Mi sala | ✅ |
| Mejora 1 | Admin: promotores, organizadores, festivales | ✅ |
| Mejora 2 | Dashboard: edición festival/organizador/promotor | ✅ |
| Mejora 3 | Banda: edición miembros | ✅ |
| Mejora 4 | Galería imágenes (3) Band/Sala | ✅ |
| Mejora 5 | Slug al cambiar nombre | ✅ |
| Mejora 6 | Dashboard: editar/borrar evento por creador | ✅ |
| Mejora 7 | Cartel/imagen en crear/editar evento | ✅ |
| Mejora 8 | Páginas públicas Festival, Promotor, Organizador | ✅ |
