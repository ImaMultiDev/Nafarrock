import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { uniqueSlug } from "@/lib/slug";
import type { VenueImportRow } from "@/lib/csv-venues";
import { z } from "zod";

const importSchema = z.array(
  z.object({
    nombre: z.string().min(1),
    ciudad: z.string().min(1),
    direccion: z.string().optional().nullable(),
    descripcion: z.string().optional().nullable(),
    web_url: z.string().url().optional().or(z.literal("")),
    maps_url: z.string().url().optional().or(z.literal("")),
    instagram_url: z.string().url().optional().or(z.literal("")),
    facebook_url: z.string().url().optional().or(z.literal("")),
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

    const rows = parsed.data as VenueImportRow[];
    const created: string[] = [];
    const failed: { row: number; message: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // +2 porque fila 1 es header y el array es 0-based

      try {
        const slug = await uniqueSlug(
          (s) => prisma.venue.findUnique({ where: { slug: s } }).then(Boolean),
          row.nombre
        );

        await prisma.venue.create({
          data: {
            slug,
            name: row.nombre,
            city: row.ciudad,
            address: row.direccion ?? null,
            description: row.descripcion ?? null,
            websiteUrl: row.web_url || null,
            mapUrl: row.maps_url || null,
            instagramUrl: row.instagram_url || null,
            facebookUrl: row.facebook_url || null,
            isActive: true,
            approved: true,
            approvedAt: new Date(),
            approvedBy: session.user?.id ?? null,
            createdByNafarrock: true,
            userId: null,
          },
        });

        created.push(row.nombre);
      } catch (e) {
        failed.push({
          row: rowNum,
          message: e instanceof Error ? e.message : "Error desconocido",
        });
      }
    }

    return NextResponse.json({
      created: created.length,
      failed: failed.length,
      createdNames: created,
      failedDetails: failed,
    });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    console.error("Bulk import venues:", e);
    return NextResponse.json(
      { message: "Error al importar espacios" },
      { status: 500 }
    );
  }
}
