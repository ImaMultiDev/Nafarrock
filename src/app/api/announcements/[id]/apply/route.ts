import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendAnnouncementApplicationEmail } from "@/lib/email";

const bodySchema = z.object({
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ applied: false });
    }

    const { id } = await params;

    const band = await prisma.band.findFirst({
      where: { userId: session.user.id },
    });
    if (!band) {
      return NextResponse.json({ applied: false });
    }

    const applied = await prisma.announcementApplication.findUnique({
      where: {
        announcementId_bandId: { announcementId: id, bandId: band.id },
      },
    });

    return NextResponse.json({ applied: !!applied });
  } catch (e) {
    console.error("[GET apply status]", e);
    return NextResponse.json({ applied: false });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Debes iniciar sesión" }, { status: 401 });
    }

    const band = await prisma.band.findFirst({
      where: { userId: session.user.id },
    });
    if (!band) {
      return NextResponse.json({ message: "Debes tener una banda verificada" }, { status: 403 });
    }

    const { id } = await params;

    const announcement = await prisma.announcement.findUnique({
      where: { id, status: "ACTIVE", isApproved: true, enableApplicationForm: true },
      include: {
        promoter: true,
        venue: true,
        festival: true,
        organizer: true,
      },
    });

    if (!announcement) {
      return NextResponse.json({ message: "Anuncio no encontrado" }, { status: 404 });
    }

    const existing = await prisma.announcementApplication.findUnique({
      where: {
        announcementId_bandId: { announcementId: id, bandId: band.id },
      },
    });
    if (existing) {
      return NextResponse.json(
        { message: "Ya te has postulado a este anuncio" },
        { status: 409 }
      );
    }

    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message ?? "Datos inválidos" },
        { status: 400 }
      );
    }

    const toEmail = announcement.contactEmail;

    await prisma.announcementApplication.create({
      data: {
        announcementId: id,
        bandId: band.id,
        message: parsed.data.message,
      },
    });

    await sendAnnouncementApplicationEmail(
      toEmail,
      band.name,
      announcement.title,
      parsed.data.message
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[POST apply]", e);
    return NextResponse.json(
      { message: "Error al enviar la postulación" },
      { status: 500 }
    );
  }
}
