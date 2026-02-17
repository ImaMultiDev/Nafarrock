import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
});

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Datos inválidos", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const updateData: { firstName?: string | null; lastName?: string | null } = {};
    if (data.firstName !== undefined) updateData.firstName = data.firstName || null;
    if (data.lastName !== undefined) updateData.lastName = data.lastName || null;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "Sin datos que actualizar" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    return NextResponse.json(user);
  } catch (e) {
    console.error("Dashboard update profile:", e);
    return NextResponse.json(
      { message: "Error al actualizar el perfil" },
      { status: 500 }
    );
  }
}
