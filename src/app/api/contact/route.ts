import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canUserAccessContact } from "@/lib/contact-access";
import { sendContactEmail } from "@/lib/email";
import { z } from "zod";

const bodySchema = z.object({
  subject: z.string().min(1, "Indica un asunto").max(200),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres").max(5000),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Debes iniciar sesión" }, { status: 401 });
    }

    const access = await canUserAccessContact(session.user.id);
    if (!access.canAccess) {
      return NextResponse.json({ message: access.reason }, { status: 403 });
    }

    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Datos inválidos";
      return NextResponse.json({ message: msg }, { status: 400 });
    }

    const { subject, message } = parsed.data;
    const fromName = access.entityName ?? access.userName ?? session.user?.email ?? "Usuario";
    const fromEmail = session.user?.email ?? "";

    const result = await sendContactEmail(
      fromName,
      fromEmail,
      subject,
      message,
      access.role,
      access.entityName
    );

    if (!result.success) {
      return NextResponse.json(
        { message: "Error al enviar. Inténtalo más tarde." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[Contact API]", e);
    return NextResponse.json(
      { message: "Error inesperado" },
      { status: 500 }
    );
  }
}
