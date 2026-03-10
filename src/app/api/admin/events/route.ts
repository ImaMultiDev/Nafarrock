import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { z } from "zod";
import { uniqueSlug } from "@/lib/slug";
import { startOfToday } from "@/lib/date";

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
  links: z
    .array(
      z.object({
        kind: z.enum(["instagram", "facebook", "twitter", "web"]),
        url: z.string().url(),
        label: z.string().optional().default(""),
      })
    )
    .optional()
    .default([]),
  imageUrl: z.string().optional().nullable(),
  images: z.array(z.string()).optional().default([]),
  isSoldOut: z.boolean().optional().default(false),
  bandIds: z.array(z.string()).optional().default([]),
});

export async function POST(req: Request) {
  try {
    await requireAdmin();
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

    const venueId = data.venueId && data.venueId.trim() ? data.venueId : null;
    const festivalId = data.festivalId && data.festivalId.trim() ? data.festivalId : null;
    const venueText = data.venueText && data.venueText.trim() ? data.venueText.trim() : null;

    const event = await prisma.event.create({
      data: {
        slug,
        title: data.title,
        type: data.type,
        date: eventDate,
        endDate: eventEndDate,
        venueId: venueId || null,
        venueText,
        festivalId: festivalId || null,
        doorsOpen: data.doorsOpen || null,
        description: data.description || null,
        descriptionEu: data.descriptionEu || null,
        price: data.price || null,
        ticketUrl: data.ticketUrl || null,
        imageUrl: data.imageUrl || null,
        images: data.images ?? [],
        isSoldOut: data.isSoldOut ?? false,
        isApproved: true,
        approvedAt: new Date(),
        createdByNafarrock: true,
        eventLimitExempt: true,
        bands: {
          create: (data.bandIds ?? []).map((bandId, idx) => ({
            bandId,
            order: idx,
            isHeadliner: idx === 0,
          })),
        },
        links: {
          create: (data.links ?? [])
            .filter((l) => l.url?.trim())
            .map((l) => ({
              kind: l.kind,
              url: l.url.trim(),
              label: l.label?.trim() || null,
            })),
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
