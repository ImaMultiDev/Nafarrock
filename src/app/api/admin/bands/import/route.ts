import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { uniqueSlug } from "@/lib/slug";
import type { BandImportRow } from "@/lib/csv-bands";
import { z } from "zod";

const importSchema = z.array(
  z.object({
    nombre: z.string().min(1),
    biografia: z.string().optional(),
    logo_url: z.string().url().optional().or(z.literal("")),
    imagen_url: z.string().url().optional().or(z.literal("")),
    localidad: z.string().optional(),
    año_fundacion: z.number().optional(),
    estado: z.enum(["ACTIVE", "PAUSED", "INACTIVE"]).optional(),
    generos: z.array(z.string()),
    spotify_url: z.string().url().optional().or(z.literal("")),
    instagram_url: z.string().url().optional().or(z.literal("")),
    youtube_url: z.string().url().optional().or(z.literal("")),
    web_url: z.string().url().optional().or(z.literal("")),
    merch_url: z.string().url().optional().or(z.literal("")),
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

    const rows = parsed.data as BandImportRow[];
    const created: string[] = [];
    const failed: { row: number; message: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // +2 porque fila 1 es header y el array es 0-based

      try {
        const slug = await uniqueSlug(
          (s) => prisma.band.findUnique({ where: { slug: s } }).then(Boolean),
          row.nombre
        );

        await prisma.band.create({
          data: {
            slug,
            name: row.nombre,
            bio: row.biografia || null,
            genres: row.generos,
            location: row.localidad || null,
            foundedYear: row.año_fundacion ?? null,
            logoUrl: row.logo_url || null,
            imageUrl: row.imagen_url || null,
            images: [],
            spotifyUrl: row.spotify_url || null,
            instagramUrl: row.instagram_url || null,
            youtubeUrl: row.youtube_url || null,
            webUrl: row.web_url || null,
            merchUrl: row.merch_url || null,
            status: row.estado ?? "ACTIVE",
            isActive: row.estado !== "INACTIVE",
            isEmerging: false,
            approved: false,
            approvedAt: null,
            approvedBy: null,
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
    console.error("Bulk import bands:", e);
    return NextResponse.json(
      { message: "Error al importar bandas" },
      { status: 500 }
    );
  }
}
