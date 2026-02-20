import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slug";
import { canUserCreateEvent } from "@/lib/validated-event";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  type: z.enum(["CONCIERTO", "FESTIVAL"]).optional(),
  date: z.union([z.string(), z.coerce.date()]).optional(),
  endDate: z.union([z.string(), z.coerce.date()]).optional().nullable(),
  venueId: z.string().optional(),
  doorsOpen: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  price: z.string().optional().nullable(),
  ticketUrl: z.string().url().optional().nullable().or(z.literal("")),
  instagramUrl: z.string().url().optional().nullable().or(z.literal("")),
  facebookUrl: z.string().url().optional().nullable().or(z.literal("")),
  twitterUrl: z.string().url().optional().nullable().or(z.literal("")),
  webUrl: z.string().url().optional().nullable().or(z.literal("")),
  imageUrl: z.string().optional().nullable(),
  images: z.array(z.string()).optional(),
  isSoldOut: z.boolean().optional(),
  bandIds: z.array(z.string()).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: { venue: true },
    });

    if (!event) {
      return NextResponse.json({ message: "Evento no encontrado" }, { status: 404 });
    }
    if (event.createdByUserId !== session.user.id) {
      return NextResponse.json({ message: "No puedes editar este evento" }, { status: 403 });
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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { venueProfile: true },
    });
    const role = user?.role as string;

    const updateData: Record<string, unknown> = {};
    if (data.title != null) updateData.title = data.title;
    if (data.type != null) updateData.type = data.type;
    if (data.date != null) {
      const eventDate = new Date(data.date);
      const check = await canUserCreateEvent(session.user.id, eventDate, id);
      if (!check.ok) {
        return NextResponse.json({ message: check.message }, { status: 403 });
      }
      updateData.date = eventDate;
    }
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.venueId != null) {
      if (role === "SALA") {
        const myVenue = user?.venueProfile;
        if (!myVenue || myVenue.id !== data.venueId) {
          return NextResponse.json(
            { message: "Como sala, solo puedes usar tu propia sala." },
            { status: 403 }
          );
        }
      }
      const venue = await prisma.venue.findUnique({ where: { id: data.venueId } });
      if (!venue || !venue.approved) {
        return NextResponse.json({ message: "Sala inválida" }, { status: 400 });
      }
      updateData.venueId = data.venueId;
    }
    if (data.doorsOpen !== undefined) updateData.doorsOpen = data.doorsOpen;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.ticketUrl !== undefined) updateData.ticketUrl = data.ticketUrl || null;
    if (data.instagramUrl !== undefined) updateData.instagramUrl = data.instagramUrl || null;
    if (data.facebookUrl !== undefined) updateData.facebookUrl = data.facebookUrl || null;
    if (data.twitterUrl !== undefined) updateData.twitterUrl = data.twitterUrl || null;
    if (data.webUrl !== undefined) updateData.webUrl = data.webUrl || null;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.images !== undefined) updateData.images = data.images;
    if (data.isSoldOut !== undefined) updateData.isSoldOut = data.isSoldOut;
    if (data.title != null && data.title !== event.title) {
      const d = data.date ? new Date(data.date) : event.date;
      const newSlug = await uniqueSlug(
        (s) => prisma.event.findFirst({ where: { slug: s, id: { not: id } } }).then(Boolean),
        `${data.title}-${d.getFullYear()}`
      );
      updateData.slug = newSlug;
    }

    if (data.bandIds !== undefined) {
      await prisma.bandEvent.deleteMany({ where: { eventId: id } });
      if (data.bandIds.length > 0) {
        await prisma.bandEvent.createMany({
          data: data.bandIds.map((bandId, i) => ({
            eventId: id,
            bandId,
            order: i,
            isHeadliner: i === 0,
          })),
        });
      }
    }

    const updated = await prisma.event.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error("Dashboard update event:", e);
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const event = await prisma.event.findUnique({ where: { id } });

    if (!event) {
      return NextResponse.json({ message: "Evento no encontrado" }, { status: 404 });
    }
    if (event.createdByUserId !== session.user.id) {
      return NextResponse.json({ message: "No puedes borrar este evento" }, { status: 403 });
    }

    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Dashboard delete event:", e);
    return NextResponse.json(
      { message: "Error al eliminar el evento" },
      { status: 500 }
    );
  }
}
