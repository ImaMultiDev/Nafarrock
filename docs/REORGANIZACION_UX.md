# Reorganización UX y estructura — Nafarrock

Documentación de los cambios realizados en la fase de reorganización de producto.

---

## 1. Navbar público

**Antes:** Inicio, Bandas, Eventos, Festivales, Salas, Promotores, Organizadores, Buscar

**Ahora:** Inicio · Eventos · Entradas · Bandas · Salas · Escena · Entrar

- Eliminado "Buscar" del navbar (buscador global en Home)
- Eliminados "Promotores", "Organizadores", "Festivales" (agrupados en Escena)

---

## 2. Búsqueda

### Buscador global (Home)
- Barra de búsqueda en la página de inicio
- Redirige a `/buscar?search=...`
- Busca en: Bandas, Eventos, Salas, Festivales, Promotores, Organizadores

### Buscadores contextuales
| Sección | Filtros |
|---------|---------|
| Bandas | Género, localidad, emergentes |
| Eventos | Búsqueda, tipo (concierto/festival), fecha desde/hasta |
| Salas | Búsqueda, ciudad, aforo mín./máx. |
| Entradas | Próximos eventos (sin filtros adicionales por ahora) |
| Escena | Tipo: promotor, organizador, festival (cards de acceso) |

---

## 3. Sección Escena

- Ruta: `/escena`
- Agrupa: Promotores, Organizadores, Festivales
- Cards con enlaces a: `/promotores`, `/organizadores`, `/festivales`
- Colectivos: previsto para futuras ampliaciones

---

## 4. Página Entradas

- Ruta: `/entradas`
- Muestra próximos conciertos y festivales
- Secciones separadas: Festivales primero, luego Conciertos

---

## 5. Ficha de Banda

Botones añadidos:
- **Buscar promotores** → `/promotores`
- **Contactar organizadores** → `/organizadores`

---

## 6. Plan PRO

- Documentación: `docs/PLAN_PRO.md`
- Schema: `isPro`, `planType` en Promoter y Organizer
- **Estado:** Preparado, NO activo. Sin pagos.

---

## 7. Footer

Enlaces actualizados: Bandas, Eventos, Entradas, Salas, Escena

---

## Archivos principales modificados/creados

- `Header.tsx` — Navbar
- `FooterSection.tsx` — Enlaces
- `ExploreSection.tsx` — Cards EXPLORA
- `GlobalSearchSection.tsx` — Buscador en Home
- `entradas/page.tsx` — Página Entradas
- `escena/page.tsx` — Página Escena
- `bandas/page.tsx`, `eventos/page.tsx`, `salas/page.tsx` — Filtros contextuales
- `bandas/[slug]/page.tsx` — Botones promotores/organizadores
- `buscar/page.tsx` — Búsqueda global ampliada
- `BandasFilters.tsx`, `EventosFilters.tsx`, `SalasFilters.tsx` — Componentes filtro
- Services: búsqueda en eventos, venues, promoters, organizers, festivals
- `prisma/schema.prisma` — isPro, planType

---

*Última actualización: Febrero 2025*
