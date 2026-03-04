# Plan técnico: Asistencia de traducción IA en el panel admin

## Objetivo

Añadir un botón "Generar traducción en Euskera" junto a los campos descriptivos largos en los formularios del admin. Al pulsarlo, se traduce el texto en castellano a euskera batua mediante IA y se rellena el campo EU. El administrador puede editar antes de guardar.

---

## 1. Análisis del estado actual

### Schema Prisma (campos a añadir)

| Modelo   | Campo ES      | Campo EU a añadir |
|----------|---------------|-------------------|
| Band     | bio           | bioEu             |
| Event    | description   | descriptionEu     |
| Venue    | description   | descriptionEu     |
| Festival | description   | descriptionEu     |

**Estado:** Los campos `*Eu` no existen aún en el schema. Hay que añadirlos.

### Formularios afectados

| Formulario        | Ubicación                          | Campo ES     | Campo EU a añadir |
|-------------------|------------------------------------|--------------|-------------------|
| BandEditForm      | admin/bandas/[id]/editar           | bio          | bioEu             |
| BandForm          | admin/bandas/nueva                 | bio          | bioEu             |
| EventEditForm     | admin/eventos/[id]/editar          | description  | descriptionEu     |
| EventForm         | admin/eventos/nuevo                | description  | descriptionEu     |
| VenueEditForm     | admin/salas/[id]/editar            | description  | descriptionEu     |
| VenueForm         | admin/salas/nueva                  | description  | descriptionEu     |
| FestivalForm      | admin/festivales/nueva             | description  | descriptionEu     |

**Nota:** No existe formulario de edición de festivales (solo listado y aprobación). Solo FestivalForm (crear).

### APIs PATCH/POST a actualizar

- `PATCH /api/admin/bands/[id]` – aceptar bioEu
- `POST /api/admin/bands` – aceptar bioEu
- `PATCH /api/admin/events/[id]` – aceptar descriptionEu
- `POST /api/admin/events` – aceptar descriptionEu
- `PATCH /api/admin/venues/[id]` – aceptar descriptionEu
- `POST /api/admin/venues` – aceptar descriptionEu
- `POST /api/admin/festivals` – aceptar descriptionEu

---

## 2. Enfoque técnico recomendado

### Opción A: API Route (recomendada)

**Ruta:** `POST /api/admin/translate`

**Ventajas:**
- Lógica separada y fácil de testear
- Protección con `requireAdmin()`
- Rate limiting sencillo si se necesita
- Uso estándar de variables de entorno para la API key

**Flujo:**
1. El formulario envía `{ text: string }` al endpoint
2. El endpoint valida sesión admin, llama a OpenAI y devuelve `{ translated: string }`
3. El cliente recibe la traducción y actualiza el textarea EU

### Opción B: Server Action

**Ventajas:** Menos archivos, llamada directa desde el formulario  
**Desventajas:** Mezcla de lógica de IA con la acción, más difícil de aislar y testear

### Recomendación

Usar **API Route** (`POST /api/admin/translate`) por claridad, seguridad y mantenibilidad.

---

## 3. Proveedor de IA

### OpenAI (recomendado)

- API estable y documentada
- Buen soporte para euskera
- Variable de entorno: `OPENAI_API_KEY`

**Modelo sugerido:** `gpt-4o-mini` (buen equilibrio coste/calidad) o `gpt-4o` si se prioriza calidad.

**Prompt base:**
```
Traduce el siguiente texto del castellano al euskera batua (euskara estándar).
- Mantén los nombres propios sin traducir (bandas, lugares, personas).
- Usa un tono natural para textos culturales o musicales.
- No cambies formato ni estructura (párrafos, listas).
- Devuelve solo la traducción, sin explicaciones.
```

### Alternativas

- **Anthropic Claude** – `ANTHROPIC_API_KEY`
- **Google Gemini** – `GOOGLE_AI_API_KEY`

La implementación se puede abstraer con un helper que acepte el proveedor y el modelo.

---

## 4. Componente reutilizable: TranslateButton

**Ubicación:** `src/components/admin/TranslateButton.tsx`

**Props:**
- `sourceText: string` – texto en castellano
- `onTranslated: (text: string) => void` – callback al recibir la traducción
- `disabled?: boolean` – si el campo fuente está vacío o no hay API key
- `loading?: boolean` – estado de carga

