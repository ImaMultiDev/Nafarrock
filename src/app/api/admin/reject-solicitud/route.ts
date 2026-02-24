import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { sendRequestRejectedEmail } from "@/lib/email";
import { z } from "zod";

const bodySchema = z.object({
  entity: z.enum(["band", "venue", "festival", "association", "promoter", "organizer"]),
  id: z.string().min(1),
  reason: z.string().max(2000).optional(),
});

const ENTITY_TYPE_LABEL: Record<string, string> = {
  band: "BAND",
  venue: "VENUE",
  festival: "FESTIVAL",
  association: "ASOCIACION",
  promoter: "PROMOTOR",
  organizer: "ORGANIZADOR",
};

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Datos inválidos" }, { status: 400 });
    }
    const { entity, id, reason } = parsed.data;

    let email: string | null = null;
    let entityName = "";
    let userId: string | null = null;

    if (entity === "band") {
      const band = await prisma.band.findUnique({ where: { id }, include: { user: { select: { email: true, id: true } } } });
      if (!band) return NextResponse.json({ message: "Banda no encontrada" }, { status: 404 });
      if (band.approved) return NextResponse.json({ message: "La banda ya está aprobada" }, { status: 400 });
      email = band.user?.email ?? null;
      entityName = band.name;
      userId = band.userId;
      await prisma.band.delete({ where: { id } });
    } else if (entity === "venue") {
      const venue = await prisma.venue.findUnique({ where: { id }, include: { user: { select: { email: true, id: true } } } });
      if (!venue) return NextResponse.json({ message: "Sala no encontrada" }, { status: 404 });
      if (venue.approved) return NextResponse.json({ message: "La sala ya está aprobada" }, { status: 400 });
      email = venue.user?.email ?? null;
      entityName = venue.name;
      userId = venue.userId;
      await prisma.venue.delete({ where: { id } });
    } else if (entity === "festival") {
      const festival = await prisma.festival.findUnique({ where: { id }, include: { user: { select: { email: true, id: true } } } });
      if (!festival) return NextResponse.json({ message: "Festival no encontrado" }, { status: 404 });
      if (festival.approved) return NextResponse.json({ message: "El festival ya está aprobado" }, { status: 400 });
      email = festival.user?.email ?? null;
      entityName = festival.name;
      userId = festival.userId;
      await prisma.festival.delete({ where: { id } });
    } else if (entity === "association") {
      const asoc = await prisma.asociacion.findUnique({ where: { id }, include: { user: { select: { email: true, id: true } } } });
      if (!asoc) return NextResponse.json({ message: "Asociación no encontrada" }, { status: 404 });
      if (asoc.approved) return NextResponse.json({ message: "La asociación ya está aprobada" }, { status: 400 });
      email = asoc.user?.email ?? null;
      entityName = asoc.name;
      userId = asoc.userId;
      await prisma.asociacion.delete({ where: { id } });
    } else if (entity === "promoter") {
      const promoter = await prisma.promoter.findUnique({ where: { id }, include: { user: { select: { email: true, id: true } } } });
      if (!promoter) return NextResponse.json({ message: "Promotor no encontrado" }, { status: 404 });
      if (promoter.approved) return NextResponse.json({ message: "El promotor ya está aprobado" }, { status: 400 });
      email = promoter.user?.email ?? null;
      entityName = promoter.name;
      userId = promoter.userId;
      await prisma.promoter.delete({ where: { id } });
    } else if (entity === "organizer") {
      const organizer = await prisma.organizer.findUnique({ where: { id }, include: { user: { select: { email: true, id: true } } } });
      if (!organizer) return NextResponse.json({ message: "Organizador no encontrado" }, { status: 404 });
      if (organizer.approved) return NextResponse.json({ message: "El organizador ya está aprobado" }, { status: 400 });
      email = organizer.user?.email ?? null;
      entityName = organizer.name;
      userId = organizer.userId;
      await prisma.organizer.delete({ where: { id } });
    }

    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { role: "USUARIO" },
      });
    }

    if (email && reason && reason.trim()) {
      await sendRequestRejectedEmail(email, entityName, ENTITY_TYPE_LABEL[entity], reason.trim());
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    console.error("[admin reject-solicitud]", e);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
