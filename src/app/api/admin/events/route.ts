import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { z } from "zod";
import { uniqueSlug } from "@/lib/slug";
import { startOfToday } from "@/lib/date";

type CartelItem =
  | { type: "band"; bandId: string }
  | { type: "external"; name: string }
  | { type: "otherLocal"; name: string };

function buildBandEventsFromCartel(cartel: CartelItem[]) {
  return cartel
    .map((i, globalOrder) => (i.type === "band" ? { ...i, globalOrder } : null))
    .filter((x): x is { type: "band"; bandId: string; globalOrder: number } => x !== null)
    .map((i, idx) => ({
      bandId: i.bandId,
      order: i.globalOrder,
      isHeadliner: i.globalOrder === 0,
    }));
}

function buildExternalBandsFromCartel(cartel: CartelItem[]) {
  return cartel
    .map((i, globalOrder) => (i.type === "external" ? { ...i, globalOrder } : null))
    .filter((x): x is { type: "external"; name: string; globalOrder: number } => x !== null)
    .map((i) => ({
      name: i.name,
      order: i.globalOrder,
    }));
}

function buildOtherLocalGenresFromCartel(cartel: CartelItem[]) {
  return cartel
    .map((i, globalOrder) => (i.type === "otherLocal" ? { ...i, globalOrder } : null))
    .filter((x): x is { type: "otherLocal"; name: string; globalOrder: number } => x !== null)
    .map((i) => ({
      name: i.name,
      order: i.globalOrder,
    }));
}

const createSchema = z.object({
  title: z.string().min(1),
  type: z.enum(["CONCIERTO", "FESTIVAL"]),
  date: z.union([z.string(), z.coerce.date()]).refine(
    (d) => new Date(d) >= startOfToday(),
    { message: "La fecha del evento no puede ser anterior a hoy" }
  ),
  endDate: z.union([z.string(), z.coerce.date()]).optional(),
  venueId: z.string().optional().nullable().or(z.literal("")),
  venueText: z.string().optional().nullable().or(z.literal("")),
  festivalId: z.string().optional().nullable(),
  doorsOpen: z.string().optional(),
  description: z.string().optional(),
  descriptionEu: z.string().optional(),
  price: z.string().optional(),
  ticketUrl: z.string().url().optional().or(z.literal("")),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  facebookUrl: z.string().url().optional().or(z.literal("")),
  twitterUrl: z.string().url().optional().or(z.literal("")),
  webUrl: z.string().url().optional().or(z.literal("")),
  imageUrl: z.string().optional().nullable(),
  images: z.array(z.string()).optional().default([]),
  isSoldOut: z.boolean().optional().default(false),
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

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
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

    const slug = await uniqueSlug(
      (s) => prisma.event.findUnique({ where: { slug: s } }).then(Boolean),
      `${data.title}-${new Date(data.date).getFullYear()}`
    );

    const event = await prisma.event.create({
      data: {
        slug,
        title: data.title,
        type: data.type,
        date: eventDate,
        endDate: eventEndDate,
        venueId: null,
        venueText: (data.venueText && data.venueText.trim()) ? data.venueText.trim() : null,
        festivalId: data.festivalId || null,
        doorsOpen: data.doorsOpen || null,
        description: data.description || null,
        descriptionEu: data.descriptionEu || null,
        price: data.price || null,
        ticketUrl: data.ticketUrl || null,
        instagramUrl: data.instagramUrl || null,
        facebookUrl: data.facebookUrl || null,
        twitterUrl: data.twitterUrl || null,
        webUrl: data.webUrl || null,
        imageUrl: data.imageUrl || null,
        images: data.images ?? [],
        isSoldOut: data.isSoldOut ?? false,
        isApproved: true,
        approvedAt: new Date(),
        createdByNafarrock: true,
        eventLimitExempt: true,
        bands: {
          create: buildBandEventsFromCartel(data.cartel ?? (data.bandIds ?? []).map((bandId) => ({ type: "band" as const, bandId }))),
        },
        externalBands: {
          create: buildExternalBandsFromCartel(data.cartel ?? []),
        },
        otherLocalGenres: {
          create: buildOtherLocalGenresFromCartel(data.cartel ?? []),
        },
      },
    });

    return NextResponse.json(event);
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    const message = e instanceof Error ? e.message : "Error al crear el evento";
    return NextResponse.json(
      { message: typeof message === "string" ? message : "Error al crear el evento" },
      { status: 500 }
    );
  }
}
