# Nafarrock

<p align="center">
  <strong>Guía del rock en Nafarroa</strong>
</p>

<p align="center">
  Plataforma de referencia de la escena punk rock, rock urbano y alternativa en Navarra y Euskadi.
</p>

<p align="center">
  <a href="#características">Características</a> •
  <a href="#stack-tecnológico">Stack</a> •
  <a href="#instalación">Instalación</a> •
  <a href="#estructura">Estructura</a> •
  <a href="#documentación">Documentación</a>
</p>

---

## Descripción

**Nafarrock** es una aplicación web completa para descubrir, gestionar y promocionar la escena musical alternativa de Navarra y el País Vasco. Conecta bandas, salas, promotores, organizadores y festivales en un único hub con registro por roles, aprobación de contenidos, panel de administración y soporte bilingüe (español / euskera).

---

## Características

### 🌐 Experiencia pública

| Sección | Descripción |
|--------|-------------|
| **Inicio** | Portada con hero, buscador global y secciones destacadas |
| **Bandas** | Listado paginado con filtros (género, localidad, emergentes), fichas con biografía, miembros, enlaces (Spotify, Bandcamp, redes) |
| **Eventos** | Agenda de conciertos paginada con filtros por fecha y tipo |
| **Entradas** | Eventos con enlace directo a venta de entradas |
| **Salas** | Espacios y venues con descripción, mapa y galería |
| **Escena** | Hub de promotores, organizadores y festivales con enlaces a sus listados |
| **Bolos** | Anuncios de búsqueda de músicos (bolos) con sistema de solicitudes |
| **Buscar** | Búsqueda global en bandas, eventos, salas, festivales, promotores y organizadores |

### 🌍 Internacionalización

- **Español** y **Euskera** con `next-intl`
- Rutas localizadas (`/es/bandas`, `/eu/bandas`)
- Traducción asistida por IA para biografías en euskera

### 🔐 Autenticación y roles

- Login por email/contraseña
- Registro con múltiples roles
- Verificación de email (Resend)
- Sesiones con NextAuth.js

| Rol | Acceso |
|-----|--------|
| **USUARIO** | Perfil personal |
| **BANDA** | Mi banda (editar perfil, logo, galería, miembros, géneros, enlaces) |
| **SALA** | Mi sala + crear eventos en su espacio |
| **PROMOTOR** | Mi promotor + crear eventos |
| **ORGANIZADOR** | Mi organizador + crear eventos |
| **FESTIVAL** | Mi festival + crear eventos |
| **ADMIN** | Panel de administración completo |

### 📋 Creación de eventos

- Salas, promotores, organizadores y festivales pueden crear eventos
- Selección de sala, bandas, precio, URL de entradas, cartel
- Límite anti-spam: 1 evento cada 5 días por creador
- Aprobación manual antes de publicar

### ⚙️ Panel de administración

| Módulo | Funcionalidades |
|--------|-----------------|
| **Bandas** | Listar, aprobar, crear, editar, importar CSV, descubrir (Spotify/MusicBrainz) |
| **Salas** | Listar, aprobar, crear, editar |
| **Eventos** | Listar, aprobar, crear, editar, descubrir (Ticketmaster) |
| **Promotores / Organizadores / Festivales** | Listar y aprobar |
| **Asociaciones** | Listar y aprobar |
| **Usuarios** | Ver usuarios, roles y entidades pendientes |
| **Bolos** | Gestionar anuncios y solicitudes |
| **Reclamaciones** | Perfiles reclamados por bandas |
| **Solicitudes** | Acceso a la escena pendiente |

### 🤖 Integraciones y automatización

| Integración | Uso |
|-------------|-----|
| **Spotify** | Autofill de bandas (nombre, imagen, enlaces) |
| **MusicBrainz** | Búsqueda de artistas para autofill |
| **Ticketmaster Discovery API** | Descubrir eventos en Navarra y Euskadi |
| **Cloudinary** | Subida de imágenes (logos, galerías, carteles) |
| **Resend** | Verificación de email |
| **OpenAI** | Traducción de biografías al euskera |

