# Manual de Administrador — Nafarrock

## ¿Qué es Nafarrock para el administrador?

Nafarrock es la guía de la escena rock en Nafarroa. Como **administrador** tienes acceso completo a la plataforma: moderación, aprobación de entidades y eventos, creación directa de bandas, salas y eventos, y gestión de usuarios.

---

## ¿Qué puedes hacer?

### Bandas
- Ver listado de bandas y cuáles están pendientes de aprobar
- Aprobar o quitar aprobación a bandas
- Registrar nueva banda (crear desde cero)
- Editar bandas existentes

### Salas
- Ver listado de salas y cuáles están pendientes de aprobar
- Aprobar o quitar aprobación a salas
- Registrar nueva sala (crear desde cero)
- Editar salas existentes

### Eventos
- Ver listado de eventos y cuáles están pendientes de aprobar
- Aprobar o quitar aprobación a eventos
- Registrar nuevo evento (crear desde cero)
- Editar eventos existentes

### Promotores
- Ver listado de promotores y cuáles están pendientes de aprobar
- Aprobar o quitar aprobación a promotores

### Organizadores
- Ver listado de organizadores y cuáles están pendientes de aprobar
- Aprobar o quitar aprobación a organizadores

### Festivales
- Ver listado de festivales y cuáles están pendientes de aprobar
- Aprobar o quitar aprobación a festivales

### Usuarios
- Ver listado de usuarios con sus roles
- Ver qué entidades tiene cada usuario (banda, sala, promotor, etc.)
- Identificar usuarios con entidades pendientes de aprobar

---

## Secciones del panel que debes usar

| Sección | Ruta | Descripción |
|---------|------|-------------|
| Admin | `/admin` | Acceso general |
| Bandas | `/admin/bandas` | Gestionar y aprobar bandas |
| Salas | `/admin/salas` | Gestionar y aprobar salas |
| Eventos | `/admin/eventos` | Gestionar y aprobar eventos |
| Promotores | `/admin/promotores` | Aprobar promotores |
| Organizadores | `/admin/organizadores` | Aprobar organizadores |
| Festivales | `/admin/festivales` | Aprobar festivales |
| Usuarios | `/admin/usuarios` | Ver usuarios y roles |

---

## Acciones que requieren aprobación

Como administrador **no necesitas aprobación** para tus acciones. Eres quien aprueba. Las entidades que creas directamente (bandas, salas, eventos) pueden ser aprobadas por ti mismo al crearlas o editarlas.

---

## Limitaciones actuales

- **Promotores, organizadores y festivales** solo se crean mediante registro de usuarios; el admin no puede crear nuevos desde el panel; solo aprobar los que se registran
- **Usuarios**: el admin puede ver y gestionar roles/entidades, pero no hay funcionalidad de edición de usuarios en el panel (solo visualización)
- **Eventos**: el admin puede eximir del límite de 5 días mediante el campo `eventLimitExempt` en la base de datos (no expuesto en la UI actual)

---

## Buenas prácticas

1. **Revisa periódicamente** las entidades pendientes de aprobar para no dejar esperando a los usuarios
2. **Comprueba la calidad** del contenido antes de aprobar (nombre, descripción, enlaces válidos)
3. **Usa la sección Usuarios** para identificar quién tiene entidades pendientes y contactar si es necesario
4. **Registra bandas y salas directamente** cuando sea necesario (por ejemplo, si una sala no tiene acceso a internet para registrarse)
5. **Crea eventos** cuando un promotor o sala no pueda hacerlo por limitaciones técnicas
