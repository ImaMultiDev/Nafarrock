import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { z } from "zod";
import { uniqueSlug } from "@/lib/slug";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().optional(),
  type: z.enum(["CONCIERTO", "FESTIVAL"]).optional(),
  date: z.string().datetime().or(z.coerce.date()).optional(),
  endDate: z.string().datetime().optional().nullable().or(z.coerce.date().optional().nullable()),
  venueId: z.string().optional(),
  doorsOpen: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  price: z.string().optional().nullable(),
  ticketUrl: z.string().url().optional().nullable().or(z.literal("")),
  isApproved: z.boolean().optional(),
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

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      return NextResponse.json({ message: "Evento no encontrado" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (data.title != null) updateData.title = data.title;
    if (data.type != null) updateData.type = data.type;
    if (data.date != null) updateData.date = new Date(data.date);
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.venueId != null) updateData.venueId = data.venueId;
    if (data.doorsOpen !== undefined) updateData.doorsOpen = data.doorsOpen;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.ticketUrl !== undefined) updateData.ticketUrl = data.ticketUrl || null;
    if (data.isApproved != null) {
      updateData.isApproved = data.isApproved;
      if (data.isApproved) {
        updateData.approvedAt = new Date();
      }
    }
    if (data.slug != null && data.slug !== event.slug) {
      const slug = await uniqueSlug(
        (s) => prisma.event.findUnique({ where: { slug: s } }).then(Boolean),
        data.slug
      );
      updateData.slug = slug;
    }

    const updated = await prisma.event.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    console.error("Admin update event:", e);
    return NextResponse.json(
      { message: "Error al actualizar el evento" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      return NextResponse.json({ message: "Evento no encontrado" }, { status: 404 });
    }

    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    console.error("Admin delete event:", e);
    return NextResponse.json(
      { message: "Error al eliminar el evento" },
      { status: 500 }
    );
  }
}
