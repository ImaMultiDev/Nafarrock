# Nafarrock

**Guía del rock en Nafarroa** — plataforma de referencia de la escena punk rock, rock urbano y alternativa nafarroa.

Una aplicación web completa para descubrir bandas, conciertos, salas, festivales, promotores y organizadores. Con registro por roles, aprobación de contenidos, panel de administración y manuales de uso por perfil.

---

## Características implementadas

### Público (sin login)
- **Inicio** — Portada con secciones destacadas y acceso rápido
- **Bandas** — Listado paginado con filtros (género, localidad, emergentes), fichas con biografía, miembros, enlaces (Spotify, Bandcamp, redes)
- **Eventos** — Agenda de conciertos paginada, filtros por fecha/tipo
- **Entradas** — Eventos con enlace a venta de entradas
- **Salas** — Espacios y venues con descripción, mapa, galería
- **Escena** — Promotores, organizadores y festivales con enlaces a sus listados
- **Buscar** — Búsqueda global en bandas, eventos, salas, festivales, promotores y organizadores

### Autenticación
- Login por email/contraseña
- Registro con múltiples roles (Usuario, Banda, Sala, Festival, Organizador, Promotor)
- Verificación de email (Resend)
- Sesiones con NextAuth

### Dashboards por rol
| Rol | Acceso |
|-----|--------|
| **USUARIO** | Perfil personal |
| **BANDA** | Mi banda (editar perfil, logo, galería, miembros, géneros, enlaces) |
| **SALA** | Mi sala (editar perfil, logo, galería) + Mis eventos |
| **PROMOTOR** | Mi promotor (editar perfil) + Mis eventos |
| **ORGANIZADOR** | Mi organizador (editar perfil) + Mis eventos |
| **FESTIVAL** | Mi festival (editar perfil) + Mis eventos |
| **ADMIN** | Panel de administración completo |

### Creación de eventos
- Salas, promotores, organizadores y festivales pueden crear eventos
- Selección de sala, bandas (opcional), precio, URL de entradas, cartel
- Límite: 1 evento cada 5 días por creador (anti-spam)
- Los eventos quedan pendientes hasta aprobación del admin

### Administración
- **Bandas** — Listar, aprobar, crear, editar
- **Salas** — Listar, aprobar, crear, editar
- **Eventos** — Listar, aprobar, crear, editar
- **Promotores / Organizadores / Festivales** — Listar y aprobar
- **Usuarios** — Ver usuarios, roles y entidades pendientes

### Otros
- **Paginación** en listados (Bandas, Eventos, Salas, Entradas, Escena)
- **Subida de imágenes** a Cloudinary (logos, galerías, carteles)
- **Manuales de uso** por perfil en `docs/manuales/`

---

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 15 (App Router, TypeScript) |
| Base de datos | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth.js (Credentials + OAuth preparado) |
| Imágenes | Cloudinary |
| Email | Resend |
| Estilo | Tailwind CSS |
| Animaciones | Framer Motion |
| Validación | Zod |

---

## Instalación

### 1. Dependencias

```bash
cd apps/nafarrock   # o la ruta de tu proyecto
npm install
```

### 2. Variables de entorno

Copia `.env.example` a `.env` y completa:

```bash
cp .env.example .env
```

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Conexión PostgreSQL (Railway, Supabase, local) |
| `NEXTAUTH_URL` | `http://localhost:3000` en desarrollo |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `ADMIN_EMAIL` | **Obligatorio para seed** — email del admin |
| `ADMIN_PASSWORD` | **Obligatorio para seed** — contraseña del admin |
| `RESEND_API_KEY` | Para verificación de email |
| `CLOUDINARY_*` | Cloud, upload preset, API key/secret |

### 3. Base de datos

```bash
# Crear tablas
npm run db:push

# O migraciones
npm run db:migrate

# Seed con datos de ejemplo (si existe)
npm run db:seed
```

### 4. Ejecutar

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## Despliegue en Vercel

