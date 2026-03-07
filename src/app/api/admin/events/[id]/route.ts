import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { z } from "zod";
import { uniqueSlug } from "@/lib/slug";
import { startOfToday } from "@/lib/date";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().optional(),
  type: z.enum(["CONCIERTO", "FESTIVAL"]).optional(),
  date: z
    .union([z.string(), z.coerce.date()])
    .optional()
    .refine((d) => !d || new Date(d) >= startOfToday(), {
      message: "La fecha del evento no puede ser anterior a hoy",
    }),
  endDate: z.union([z.string(), z.coerce.date()]).optional().nullable().or(z.literal("")),
  venueId: z.string().optional().nullable().or(z.literal("")),
  venueText: z.string().optional().nullable().or(z.literal("")),
  doorsOpen: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  descriptionEu: z.string().optional().nullable(),
  price: z.string().optional().nullable(),
  ticketUrl: z.string().url().optional().nullable().or(z.literal("")),
  instagramUrl: z.string().url().optional().nullable().or(z.literal("")),
  facebookUrl: z.string().url().optional().nullable().or(z.literal("")),
  twitterUrl: z.string().url().optional().nullable().or(z.literal("")),
  webUrl: z.string().url().optional().nullable().or(z.literal("")),
  imageUrl: z.string().optional().nullable(),
  images: z.array(z.string()).optional(),
  isSoldOut: z.boolean().optional(),
  isApproved: z.boolean().optional(),
  eventLimitExempt: z.boolean().optional(),
  bandIds: z.array(z.string()).optional(),
  cartel: z
    .array(
      z.union([
        z.object({ type: z.literal("band"), bandId: z.string() }),
        z.object({ type: z.literal("external"), name: z.string().min(1) }),
        z.object({ type: z.literal("otherLocal"), name: z.string().min(1) }),
      ])
    )
    .optional(),
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
      const flat = parsed.error.flatten();
      const firstMsg = Object.values(flat.fieldErrors).flat()[0] ?? flat.formErrors[0] ?? "Datos inválidos";
      return NextResponse.json(
        { message: firstMsg, errors: flat },
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
    const newDate = data.date != null ? new Date(data.date) : null;
    const newEndDate = data.endDate !== undefined
      ? (data.endDate && data.endDate !== "" ? new Date(data.endDate) : null)
      : undefined;
    if (newEndDate !== undefined && newEndDate) {
      const refDate = newDate ?? event.date;
      if (newEndDate < refDate) {
        return NextResponse.json(
          { message: "La fecha de fin debe ser posterior a la de inicio" },
          { status: 400 }
        );
      }
    }
    if (newDate != null) updateData.date = newDate;
    if (newEndDate !== undefined) updateData.endDate = newEndDate;
    if (data.venueText !== undefined) {
      updateData.venueText = (data.venueText && data.venueText.trim()) ? data.venueText.trim() : null;
      updateData.venueId = null;
    }
    if (data.doorsOpen !== undefined) updateData.doorsOpen = data.doorsOpen;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.descriptionEu !== undefined) updateData.descriptionEu = data.descriptionEu;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.ticketUrl !== undefined) updateData.ticketUrl = data.ticketUrl || null;
    if (data.instagramUrl !== undefined) updateData.instagramUrl = data.instagramUrl || null;
    if (data.facebookUrl !== undefined) updateData.facebookUrl = data.facebookUrl || null;
    if (data.twitterUrl !== undefined) updateData.twitterUrl = data.twitterUrl || null;
    if (data.webUrl !== undefined) updateData.webUrl = data.webUrl || null;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.images !== undefined) updateData.images = data.images;
    if (data.isSoldOut !== undefined) updateData.isSoldOut = data.isSoldOut;
    if (data.isApproved != null) {
      updateData.isApproved = data.isApproved;
      if (data.isApproved) {
        updateData.approvedAt = new Date();
      }
    }
    if (data.eventLimitExempt != null) updateData.eventLimitExempt = data.eventLimitExempt;

    const cartel = data.cartel ?? (data.bandIds != null ? data.bandIds.map((bandId) => ({ type: "band" as const, bandId })) : undefined);
    if (cartel !== undefined) {
      await prisma.bandEvent.deleteMany({ where: { eventId: id } });
      await prisma.eventExternalBand.deleteMany({ where: { eventId: id } });
      await prisma.eventOtherLocalGenre.deleteMany({ where: { eventId: id } });
      const bandCreates = cartel
        .map((i, globalOrder) => (i.type === "band" ? { bandId: i.bandId, order: globalOrder, isHeadliner: globalOrder === 0 } : null))
        .filter((x): x is { bandId: string; order: number; isHeadliner: boolean } => x !== null);
      const externalCreates = cartel
        .map((i, globalOrder) => (i.type === "external" ? { name: i.name, order: globalOrder } : null))
        .filter((x): x is { name: string; order: number } => x !== null);
      const otherLocalCreates = cartel
        .map((i, globalOrder) => (i.type === "otherLocal" ? { name: i.name, order: globalOrder } : null))
        .filter((x): x is { name: string; order: number } => x !== null);
      if (bandCreates.length > 0) {
        await prisma.bandEvent.createMany({
          data: bandCreates.map((b) => ({ eventId: id, ...b })),
        });
      }
      if (externalCreates.length > 0) {
        await prisma.eventExternalBand.createMany({
          data: externalCreates.map((e) => ({ eventId: id, ...e })),
        });
      }
      if (otherLocalCreates.length > 0) {
        await prisma.eventOtherLocalGenre.createMany({
          data: otherLocalCreates.map((o) => ({ eventId: id, ...o })),
        });
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
