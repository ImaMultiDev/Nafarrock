# Plan técnico: Soporte bilingüe (Castellano / Euskera)

> **Estado:** Implementado (feb 2025). Solo web pública. Admin permanece en castellano.

## 1. Análisis del repositorio actual

### Stack detectado
| Elemento | Versión / Detalle |
|----------|-------------------|
| Next.js | 15.0.7 |
| Router | App Router (`src/app/`) |
| Estructura | `app/`, `components/`, `lib/`, `services/` |
| Base de datos | PostgreSQL + Prisma 5.22 |
| Autenticación | NextAuth v4 |
| Formateo fechas | date-fns con `locale: es` |

### Rutas actuales (sin prefijo de idioma)
- Públicas: `/`, `/bandas`, `/eventos`, `/escena`, `/guia`, `/contacto`, `/buscar`, `/entradas`
- Dinámicas: `/bandas/[slug]`, `/eventos/[slug]`, `/salas/[slug]`, `/festivales/[slug]`, etc.
- Auth: `/auth/login`, `/auth/registro`, etc.
- Dashboard: `/dashboard`, `/dashboard/proponer-banda`, etc.
- Admin: `/admin`, `/admin/bandas`, etc.

### Contenido dinámico en Prisma (campos traducibles)
| Modelo | Campos con texto |
|--------|------------------|
| Band | name, bio, genres, location |
| Venue | name, description, city, address |
| Event | title, description |
| Festival | name, description, location |
| Asociacion | name, description, location |
| Organizer | name, description |
| Promoter | name, description |
| Announcement | title, description, zone, genres, cacheInfo, equipmentInfo, technicalInfo, extraInfo |

### Observaciones
- `next.config.ts` ya incluye comentario: *"i18n preparado para ES / EU / EN (fase futura)"*
- No existe implementación i18n actual
- `date-fns` se usa con `es` hardcodeado en varios archivos
- `lang="es"` fijo en `layout.tsx`

---

## 2. Solución recomendada: next-intl

### Por qué next-intl
- **Nativo para App Router**: soporte directo de Server Components
- **Bundle pequeño**: ~2KB vs ~8KB de react-i18next
- **TypeScript**: tipado fuerte de claves de traducción
- **Formato ICU**: plurals, fechas, números, rich text
- **Mantenido**: estándar de facto para Next.js 14/15

### Alternativas descartadas
| Alternativa | Motivo |
|-------------|--------|
| next-i18next | Pensado para Pages Router, bundle grande |
| next-translate | Menos maduro para App Router |
| react-intl | Sin integración nativa con App Router |

---

## 3. Estrategia de rutas (sin romper URLs existentes)

### Opción A: Prefijo solo para idioma no por defecto (recomendada)
- **Castellano (es)**: rutas sin prefijo → `/bandas`, `/eventos`, `/dashboard`
- **Euskera (eu)**: prefijo `/eu` → `/eu/bandas`, `/eu/eventos`, `/eu/dashboard`

**Ventajas:**
- Las URLs actuales siguen funcionando (castellano por defecto)
- SEO correcto: `hreflang` para `/` y `/eu/`
- Enlaces compartidos en castellano no cambian

**Middleware:** detecta locale por cookie → si `eu`, redirige `/bandas` a `/eu/bandas`; si `es`, `/bandas` permanece.

### Opción B: Cookie sin cambio de URL
- Todas las rutas igual: `/bandas`, `/eventos`
- Locale en cookie; el contenido se renderiza según cookie

**Ventajas:** cero cambios de URL  
**Desventajas:** peor SEO (misma URL, contenido distinto según usuario)

### Recomendación
**Opción A** para cumplir restricciones y mantener profesionalidad: rutas actuales intactas para castellano, euskera con prefijo `/eu`.

---

## 4. Arquitectura propuesta

### Estructura de archivos
```
src/
├── i18n/
│   ├── config.ts          # locales, defaultLocale
│   ├── request.ts         # getRequestConfig (cookie + headers)
│   └── routing.ts        # routing config para next-intl
├── messages/
│   ├── es.json            # castellano
│   └── eu.json            # euskera
├── app/
│   ├── [locale]/          # ← envolver rutas existentes
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── bandas/
│   │   ├── eventos/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   └── admin/
│   └── layout.tsx         # root minimal (html, body)
├── middleware.ts          # detección locale, redirects
└── ...
```

### Flujo de locale
1. **Middleware**: lee cookie `NEXT_LOCALE` o `Accept-Language` → decide `es` o `eu`
2. **request.ts**: carga mensajes según locale y los pasa a `NextIntlClientProvider`
3. **Componentes**: `useTranslations('Namespace')` (client) o `getTranslations('Namespace')` (server)

---

## 5. Traducción de la interfaz (UI)