El build ejecuta el seed automáticamente. **Si cambias `ADMIN_EMAIL` o `ADMIN_PASSWORD` en Vercel:**

1. Haz un nuevo deploy (push o redeploy manual).
2. El seed actualizará el admin en la base de datos con las nuevas credenciales.
3. Inicia sesión con el **nuevo** email y contraseña.

> **Importante:** Las credenciales viven en la base de datos. Cambiar solo las variables de entorno no actualiza la BD hasta que se ejecute el seed (en cada build).

---

## Estructura del proyecto

```
src/
├── app/
│   ├── admin/              # Panel admin (Bandas, Salas, Eventos, Promotores, Organizadores, Festivales, Usuarios)
│   ├── api/                # Rutas API (auth, upload, dashboard, admin)
│   ├── auth/               # Login, registro, verificación email
│   ├── bandas/             # Listado y fichas de bandas
│   ├── buscar/             # Buscador global
│   ├── dashboard/          # Panel usuario (banda, sala, promotor, organizador, festival, eventos)
│   ├── entradas/           # Eventos con venta de entradas
│   ├── escena/             # Hub promotores / organizadores / festivales
│   ├── eventos/            # Agenda de conciertos
│   ├── festivales/         # Listado y fichas de festivales
│   ├── organizadores/      # Listado y fichas de organizadores
│   ├── promotores/         # Listado y fichas de promotores
│   └── salas/              # Venues y espacios
├── components/             # UI reutilizables (Header, Pagination, ImageUpload, etc.)
├── lib/                    # Prisma, Auth, validaciones
├── services/               # Lógica de negocio (band, event, venue, etc.)
└── types/                  # Tipos TypeScript

docs/
├── manuales/               # Manuales por perfil (Usuario, Banda, Sala, Promotor, etc.)
└── ...
```

---

## Documentación

| Documento | Descripción |
|-----------|-------------|
| `docs/manuales/MANUAL_USUARIO.md` | Qué puede hacer un usuario básico |
| `docs/manuales/MANUAL_BANDA.md` | Perfil banda, aprobación, limitaciones |
| `docs/manuales/MANUAL_SALA.md` | Perfil sala y creación de eventos |
| `docs/manuales/MANUAL_PROMOTOR.md` | Perfil promotor y eventos |
| `docs/manuales/MANUAL_ORGANIZADOR.md` | Perfil organizador y eventos |
| `docs/manuales/MANUAL_FESTIVAL.md` | Perfil festival y eventos |
| `docs/manuales/MANUAL_ADMIN.md` | Panel de administración |

---

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Desarrollo |
| `npm run build` | Build producción |
| `npm run start` | Servidor producción |
| `npm run db:push` | Sincronizar schema con DB |
| `npm run db:migrate` | Crear migración |
| `npm run db:seed` | Ejecutar seed |
| `npm run db:studio` | Abrir Prisma Studio |
| `npm run lint` | ESLint |
| `npm run test` | Tests unitarios (Vitest) |
| `npm run test:e2e` | Tests E2E (Playwright) |

---

## Roles y aprobación

| Rol | Requiere aprobación | Puede crear eventos |
|-----|---------------------|---------------------|
| USUARIO | — | No |
| BANDA | Sí (perfil) | No |
| SALA | Sí (perfil) | Sí (solo en su sala) |
| PROMOTOR | Sí (perfil) | Sí |
| ORGANIZADOR | Sí (perfil) | Sí |
| FESTIVAL | Sí (perfil) | Sí |
| ADMIN | — | Sí (y aprobar todo) |

Las entidades nuevas pasan por aprobación manual. Los eventos creados por salas/promotores/organizadores/festivales también requieren aprobación antes de aparecer en la agenda pública.

---

## Roadmap (próximas fases)

- Pasarelas de pago y Plan PRO
- Destacar bandas emergentes (badge, sección)
- Agenda personalizada y favoritos
- API pública
- i18n ES / EU / EN

---

## Licencia

Proyecto privado — Nafarrock.
