import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { createInboxMessage } from "@/lib/inbox";
import {
  sendBoardAnnouncementApprovedEmail,
  sendBoardAnnouncementRejectedEmail,
} from "@/lib/email";
import { bandLocationSchema } from "@/lib/band-locations";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  category: z.enum(["SE_BUSCA_MUSICO", "SE_BUSCAN_BANDAS", "CONCURSO", "LOCAL_MATERIAL", "SERVICIOS", "OTROS"]).optional(),
  territory: bandLocationSchema,
  description: z.string().min(1).max(5000).optional(),
  contactEmail: z.string().email().optional(),
  imageUrl: z.string().url().optional().nullable().or(z.literal("")),
  images: z.array(z.string().url()).optional(),
  approved: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.errors[0];
      return NextResponse.json(
        { message: first?.message ?? "Datos inválidos" },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const announcement = await prisma.boardAnnouncement.findUnique({
      where: { id },
      include: { user: { select: { email: true } } },
    });
    if (!announcement) {
      return NextResponse.json(
        { message: "Anuncio no encontrado" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (data.title != null) updateData.title = data.title;
    if (data.category != null) updateData.category = data.category;
    if (data.territory !== undefined) updateData.territory = data.territory;
    if (data.description != null) updateData.description = data.description;
    if (data.contactEmail != null) updateData.contactEmail = data.contactEmail;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl && data.imageUrl.trim() ? data.imageUrl : null;
    if (data.images !== undefined) updateData.images = data.images ?? [];
    if (data.approved != null) {
      updateData.approved = data.approved;
      if (data.approved) {
        updateData.approvedAt = new Date();
        updateData.approvedBy = session.user.id;
        if (announcement.userId) {
          await createInboxMessage({
            userId: announcement.userId,
            kind: "PROPOSAL_APPROVED",
            entityType: "boardAnnouncement",
            entityId: announcement.id,
            entityName: announcement.title,
          });
        }
      }
    }

    const updated = await prisma.boardAnnouncement.update({
      where: { id },
      data: updateData,
    });

    if (data.approved) {
      const email =
        announcement.user?.email ?? announcement.contactEmail;
      if (email) {
        await sendBoardAnnouncementApprovedEmail(
          email,
          updated.title
        );
      }
    }

    return NextResponse.json(updated);
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    console.error("Admin update board announcement:", e);
    return NextResponse.json(
      { message: "Error al actualizar el anuncio" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const announcement = await prisma.boardAnnouncement.findUnique({
      where: { id },
      include: { user: { select: { email: true } } },
    });
    if (!announcement) {
      return NextResponse.json(
        { message: "Anuncio no encontrado" },
        { status: 404 }
      );
    }

    const email = announcement.user?.email ?? announcement.contactEmail;
    if (email) {
      await sendBoardAnnouncementRejectedEmail(email, announcement.title);
    }
    if (announcement.userId) {
      await createInboxMessage({
        userId: announcement.userId,
        kind: "PROPOSAL_REJECTED",
        entityType: "boardAnnouncement",
        entityId: announcement.id,
        entityName: announcement.title,
      });
    }

    await prisma.boardAnnouncement.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    console.error("Admin delete board announcement:", e);
    return NextResponse.json(
      { message: "Error al eliminar el anuncio" },
      { status: 500 }
    );
  }
}