### Organización de namespaces en JSON
```json
// messages/es.json
{
  "common": {
    "nav": {
      "home": "Inicio",
      "events": "Eventos",
      "bands": "Bandas",
      "scene": "Escena",
      "guide": "Guía",
      "contact": "Contacto",
      "panel": "Panel",
      "logout": "Salir"
    },
    "actions": { "back": "Volver", "save": "Guardar", ... }
  },
  "home": { ... },
  "bands": { "list": "...", "detail": { ... } },
  "events": { ... },
  "auth": { "login": { ... }, "register": { ... } },
  "dashboard": { ... },
  "admin": { ... }
}
```

### Uso en componentes
```tsx
// Server Component
import { getTranslations } from 'next-intl/server';
const t = await getTranslations('common.nav');
return <Link href="/eventos">{t('events')}</Link>;

// Client Component
import { useTranslations } from 'next-intl';
const t = useTranslations('common.nav');
return <span>{t('events')}</span>;
```

### Alcance de la migración
- **Header**: navLinks, botones Panel/Salir, Guía/Manual
- **Footer**: enlaces, textos
- **Páginas**: títulos, descripciones, labels, mensajes vacíos
- **Formularios**: labels, placeholders, errores
- **Admin**: títulos, columnas, acciones

**Restricción respetada:** no se modifican clases CSS; solo se sustituyen cadenas de texto por `t('key')`.

---

## 6. Contenido dinámico en base de datos

### Estrategia: columnas de traducción opcionales

Para no romper el esquema actual y permitir migración gradual:

#### Fase 1 (MVP bilingüe)
Añadir columnas `*_eu` solo donde haga falta:

```prisma
model Band {
  // existentes
  name        String
  bio         String?  @db.Text
  // nuevas (opcionales)
  nameEu      String?
  bioEu       String?  @db.Text
  // ...
}

model Event {
  title       String
  description String?  @db.Text
  titleEu     String?
  descriptionEu String? @db.Text
  // ...
}
```

**Lógica de resolución:**
```ts
function getLocalizedField<T>(obj: { [k: string]: T }, field: string, locale: string): T {
  if (locale === 'eu' && obj[`${field}Eu`]) return obj[`${field}Eu`];
  return obj[field];
}
```

#### Fase 2 (escalable)
Si se añaden más idiomas, migrar a modelo de traducciones:

```prisma
model BandTranslation {
  id       String @id @default(cuid())
  bandId   String
  locale   String   // 'es' | 'eu'
  name     String?
  bio      String?  @db.Text
  band     Band     @relation(...)
  @@unique([bandId, locale])
}
```

Para MVP, columnas `*_eu` son suficientes y evitan joins.

### Modelos a extender (prioridad)
1. **Band**: nameEu, bioEu
2. **Event**: titleEu, descriptionEu
3. **Venue**: nameEu, descriptionEu, cityEu
4. **Festival**: nameEu, descriptionEu, locationEu
5. **Announcement**: titleEu, descriptionEu, zoneEu (y campos extra si se desea)

Los nombres propios (bandas, salas) pueden mantenerse en un solo idioma si es marca; la descripción y textos largos sí traducirse.

---

## 7. Selector de idioma en navbar

### Ubicación
En el Header, junto a los iconos de redes sociales o antes de los botones de auth.

### Diseño (sin cambiar clases)
- Dropdown o dos enlaces: `ES` | `EU`
- Misma familia de clases que el resto del nav (`font-punch`, `uppercase`, etc.)
- Estado activo: idioma actual resaltado (ej. `text-punk-green`)

### Comportamiento
- Al cambiar: establecer cookie `NEXT_LOCALE` y navegar a la ruta equivalente en el nuevo idioma
- Ejemplo: en `/eventos` → click `EU` → cookie `eu` → redirect a `/eu/eventos`

### Implementación
```tsx
// components/ui/LanguageSwitcher.tsx (client)
'use client';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing'; // Link/useRouter con locale

function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const setLocale = (newLocale: 'es' | 'eu') => {
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex gap-2">
      <button onClick={() => setLocale('es')} className={locale === 'es' ? 'text-punk-green' : ''}>ES</button>
      <button onClick={() => setLocale('eu')} className={locale === 'eu' ? 'text-punk-green' : ''}>EU</button>
    </div>
  );
}
```

---

## 8. Persistencia del idioma

### Cookie `NEXT_LOCALE`
- **Nombre:** `NEXT_LOCALE`
- **Valores:** `es` | `eu`
- **Duración:** 1 año (`max-age=31536000`)
- **Path:** `/`

### Orden de resolución (en middleware / request.ts)
1. Cookie `NEXT_LOCALE`
2. Header `Accept-Language` (si no hay cookie)
3. Default: `es`

### Integración con next-intl
En `i18n/request.ts`:
```ts
import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value 
    ?? requestLocale 
    ?? 'es';
  
  return {
    locale: ['es', 'eu'].includes(locale) ? locale : 'es',
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

El middleware de next-intl leerá la cookie y establecerá `requestLocale` para el routing.

---

## 9. Formateo de fechas y números

### date-fns por locale
Sustituir `es` hardcodeado por el locale activo:

```ts
// lib/date-locale.ts
import { es, eu } from 'date-fns/locale';

