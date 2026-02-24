import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL =
  process.env.EMAIL_FROM || "Nafarrock <onboarding@resend.dev>";

export async function sendVerificationEmail(
  to: string,
  token: string,
  name?: string
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn("RESEND_API_KEY no configurado, omitiendo envío de email");
    return { success: true };
  }

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Verifica tu email - Nafarrock",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #00c853;">NAFARROCK</h2>
        <p>Hola${name ? ` ${name}` : ""},</p>
        <p>Gracias por registrarte en Nafarrock. Para activar tu cuenta, verifica tu email haciendo clic en el siguiente enlace:</p>
        <p style="margin: 24px 0;">
          <a href="${verifyUrl}" style="background: #e60026; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Verificar mi email
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          Si no creaste esta cuenta, puedes ignorar este mensaje.
        </p>
        <p style="color: #666; font-size: 12px; margin-top: 32px;">
          Este enlace expira en 24 horas.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("[Resend] Error enviando email:", error);
    return { success: false, error: error.message };
  }
  console.log("[Resend] Email enviado correctamente. ID:", data?.id, "→", to);
  return { success: true };
}

const CONTACT_EMAIL = "central@nafarrock.com";

export async function sendContactEmail(
  fromName: string,
  fromEmail: string,
  subject: string,
  message: string,
  role?: string,
  entityName?: string
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn("RESEND_API_KEY no configurado, omitiendo envío de email de contacto");
    return { success: true };
  }

  const roleLabel = role ? `Rol: ${role}` : "";
  const entityLabel = entityName ? `Entidad: ${entityName}` : "";

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: CONTACT_EMAIL,
    replyTo: fromEmail,
    subject: `[Nafarrock Contacto] ${subject}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e60026;">Mensaje de contacto - Nafarrock</h2>
        <p><strong>De:</strong> ${fromName} &lt;${fromEmail}&gt;</p>
        ${roleLabel ? `<p><strong>${roleLabel}</strong></p>` : ""}
        ${entityLabel ? `<p><strong>${entityLabel}</strong></p>` : ""}
        <p><strong>Asunto:</strong> ${subject}</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
        <div style="white-space: pre-wrap;">${message.replace(/\n/g, "<br>")}</div>
      </div>
    `,
  });

  if (error) {
    console.error("[Resend] Error enviando contacto:", error);
    return { success: false, error: error.message };
  }
  console.log("[Resend] Contacto enviado. ID:", data?.id, "→", CONTACT_EMAIL);
  return { success: true };
}

const baseUrl = () => process.env.NEXTAUTH_URL || "https://nafarrock.com";

export async function sendClaimApprovedEmail(
  to: string,
  entityName: string,
  entityType: string
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn("RESEND_API_KEY no configurado, omitiendo email de reclamación aprobada");
    return { success: true };
  }

  const entityLabel =
    entityType === "BAND"
      ? "banda"
      : entityType === "VENUE"
        ? "sala/recinto"
        : "festival";

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Reclamación aprobada - Nafarrock",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #00c853;">NAFARROCK</h2>
        <p>¡Buenas noticias!</p>
        <p>La reclamación del perfil de la ${entityLabel} <strong>"${entityName}"</strong> ha sido aprobada.</p>
        <p>Tu cuenta ha sido vinculada correctamente al perfil. Ya puedes acceder a tu panel y gestionar toda la información del perfil.</p>
        <p style="margin: 24px 0;">
          <a href="${baseUrl()}/dashboard" style="background: #e60026; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Acceder al panel
          </a>
        </p>
        <p style="color: #666; font-size: 12px;">
          — Equipo Nafarrock
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("[Resend] Error enviando email reclamación aprobada:", error);
    return { success: false, error: error.message };
  }
  console.log("[Resend] Reclamación aprobada enviada. ID:", data?.id, "→", to);
  return { success: true };
}

const entityTypeLabel = (t: string) =>
  t === "BAND" ? "banda" : t === "VENUE" ? "sala/recinto" : t === "FESTIVAL" ? "festival" : t === "ASOCIACION" ? "asociación" : "perfil";

