import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

const GRACE_DAYS = 7;

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const password = typeof body.password === "string" ? body.password : "";
    const confirm = typeof body.confirm === "string" ? body.confirm : "";

    if (confirm !== "BORRAR CUENTA") {
      return NextResponse.json(
        { message: 'Debes escribir "BORRAR CUENTA" para confirmar' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    if (user.role === "ADMIN") {
      return NextResponse.json(
        { message: "Los administradores no pueden borrar su cuenta desde aquí" },
        { status: 400 }
      );
    }

    if (user.password) {
      if (!password) {
        return NextResponse.json(
          { message: "Introduce tu contraseña para confirmar" },
          { status: 400 }
        );
      }
      const valid = await compare(password, user.password);
      if (!valid) {
        return NextResponse.json(
          { message: "Contraseña incorrecta" },
          { status: 400 }
        );
      }
    }

    const scheduledAt = new Date();
    scheduledAt.setDate(scheduledAt.getDate() + GRACE_DAYS);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { scheduledDeletionAt: scheduledAt },
    });

    return NextResponse.json({
      success: true,
      scheduledAt: scheduledAt.toISOString(),
      graceDays: GRACE_DAYS,
    });
  } catch (e) {
    console.error("[delete-account]", e);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
