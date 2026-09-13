import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { uniqueSlug } from "@/lib/slug";
import type { FestivalImportRow } from "@/lib/csv-festivals";
import { z } from "zod";

const optionalUrl = z
  .string()
  .url()
  .optional()
  .or(z.literal(""))
  .or(z.undefined())
  .nullable();

const importSchema = z.array(
  z.object({
    nombre: z.string().min(1),
    ubicacion: z.string().nullable().optional(),
    descripcion: z.string().nullable().optional(),
    anio_fundacion: z.number().int().nullable().optional(),
    fecha_inicio: z.coerce.date().nullable().optional(),
    fecha_fin: z.coerce.date().nullable().optional(),
    web_url: optionalUrl,
    instagram_url: optionalUrl,
    facebook_url: optionalUrl,
    logo_url: optionalUrl,
    imagenes: z.array(z.string().url()).optional().default([]),
    latitud: z.number().nullable().optional(),
    longitud: z.number().nullable().optional(),
  })
);

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();

    const body = await req.json();
    const parsed = importSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Datos inválidos", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const rows = parsed.data as FestivalImportRow[];
    const created: string[] = [];
    const eventsCreated: string[] = [];
    const failed: { row: number; message: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      try {
        const slug = await uniqueSlug(
          (s) => prisma.festival.findUnique({ where: { slug: s } }).then(Boolean),
          row.nombre
        );

        const festival = await prisma.festival.create({
          data: {
            slug,
            name: row.nombre,
            location: row.ubicacion ?? null,
            description: row.descripcion ?? null,
            foundedYear: row.anio_fundacion ?? null,
            websiteUrl: row.web_url || null,
            instagramUrl: row.instagram_url || null,
            facebookUrl: row.facebook_url || null,
            logoUrl: row.logo_url || null,
            images: row.imagenes ?? [],
            latitude: row.latitud ?? null,
            longitude: row.longitud ?? null,
            approved: true,
            approvedAt: new Date(),
            approvedBy: session.user?.id ?? null,
            createdByNafarrock: true,
            userId: null,
          },
        });

        created.push(row.nombre);

        if (row.fecha_inicio) {
          const year = row.fecha_inicio.getUTCFullYear();
          const eventTitle = `${row.nombre} ${year}`;
          const eventSlug = await uniqueSlug(
            (s) => prisma.event.findUnique({ where: { slug: s } }).then(Boolean),
            eventTitle
          );

          await prisma.event.create({
            data: {
              slug: eventSlug,
              title: eventTitle,
              description: row.descripcion ?? null,
              type: "FESTIVAL",
              date: row.fecha_inicio,
              endDate: row.fecha_fin ?? null,
              venueText: row.ubicacion ?? null,
              websiteUrl: row.web_url || null,
              instagramUrl: row.instagram_url || null,
              facebookUrl: row.facebook_url || null,
              imageUrl: row.logo_url || null,
              images: [],
              festivalId: festival.id,
              isApproved: true,
              approvedAt: new Date(),
              createdByNafarrock: true,
              createdByUserId: session.user?.id ?? null,
            },
          });

          eventsCreated.push(eventTitle);
        }
      } catch (e) {
        failed.push({
          row: rowNum,
          message: e instanceof Error ? e.message : "Error desconocido",
        });
      }
    }

    return NextResponse.json({
      created: created.length,
      eventsCreated: eventsCreated.length,
      failed: failed.length,
      createdNames: created,
      eventNames: eventsCreated,
      failedDetails: failed,
    });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    console.error("Bulk import festivals:", e);
    return NextResponse.json(
      { message: "Error al importar festivales" },
      { status: 500 }
    );
  }
}
