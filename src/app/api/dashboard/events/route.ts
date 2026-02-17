import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slug";
import { canUserCreateEvent } from "@/lib/validated-event";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1),
  type: z.enum(["CONCIERTO", "FESTIVAL"]),
  date: z.union([z.string(), z.coerce.date()]),
  endDate: z.union([z.string(), z.coerce.date()]).optional(),
  venueId: z.string().min(1),
  doorsOpen: z.string().optional(),
  description: z.string().optional(),
  price: z.string().optional(),
  ticketUrl: z.string().url().optional().or(z.literal("")),
  bandIds: z.array(z.string()).optional().default([]),
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
        { message: "Datos inválidos", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const eventDate = new Date(data.date);
    const check = await canUserCreateEvent(session.user.id, eventDate);
    if (!check.ok) {
      return NextResponse.json({ message: check.message }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        venueProfile: true,
        promoterProfile: true,
        organizerProfile: true,
        festivalProfile: true,
      },
    });

    const role = user?.role as string;

    if (role === "SALA") {
      const myVenue = user?.venueProfile;
      if (!myVenue || myVenue.id !== data.venueId) {
        return NextResponse.json(
          { message: "Como sala, solo puedes crear eventos en tu propia sala." },
          { status: 403 }
        );
      }
    }

    const venue = await prisma.venue.findUnique({
      where: { id: data.venueId },
    });
    if (!venue || !venue.approved) {
      return NextResponse.json(
        { message: "La sala seleccionada no existe o no está aprobada." },
        { status: 400 }
      );
    }

    const slug = await uniqueSlug(
      (s) => prisma.event.findUnique({ where: { slug: s } }).then(Boolean),
      `${data.title}-${eventDate.getFullYear()}`
    );

    const event = await prisma.event.create({
      data: {
        slug,
        title: data.title,
        type: data.type,
        date: eventDate,
        endDate: data.endDate ? new Date(data.endDate) : null,
        venueId: data.venueId,
        doorsOpen: data.doorsOpen || null,
        description: data.description || null,
        price: data.price || null,
        ticketUrl: data.ticketUrl || null,
        isApproved: false,
        createdByUserId: session.user.id,
        promoterId: role === "PROMOTOR" ? user?.promoterProfile?.id : undefined,
        organizerId: role === "ORGANIZADOR" ? user?.organizerProfile?.id : undefined,
        festivalId: role === "FESTIVAL" ? user?.festivalProfile?.id : undefined,
        bands: {
          create: (data.bandIds ?? []).map((bandId, i) => ({
            bandId,
            order: i,
            isHeadliner: i === 0,
          })),
        },
      },
    });

    return NextResponse.json(event);
  } catch (e) {
    console.error("Dashboard create event:", e);
    return NextResponse.json(
      { message: "Error al crear el evento" },
      { status: 500 }
    );
  }
}
