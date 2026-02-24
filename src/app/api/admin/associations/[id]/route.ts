import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { z } from "zod";

const updateSchema = z.object({
  approved: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Datos inválidos", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const asociacion = await prisma.asociacion.findUnique({ where: { id } });
    if (!asociacion) {
      return NextResponse.json({ message: "Asociación no encontrada" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (data.approved != null) {
      updateData.approved = data.approved;
      if (data.approved) {
        updateData.approvedAt = new Date();
      }
    }

    const updated = await prisma.asociacion.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    console.error("Admin update association:", e);
    return NextResponse.json(
      { message: "Error al actualizar la asociación" },
      { status: 500 }
    );
  }
}