### 📄 Otros

- Paginación en todos los listados
- Reclamación de perfiles de banda por usuarios
- Manuales de uso por perfil en `docs/manuales/`

---

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| **Framework** | Next.js 15 (App Router, TypeScript) |
| **Base de datos** | PostgreSQL |
| **ORM** | Prisma |
| **Auth** | NextAuth.js (Credentials + OAuth preparado) |
| **i18n** | next-intl |
| **Imágenes** | Cloudinary |
| **Email** | Resend |
| **Estilo** | Tailwind CSS |
| **Animaciones** | Framer Motion |
| **Validación** | Zod |
| **Tests** | Vitest, Playwright |

---

## Instalación

### 1. Dependencias

```bash
cd apps/nafarrock
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
| `ADMIN_EMAIL` | Email del admin (obligatorio para seed) |
| `ADMIN_PASSWORD` | Contraseña del admin (obligatorio para seed) |
| `RESEND_API_KEY` | Verificación de email |
| `CLOUDINARY_*` | Cloud, upload preset, API key/secret |
| `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` | Autofill de bandas |
| `TICKETMASTER_API_KEY` | Descubrir eventos |
| `OPENAI_API_KEY` | Traducción al euskera |

### 3. Base de datos

```bash
npm run db:push
npm run db:seed
```

### 4. Ejecutar

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## Despliegue en Vercel

El build ejecuta el seed automáticamente. Si cambias `ADMIN_EMAIL` o `ADMIN_PASSWORD` en Vercel:

1. Haz un nuevo deploy (push o redeploy manual).
2. El seed actualizará el admin en la base de datos.
3. Inicia sesión con las nuevas credenciales.

---

## Estructura del proyecto

```
src/
├── app/
│   ├── [locale]/           # Rutas públicas (es/eu)
│   │   ├── bandas/        # Listado y fichas
│   │   ├── eventos/       # Agenda
│   │   ├── entradas/      # Eventos con venta
│   │   ├── salas/         # Venues
│   │   ├── escena/        # Promotores, organizadores, festivales
│   │   ├── bolos/         # Anuncios de músicos
│   │   ├── buscar/        # Buscador global
│   │   └── auth/          # Login, registro, verificación
│   ├── admin/             # Panel administración
│   │   ├── bandas/        # CRUD, descubrir, importar
│   │   ├── eventos/       # CRUD, descubrir
│   │   ├── salas/         # CRUD
│   │   └── ...
│   ├── dashboard/         # Panel por rol (banda, sala, promotor...)
│   └── api/               # Rutas API
├── components/            # UI reutilizables
├── lib/                   # Prisma, Auth, Ticketmaster, etc.
├── services/              # Lógica de negocio
└── i18n/                  # Configuración next-intl

docs/
└── manuales/              # Manuales por perfil
```

---

## Scripts

| Comando | Descripción |
|--------|-------------|
| `npm run dev` | Desarrollo |
| `npm run build` | Build producción |
| `npm run start` | Servidor producción |
| `npm run db:push` | Sincronizar schema con DB |
| `npm run db:migrate` | Crear migración |
| `npm run db:seed` | Ejecutar seed |
| `npm run db:studio` | Prisma Studio |
| `npm run lint` | ESLint |
| `npm run test` | Tests unitarios (Vitest) |
| `npm run test:e2e` | Tests E2E (Playwright) |

---

## Documentación

| Documento | Descripción |
|-----------|-------------|
| `docs/manuales/MANUAL_USUARIO.md` | Usuario básico |
| `docs/manuales/MANUAL_BANDA.md` | Perfil banda |
| `docs/manuales/MANUAL_SALA.md` | Perfil sala |
| `docs/manuales/MANUAL_PROMOTOR.md` | Perfil promotor |
| `docs/manuales/MANUAL_ORGANIZADOR.md` | Perfil organizador |
| `docs/manuales/MANUAL_FESTIVAL.md` | Perfil festival |
| `docs/manuales/MANUAL_ADMIN.md` | Panel administración |

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

---

## Licencia

Proyecto privado — Nafarrock.
