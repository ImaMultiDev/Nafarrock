# Nafarrock

**Guía del rock en Nafarroa** — plataforma de referencia del punk rock, rock urbano y escena alternativa nafarroa.

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 15 (App Router, TypeScript) |
| Base de datos | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth.js (email + OAuth preparado) |
| Imágenes | Cloudinary |
| Estilo | Tailwind CSS |
| Data fetching | Server Components + React Query |
| Deploy frontend | Vercel |
| Deploy DB | Railway / Supabase |

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

- **DATABASE_URL**: conexión PostgreSQL (Railway, Supabase, local)
- **NEXTAUTH_URL**: `http://localhost:3000` en desarrollo
- **NEXTAUTH_SECRET**: genera con `openssl rand -base64 32`
- **Cloudinary**: claves del dashboard Cloudinary

### 3. Base de datos

```bash
# Crear tablas
npm run db:push

# O migraciones
npm run db:migrate

# Seed con datos de ejemplo
npm run db:seed
```

### 4. Ejecutar

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Estructura del proyecto

```
src/
├── app/                    # App Router (páginas, layout, API)
│   ├── admin/              # Panel admin (requiere rol ADMIN)
│   ├── auth/               # Login, registro
│   ├── bandas/             # Listado y fichas de bandas
│   ├── buscar/             # Buscador avanzado
│   ├── dashboard/          # Panel usuario/banda/promotor
│   ├── eventos/            # Conciertos y festivales
│   └── salas/              # Venues y espacios
├── components/             # Componentes UI reutilizables
├── lib/                   # Prisma, Auth, utilidades
├── services/              # Lógica de negocio (dominio)
└── types/                 # Tipos TypeScript
```

## Roles y aprobación

| Rol | Descripción |
|-----|-------------|
| ADMIN | CRUD total, moderación, aprobar bandas y promotores |
| BANDA | Perfil editable, imágenes, enlaces (requiere aprobación) |
| PROMOTOR | Crear eventos (requiere aprobación) |
| USUARIO | Exploración, favoritos (fase futura) |

Las bandas y promotores nuevos pasan por aprobación manual (anti-spam).

## Roadmap (no implementado aún)

- Venta de entradas
- Pasarelas de pago
- Destacar bandas emergentes (badge, sección)
- Agenda personalizada
- Sistema de favoritos
- API pública
- i18n ES / EU / EN
- App móvil (API-first)

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Desarrollo |
| `npm run build` | Build producción |
| `npm run db:push` | Sincronizar schema con DB |
| `npm run db:migrate` | Crear migración |
| `npm run db:seed` | Ejecutar seed |
| `npm run db:studio` | Abrir Prisma Studio |

## Decisiones técnicas

1. **Server Components por defecto**: menos JS en cliente, mejor SEO.
2. **React Query** para datos que necesiten cache/client fetching.
3. **Prisma** con esquema normalizado, índices para búsquedas.
4. **NextAuth** con JWT (estadeless) para compatibilidad con serverless.
5. **Cloudinary** para imágenes (upload, transformaciones).
6. **Estética oscura** rock/punk: paleta `rock`, `void`, tipografía Orbitron/Inter.
