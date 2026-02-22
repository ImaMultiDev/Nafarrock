import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isPasswordValid } from "@/lib/validation";

const RESET_PREFIX = "reset:";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = typeof body.token === "string" ? body.token.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!token) {
      return NextResponse.json(
        { message: "Token requerido" },
        { status: 400 }
      );
    }

    if (!isPasswordValid(password)) {
      return NextResponse.json(
        { message: "Contraseña: mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial" },
        { status: 400 }
      );
    }

    const vt = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!vt || !vt.identifier.startsWith(RESET_PREFIX)) {
      return NextResponse.json(
        { message: "Enlace inválido o expirado. Solicita uno nuevo." },
        { status: 400 }
      );
    }

    if (vt.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.json(
        { message: "El enlace ha expirado. Solicita uno nuevo." },
        { status: 400 }
      );
    }

    const email = vt.identifier.replace(RESET_PREFIX, "");
    const hashedPassword = await hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      }),
      prisma.verificationToken.delete({ where: { token } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[reset-password]", e);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