**Comportamiento:**
- Botón: "Generar traducción en Euskera"
- Al hacer clic: llama a `POST /api/admin/translate` con `{ text: sourceText }`
- En éxito: llama a `onTranslated(translated)` para que el formulario actualice el campo EU
- En error: muestra mensaje (p. ej. toast o texto debajo del botón)

**Estilos:** Usar las mismas clases que el resto del admin (p. ej. `border-2 border-punk-white/30`, `font-punch`, etc.).

---

## 5. Integración en formularios

### Cambios necesarios por formulario

1. **Campo EU:** Añadir textarea debajo del campo ES con `label`: "Biografía (EU)" / "Descripción (EU)".
2. **Estado controlado:** El campo EU debe ser controlado (`useState`) para poder actualizarlo al recibir la traducción.
3. **Botón:** Colocar `<TranslateButton sourceText={sourceValue} onTranslated={setTargetValue} />` junto al campo EU.
4. **Submit:** Incluir el campo EU en el payload (bioEu, descriptionEu).

### Ejemplo (BandEditForm)

```tsx
// Estado para bioEu (controlado)
const [bioEu, setBioEu] = useState(band.bioEu ?? "");

// En el JSX, después del textarea de bio:
<div>
  <label htmlFor="bio" className={labelClass}>Biografía (ES)</label>
  <textarea id="bio" name="bio" ... />
</div>
<div>
  <label htmlFor="bioEu" className={labelClass}>Biografía (EU)</label>
  <div className="mt-2 flex items-center gap-2">
    <TranslateButton
      sourceText={/* valor actual del textarea bio */}
      onTranslated={setBioEu}
    />
  </div>
  <textarea
    id="bioEu"
    name="bioEu"
    value={bioEu}
    onChange={(e) => setBioEu(e.target.value)}
    ...
  />
</div>
```

**Problema:** El campo `bio` usa `defaultValue` (no controlado). Para leer su valor al hacer clic en "Generar", hay dos opciones:

- **A)** Hacer `bio` también controlado con `useState`.
- **B)** Usar un `ref` para leer el valor del textarea bio al hacer clic.

**Recomendación:** Opción A: usar estado controlado para bio y bioEu. Es más claro y evita refs.

---

## 6. Seguridad y validaciones

- **Autenticación:** `requireAdmin()` en el endpoint de traducción.
- **CORS:** No aplica (misma origen).
- **Rate limiting:** Opcional; un límite por usuario/admin (p. ej. 20 req/min) reduce abusos.
- **Longitud:** Limitar el texto de entrada (p. ej. 4000 caracteres) para evitar costes excesivos.
- **API key:** Si `OPENAI_API_KEY` no está definida, el endpoint devuelve 503 y el botón se deshabilita.

---

## 7. Plan de implementación

### Fase 1: Infraestructura

1. Añadir `bioEu`, `descriptionEu` al schema Prisma.
2. Ejecutar migración / `db push`.
3. Crear `POST /api/admin/translate` con `requireAdmin` y llamada a OpenAI.
4. Crear componente `TranslateButton`.

### Fase 2: APIs de entidades

5. Actualizar schemas de validación y handlers de Band, Event, Venue, Festival para aceptar y persistir los campos `*Eu`.

### Fase 3: Formularios

6. BandEditForm: bio + bioEu + TranslateButton.
7. BandForm (nueva): bio + bioEu + TranslateButton.
8. EventEditForm: description + descriptionEu + TranslateButton.
9. EventForm: description + descriptionEu + TranslateButton.
10. VenueEditForm: description + descriptionEu + TranslateButton.
11. VenueForm: description + descriptionEu + TranslateButton.
12. FestivalForm: description + descriptionEu + TranslateButton.

### Fase 4: Frontend público (opcional)

13. Asegurar que las páginas públicas usen `bioEu` / `descriptionEu` cuando `locale === 'eu'` (si ya está implementado el fallback).

---

## 8. Dependencias

```bash
npm install openai
```

Variable de entorno en `.env`:

```
OPENAI_API_KEY=sk-...
```

---

## 9. Resumen del enfoque

| Aspecto | Decisión |
|---------|----------|
| Endpoint | `POST /api/admin/translate` |
| Proveedor | OpenAI (gpt-4o-mini) |
| Componente | `TranslateButton` reutilizable |
| Campos EU | Controlados con `useState` |
| Schema | bioEu, descriptionEu en Band, Event, Venue, Festival |

---

## 10. Confirmación

Si este enfoque está bien, el siguiente paso sería implementar siguiendo las fases descritas.