export const dateLocales = { es, eu } as const;
export function getDateLocale(locale: string) {
  return dateLocales[locale as keyof typeof dateLocales] ?? es;
}
```

Uso en páginas:
```ts
import { getDateLocale } from '@/lib/date-locale';
import { getLocale } from 'next-intl/server';

const locale = await getLocale();
format(date, "d MMM yyyy", { locale: getDateLocale(locale) });
```

### Archivos a actualizar (date-fns)
- `src/app/eventos/[slug]/page.tsx`
- `src/app/salas/[slug]/page.tsx`
- `src/app/bandas/[slug]/page.tsx` (si aplica)
- `src/app/promotores/[slug]/page.tsx`
- `src/app/asociaciones/[slug]/page.tsx`
- `src/app/festivales/[slug]/page.tsx`
- `src/app/dashboard/eventos/page.tsx`
- `src/app/bolos/[id]/AnnouncementDetail.tsx`
- `src/app/admin/eventos/page.tsx`
- `src/app/admin/bolos/page.tsx`
- `src/app/admin/bolos/[id]/page.tsx`

---

## 10. Rutas excluidas de i18n (opcional)

Algunas rutas pueden mantenerse sin locale:
- `/api/*` (APIs)
- `/_next/*`, `/favicon.ico`, etc.
- Posiblemente `/admin` si se decide administrar solo en castellano

El middleware de next-intl permite excluir pathnames.

---

## 11. Plan de implementación por fases

### Fase 1: Infraestructura (1–2 días)
1. Instalar `next-intl`
2. Crear `i18n/config.ts`, `i18n/request.ts`, `i18n/routing.ts`
3. Crear `messages/es.json` y `messages/eu.json` (estructura base)
4. Configurar plugin en `next.config.ts`
5. Crear `middleware.ts` con detección de locale y cookie
6. Mover `app/*` a `app/[locale]/*` (o equivalente según setup next-intl)
7. Añadir `NextIntlClientProvider` en layout
8. Actualizar `Link` y `useRouter` para usar los de next-intl (locale-aware)

### Fase 2: Selector y persistencia (0.5 días)
1. Crear `LanguageSwitcher` en Header
2. Verificar cookie y redirect al cambiar idioma
3. Probar persistencia entre sesiones

### Fase 3: UI – componentes globales (1–2 días)
1. Header: nav, botones, Guía
2. Footer: enlaces, textos
3. Componentes compartidos (PageLayout, botones, etc.)

### Fase 4: UI – páginas principales (2–3 días)
1. Home (HeroSection, ExploreSection, ManifestoSection, etc.)
2. Bandas (listado, detalle)
3. Eventos (listado, detalle)
4. Escena, Guía, Contacto
5. Auth (login, registro)

### Fase 5: UI – dashboard y admin (1–2 días)
1. Dashboard
2. Admin (listados, formularios)

### Fase 6: Contenido dinámico en BD (2–3 días)
1. Migración Prisma: añadir columnas `*_eu` a Band, Event, Venue, Festival
2. Servicios: función `getLocalizedField` o helper por modelo
3. Formularios admin: campos opcionales para traducción euskera
4. Páginas públicas: mostrar `bioEu`/`titleEu` cuando locale sea `eu`

### Fase 7: Fechas y pulido (0.5 días)
1. Centralizar `getDateLocale(locale)` 
2. Sustituir `es` por locale dinámico en todos los usos de date-fns
3. Revisar metadata (title, description) por locale

---

## 12. Compatibilidad y restricciones

### Restricciones respetadas
- **Sin cambios de diseño/CSS**: solo sustitución de texto por `t('key')`
- **Rutas existentes**: castellano sigue en `/bandas`, `/eventos`, etc.
- **Compatibilidad**: auth, Prisma, NextAuth sin cambios estructurales

### Consideraciones
- **Slugs**: se mantienen igual en ambos idiomas (ej. `/bandas/berri-txarrak`)
- **Metadata**: `generateMetadata` debe recibir `locale` y devolver title/description traducidos
- **Enlaces internos**: usar `Link` de next-intl para que incluyan el prefijo `/eu` cuando aplique

---

## 13. Resumen de dependencias

```json
{
  "dependencies": {
    "next-intl": "^3.x"
  }
}
```

No se requieren dependencias adicionales para el MVP bilingüe.

---

## 14. Checklist pre-implementación

- [ ] Confirmar estrategia de rutas (A: prefijo /eu vs B: solo cookie)
- [ ] Definir si admin se traduce o permanece en castellano
- [ ] Priorizar modelos BD para traducción (Band, Event, Venue primero)
- [ ] Asignar responsable de traducciones al euskera (o servicio externo)
