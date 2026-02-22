import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bodySchema = z.object({
  approved: z.boolean().optional(),
  status: z.enum(["PENDING", "ACTIVE", "REJECTED", "EXPIRED"]).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Datos inválidos" }, { status: 400 });
    }
    const data = parsed.data;

    const announcement = await prisma.announcement.findUnique({ where: { id } });
    if (!announcement) {
      return NextResponse.json({ message: "Anuncio no encontrado" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (data.approved !== undefined) {
      updateData.isApproved = data.approved;
      updateData.status = data.approved ? "ACTIVE" : "EXPIRED";
      if (data.approved) {
        updateData.approvedAt = new Date();
        updateData.approvedBy = session.user.id;
      }
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === "REJECTED") {
        updateData.isApproved = false;
      }
    }

    await prisma.announcement.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    console.error("[admin announcements PATCH]", e);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
