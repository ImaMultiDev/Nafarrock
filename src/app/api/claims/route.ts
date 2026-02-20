import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bodySchema = z.object({
  entityType: z.enum(["BAND", "VENUE", "FESTIVAL"]),
  entityId: z.string().min(1),
  message: z.string().max(1000).optional(),
});

/**
 * Crea una solicitud de reclamación de perfil.
 * El usuario debe estar logueado y no tener ya un perfil de ese tipo.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Debes iniciar sesión" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Datos inválidos" }, { status: 400 });
    }
    const { entityType, entityId, message } = parsed.data;

    // Verificar que el usuario no tenga ya perfil de ese tipo
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        bandProfile: true,
        venueProfile: true,
        festivalProfile: true,
      },
    });
    if (!user) return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });

    const existingProfile =
      (entityType === "BAND" && user.bandProfile) ||
      (entityType === "VENUE" && user.venueProfile) ||
      (entityType === "FESTIVAL" && user.festivalProfile);
    if (existingProfile) {
      return NextResponse.json(
        { message: "Ya tienes un perfil de este tipo" },
        { status: 400 }
      );
    }

    // Verificar que el perfil existe, no tiene propietario y no tiene claim pendiente
    const claimData = {
      userId: session.user.id,
      entityType: entityType as "BAND" | "VENUE" | "FESTIVAL",
      entityId,
      message: message || null,
      status: "PENDING_CLAIM" as const,
    };

    if (entityType === "BAND") {
      const band = await prisma.band.findUnique({ where: { id: entityId } });
      if (!band) return NextResponse.json({ message: "Banda no encontrada" }, { status: 404 });
      if (band.userId)
        return NextResponse.json({ message: "Este perfil ya tiene propietario" }, { status: 400 });
      const existingClaim = await prisma.profileClaim.findFirst({
        where: { bandId: entityId, status: "PENDING_CLAIM" },
      });
      if (existingClaim)
        return NextResponse.json(
          { message: "Ya existe una solicitud pendiente para este perfil" },
          { status: 400 }
        );
      await prisma.profileClaim.create({
        data: { ...claimData, bandId: entityId },
      });
    } else if (entityType === "VENUE") {
      const venue = await prisma.venue.findUnique({ where: { id: entityId } });
      if (!venue) return NextResponse.json({ message: "Sala no encontrada" }, { status: 404 });
      if (venue.userId)
        return NextResponse.json({ message: "Este perfil ya tiene propietario" }, { status: 400 });
      const existingClaim = await prisma.profileClaim.findFirst({
        where: { venueId: entityId, status: "PENDING_CLAIM" },
      });
      if (existingClaim)
        return NextResponse.json(
          { message: "Ya existe una solicitud pendiente para este perfil" },
          { status: 400 }
        );
      await prisma.profileClaim.create({
        data: { ...claimData, venueId: entityId },
      });
    } else if (entityType === "FESTIVAL") {
      const festival = await prisma.festival.findUnique({ where: { id: entityId } });
      if (!festival) return NextResponse.json({ message: "Festival no encontrado" }, { status: 404 });
      if (festival.userId)
        return NextResponse.json({ message: "Este perfil ya tiene propietario" }, { status: 400 });
      const existingClaim = await prisma.profileClaim.findFirst({
        where: { festivalId: entityId, status: "PENDING_CLAIM" },
      });
      if (existingClaim)
        return NextResponse.json(
          { message: "Ya existe una solicitud pendiente para este perfil" },
          { status: 400 }
        );
      await prisma.profileClaim.create({
        data: { ...claimData, festivalId: entityId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[claims POST]", e);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