/** Email cuando se rechaza una solicitud de perfil (banda, sala, etc.) */
export async function sendRequestRejectedEmail(
  to: string,
  entityName: string,
  entityType: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn("RESEND_API_KEY no configurado, omitiendo email de solicitud rechazada");
    return { success: true };
  }

  const tipo = entityTypeLabel(entityType);
  const contactUrl = `${baseUrl()}/contacto`;
  const subject = reason ? "Solicitud Rechazada - Motivo" : "Solicitud Rechazada - Nafarrock";

  const reasonBlock = reason
    ? `<p><strong>Motivo:</strong></p><div style="white-space: pre-wrap; background: #f5f5f5; padding: 12px; border-radius: 4px; margin: 12px 0;">${reason.replace(/\n/g, "<br>")}</div>`
    : "";

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #e60026;">NAFARROCK</h2>
        <p>Hola,</p>
        <p>Tu solicitud de perfil de ${tipo} <strong>"${entityName}"</strong> no ha podido ser aceptada.</p>
        ${reasonBlock}
        <p>Si tienes dudas o deseas más información, ponte en contacto con Nafarrock:</p>
        <p style="margin: 24px 0;">
          <a href="${contactUrl}" style="background: #00c853; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Formulario de contacto
          </a>
        </p>
        <p style="color: #666; font-size: 12px;">— Equipo Nafarrock</p>
      </div>
    `,
  });

  if (error) {
    console.error("[Resend] Error enviando email solicitud rechazada:", error);
    return { success: false, error: error.message };
  }
  console.log("[Resend] Solicitud rechazada enviada. ID:", data?.id, "→", to);
  return { success: true };
}

/** Email cuando se rechaza una reclamación de perfil (con motivo opcional) */
export async function sendClaimRejectedEmail(
  to: string,
  entityName: string,
  entityType: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn("RESEND_API_KEY no configurado, omitiendo email de reclamación rechazada");
    return { success: true };
  }

  const contactUrl = `${baseUrl()}/contacto`;
  const tipo = entityTypeLabel(entityType);
  const subject = reason ? "Reclamación Rechazada - Motivo" : "Reclamación Rechazada - Nafarrock";

  const reasonBlock = reason
    ? `<p><strong>Motivo:</strong></p><div style="white-space: pre-wrap; background: #f5f5f5; padding: 12px; border-radius: 4px; margin: 12px 0;">${reason.replace(/\n/g, "<br>")}</div>`
    : "";

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #e60026;">NAFARROCK</h2>
        <p>Hola,</p>
        <p>La reclamación del perfil de la ${tipo} <strong>"${entityName}"</strong> no ha podido ser aceptada.</p>
        ${reasonBlock}
        <p>Si deseas más información, ponte en contacto con Nafarrock:</p>
        <p style="margin: 24px 0;">
          <a href="${contactUrl}" style="background: #00c853; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Formulario de contacto
          </a>
        </p>
        <p style="color: #666; font-size: 12px;">— Equipo Nafarrock</p>
      </div>
    `,
  });

  if (error) {
    console.error("[Resend] Error enviando email reclamación rechazada:", error);
    return { success: false, error: error.message };
  }
  console.log("[Resend] Reclamación rechazada enviada. ID:", data?.id, "→", to);
  return { success: true };
}

export async function sendPasswordResetEmail(
  to: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn("RESEND_API_KEY no configurado, omitiendo email de recuperación");
    return { success: true };
  }

  const base = process.env.NEXTAUTH_URL || "https://nafarrock.com";
  const resetUrl = `${base}/auth/restablecer?token=${token}`;

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Recuperar contraseña - Nafarrock",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #e60026;">NAFARROCK</h2>
        <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.</p>
        <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background: #00c853; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Restablecer contraseña
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          Si no solicitaste este cambio, ignora este mensaje. Tu contraseña no se modificará.
        </p>
        <p style="color: #666; font-size: 12px; margin-top: 32px;">
          Este enlace expira en 1 hora.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("[Resend] Error enviando email recuperación:", error);
    return { success: false, error: error.message };
  }
  console.log("[Resend] Recuperación enviada. ID:", data?.id, "→", to);
  return { success: true };
}

export async function sendAnnouncementApplicationEmail(
  to: string,
  bandName: string,
  announcementTitle: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn("RESEND_API_KEY no configurado, omitiendo email de postulación");
    return { success: true };
  }

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Postulación de la banda ${bandName} para el anuncio "${announcementTitle}"`,
    replyTo: undefined,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00c853;">NAFARROCK - Postulación recibida</h2>
        <p>Has recibido una nueva postulación desde Nafarrock:</p>
        <p><strong>Banda:</strong> ${bandName}</p>
        <p><strong>Anuncio:</strong> ${announcementTitle}</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
        <div style="white-space: pre-wrap;">${message.replace(/\n/g, "<br>")}</div>
        <p style="color: #666; font-size: 12px; margin-top: 24px;">
          Responde directamente a este email para contactar con la banda.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("[Resend] Error enviando email de postulación:", error);
    return { success: false, error: error.message };
  }
  console.log("[Resend] Postulación enviada. ID:", data?.id, "→", to);
  return { success: true };
}
