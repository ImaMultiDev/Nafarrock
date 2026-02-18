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
