import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email y contraseña requeridos" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true, scheduledDeletionAt: true },
    });

    if (!user?.password) {
      return NextResponse.json(
        { message: "Credenciales incorrectas" },
        { status: 400 }
      );
    }

    const valid = await compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { message: "Credenciales incorrectas" },
        { status: 400 }
      );
    }

    if (!user.scheduledDeletionAt) {
      return NextResponse.json(
        { message: "Esta cuenta no tiene una eliminación programada" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { scheduledDeletionAt: null },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[cancel-deletion]", e);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
