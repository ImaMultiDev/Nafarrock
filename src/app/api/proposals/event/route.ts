import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slug";
import { canUserProposeEvent } from "@/lib/validated-event";
import { startOfToday } from "@/lib/date";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1, "Título obligatorio"),
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
      return NextResponse.json({ message: "Debes iniciar sesión" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.errors[0];
      return NextResponse.json(
        { message: first?.message ?? "Datos inválidos", errors: parsed.error.flatten() },
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

    const check = await canUserProposeEvent(session.user.id, eventDate);
    if (!check.ok) {
      return NextResponse.json({ message: check.message }, { status: 403 });
    }

    const venueId = (data.venueId && data.venueId.trim()) ? data.venueId : null;

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

    await prisma.event.create({
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
        createdByNafarrock: false,
        createdByUserId: session.user.id,
        bands: {
          create: (data.bandIds ?? []).map((bandId, i) => ({
            bandId,
            order: i,
            isHeadliner: i === 0,
          })),
        },
      },
    });

    return NextResponse.json({ success: true, message: "Propuesta enviada. El administrador la revisará." });
  } catch (e) {
    console.error("Proposal event:", e);
    return NextResponse.json(
      { message: "Error al enviar la propuesta" },
      { status: 500 }
    );
  }
}
