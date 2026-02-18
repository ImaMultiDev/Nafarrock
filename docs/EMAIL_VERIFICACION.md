# Verificación de email – Nafarrock

Documentación para recordar la configuración actual y los pasos al desplegar en producción.

---

## Estado actual (pruebas)

- **Funcional**: La verificación de email está operativa.
- **Resend**: Usando `onboarding@resend.dev` como remitente.
- **Limitación**: Con el dominio por defecto de Resend solo se entrega al email con el que te registraste en Resend. Para pruebas, usar el mismo email tanto en la cuenta Resend como en el registro en Nafarrock.

### Variables de entorno (.env)

```env
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=Nafarrock <onboarding@resend.dev>
```

---

## Al desplegar en producción

### 1. Dominio propio

- Adquirir el dominio (ej. `nafarrock.com`).
- Añadirlo y verificarlo en [Resend Domains](https://resend.com/domains).

### 2. Variables de entorno en producción

```env
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=Nafarrock <noreply@nafarrock.com>
NEXTAUTH_URL=https://nafarrock.com
```

### 3. Recordatorio

- Usar siempre un remitente de un **dominio propio verificado** en Resend.
- Con dominio verificado no hay restricción de destinatarios y la entrega es más fiable.
- Revisar [Resend Docs](https://resend.com/docs) para la verificación del dominio (registros DNS, etc.).

---

*Última actualización: Febrero 2025*
