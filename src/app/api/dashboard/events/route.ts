import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slug";
import { canUserCreateEvent } from "@/lib/validated-event";
import { startOfToday } from "@/lib/date";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1),
  type: z.enum(["CONCIERTO", "FESTIVAL"]),
  date: z.union([z.string(), z.coerce.date()]).refine(
    (d) => new Date(d) >= startOfToday(),
    { message: "La fecha del evento no puede ser anterior a hoy" }
  ),
  endDate: z.union([z.string(), z.coerce.date()]).optional(),
  venueId: z.string().optional().nullable().or(z.literal("")),
  doorsOpen: z.string().optional(),
  description: z.string().optional(),
  price: z.string().optional(),
  ticketUrl: z.string().url().optional().or(z.literal("")),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  facebookUrl: z.string().url().optional().or(z.literal("")),
  twitterUrl: z.string().url().optional().or(z.literal("")),
  webUrl: z.string().url().optional().or(z.literal("")),
  imageUrl: z.string().optional().nullable(),
  images: z.array(z.string()).optional().default([]),
  isSoldOut: z.boolean().optional().default(false),
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
      const flat = parsed.error.flatten();
      const firstMsg = Object.values(flat.fieldErrors).flat()[0] ?? flat.formErrors[0] ?? "Datos inválidos";
      return NextResponse.json(
        { message: firstMsg, errors: flat },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const eventDate = new Date(data.date);
    const eventEndDate = data.endDate ? new Date(data.endDate) : null;
    if (eventEndDate && eventEndDate < eventDate) {
      return NextResponse.json(
        { message: "La fecha de fin debe ser posterior a la de inicio" },
        { status: 400 }
      );
    }
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
        associationProfile: true,
      },
    });

    const role = user?.role as string;

    const venueId = (data.venueId && data.venueId.trim()) ? data.venueId : null;

    if (role === "SALA" && venueId) {
      const myVenue = user?.venueProfile;
      if (!myVenue || myVenue.id !== venueId) {
        return NextResponse.json(
          { message: "Como sala, solo puedes crear eventos en tu propia sala." },
          { status: 403 }
        );
      }
    }

    if (venueId) {
      const venue = await prisma.venue.findUnique({
        where: { id: venueId },
      });
      if (!venue || !venue.approved) {
        return NextResponse.json(
          { message: "La sala seleccionada no existe o no está aprobada." },
          { status: 400 }
        );
      }
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
        endDate: eventEndDate,
        venueId,
        doorsOpen: data.doorsOpen || null,
        description: data.description || null,
        price: data.price || null,
        ticketUrl: data.ticketUrl || null,
        instagramUrl: data.instagramUrl || null,
        facebookUrl: data.facebookUrl || null,
        twitterUrl: data.twitterUrl || null,
        webUrl: data.webUrl || null,
        imageUrl: data.imageUrl || null,
        images: data.images ?? [],
        isSoldOut: data.isSoldOut ?? false,
        isApproved: false,
        createdByUserId: session.user.id,
        promoterId: role === "PROMOTOR" ? user?.promoterProfile?.id : undefined,
        organizerId: role === "ORGANIZADOR" ? user?.organizerProfile?.id : undefined,
        festivalId: role === "FESTIVAL" ? user?.festivalProfile?.id : undefined,
        associationId: role === "ASOCIACION" ? user?.associationProfile?.id : undefined,
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
