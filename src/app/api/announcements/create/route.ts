import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CONVOCATORIA_COOLDOWN_DAYS = 7;

const createSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(20),
  zone: z.string().optional(),
  genres: z.array(z.string()).optional().default([]),
  contactEmail: z.string().email(),
  contactInfo: z.string().optional(),
  enableApplicationForm: z.boolean().optional().default(false),
  cacheInfo: z.string().optional(),
  equipmentInfo: z.string().optional(),
  technicalInfo: z.string().optional(),
  extraInfo: z.string().optional(),
  advertiserType: z.enum(["PROMOTER", "VENUE", "FESTIVAL", "ORGANIZER"]),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message ?? "Datos inválidos" },
        { status: 400 }
      );
    }
    const data = parsed.data;

    if (data.advertiserType === "PROMOTER") {
      const promoter = await prisma.promoter.findFirst({
        where: { userId: session.user.id },
        include: { _count: { select: { announcements: true } } },
      });
      if (!promoter) {
        return NextResponse.json({ message: "No tienes perfil de promotor" }, { status: 403 });
      }
      if (!promoter.approved) {
        return NextResponse.json({ message: "Tu perfil de promotor debe estar aprobado" }, { status: 403 });
      }
      const activeCount = await prisma.announcement.count({
        where: {
          promoterId: promoter.id,
          status: "ACTIVE",
          isApproved: true,
        },
      });
      if (activeCount >= 1) {
        return NextResponse.json(
          { message: "Solo puedes tener 1 anuncio activo a la vez" },
          { status: 400 }
        );
      }

      const ann = await prisma.announcement.create({
        data: {
          title: data.title,
          description: data.description,
          zone: data.zone || null,
          genres: data.genres,
          advertiserType: "PROMOTER",
          promoterId: promoter.id,
          contactEmail: data.contactEmail,
          contactInfo: data.contactInfo || null,
          enableApplicationForm: false,
          status: "PENDING",
        },
      });
      return NextResponse.json(ann);
    }

    const cooldownDate = new Date();
    cooldownDate.setDate(cooldownDate.getDate() - CONVOCATORIA_COOLDOWN_DAYS);

    if (data.advertiserType === "VENUE") {
      const venue = await prisma.venue.findFirst({
        where: { userId: session.user.id },
      });
      if (!venue) {
        return NextResponse.json({ message: "No tienes perfil de sala" }, { status: 403 });
      }
      if (!venue.approved) {
        return NextResponse.json({ message: "Tu perfil debe estar aprobado" }, { status: 403 });
      }
      const recent = await prisma.announcement.findFirst({
        where: {
          venueId: venue.id,
          createdAt: { gte: cooldownDate },
        },
      });
      if (recent) {
        return NextResponse.json(
          { message: `Debes esperar ${CONVOCATORIA_COOLDOWN_DAYS} días entre anuncios` },
          { status: 400 }
        );
      }

      const ann = await prisma.announcement.create({
        data: {
          title: data.title,
          description: data.description,
          zone: data.zone || venue.city,
          genres: data.genres,
          advertiserType: "VENUE",
          venueId: venue.id,
          contactEmail: data.contactEmail,
          contactInfo: data.contactInfo || null,
          enableApplicationForm: data.enableApplicationForm ?? false,
          cacheInfo: data.cacheInfo || null,
          equipmentInfo: data.equipmentInfo || null,
          technicalInfo: data.technicalInfo || null,
          extraInfo: data.extraInfo || null,
          status: "PENDING",
        },
      });
      return NextResponse.json(ann);
    }

    if (data.advertiserType === "FESTIVAL") {
      const festival = await prisma.festival.findFirst({
        where: { userId: session.user.id },
      });
      if (!festival) {
        return NextResponse.json({ message: "No tienes perfil de festival" }, { status: 403 });
      }
      if (!festival.approved) {
        return NextResponse.json({ message: "Tu perfil debe estar aprobado" }, { status: 403 });
      }
      const recent = await prisma.announcement.findFirst({
        where: {
          festivalId: festival.id,
          createdAt: { gte: cooldownDate },
        },
      });
      if (recent) {
        return NextResponse.json(
          { message: `Debes esperar ${CONVOCATORIA_COOLDOWN_DAYS} días entre anuncios` },
          { status: 400 }
        );
      }

      const ann = await prisma.announcement.create({
        data: {
          title: data.title,
          description: data.description,
          zone: data.zone || festival.location,
          genres: data.genres,
          advertiserType: "FESTIVAL",
          festivalId: festival.id,
          contactEmail: data.contactEmail,
          contactInfo: data.contactInfo || null,
          enableApplicationForm: data.enableApplicationForm ?? false,
          cacheInfo: data.cacheInfo || null,
          equipmentInfo: data.equipmentInfo || null,
          technicalInfo: data.technicalInfo || null,
          extraInfo: data.extraInfo || null,
          status: "PENDING",
        },
      });
      return NextResponse.json(ann);
    }

    if (data.advertiserType === "ORGANIZER") {
      const organizer = await prisma.organizer.findFirst({
        where: { userId: session.user.id },
      });
      if (!organizer) {
        return NextResponse.json({ message: "No tienes perfil de organizador" }, { status: 403 });
      }
      if (!organizer.approved) {
        return NextResponse.json({ message: "Tu perfil debe estar aprobado" }, { status: 403 });
      }
      const recent = await prisma.announcement.findFirst({
        where: {
          organizerId: organizer.id,
          createdAt: { gte: cooldownDate },
        },
      });
      if (recent) {
        return NextResponse.json(
          { message: `Debes esperar ${CONVOCATORIA_COOLDOWN_DAYS} días entre anuncios` },
          { status: 400 }
        );
      }

      const ann = await prisma.announcement.create({
        data: {
          title: data.title,
          description: data.description,
          zone: data.zone || null,
          genres: data.genres,
          advertiserType: "ORGANIZER",
          organizerId: organizer.id,
          contactEmail: data.contactEmail,
          contactInfo: data.contactInfo || null,
          enableApplicationForm: data.enableApplicationForm ?? false,
          cacheInfo: data.cacheInfo || null,
          equipmentInfo: data.equipmentInfo || null,
          technicalInfo: data.technicalInfo || null,
          extraInfo: data.extraInfo || null,
          status: "PENDING",
        },
      });
      return NextResponse.json(ann);
    }

    return NextResponse.json({ message: "Tipo inválido" }, { status: 400 });
  } catch (e) {
    console.error("[POST announcement create]", e);
    return NextResponse.json(
      { message: "Error al crear el anuncio" },
      { status: 500 }
    );
  }
}
