import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { isValidEmail } from "@/lib/validation";

const RESET_PREFIX = "reset:";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: "Introduce un email válido" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({
        success: true,
        message: "Si existe una cuenta con ese email, recibirás el enlace",
      });
    }

    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
    const identifier = `${RESET_PREFIX}${email}`;

    await prisma.verificationToken.deleteMany({ where: { identifier } });
    await prisma.verificationToken.create({
      data: { identifier, token, expires },
    });

    await sendPasswordResetEmail(email, token);

    return NextResponse.json({
      success: true,
      message: "Si existe una cuenta con ese email, recibirás el enlace",
    });
  } catch (e) {
    console.error("[forgot-password]", e);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
