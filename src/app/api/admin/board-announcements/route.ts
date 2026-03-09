import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { bandLocationSchema } from "@/lib/band-locations";
import { z } from "zod";

const categorySchema = z.enum(["SE_BUSCA_MUSICO", "SE_BUSCAN_BANDAS", "CONCURSO", "LOCAL_MATERIAL", "SERVICIOS", "OTROS"]);

const createSchema = z.object({
  title: z.string().min(1, "Título obligatorio").max(200),
  category: categorySchema,
  territory: bandLocationSchema,
  description: z.string().min(1, "Descripción obligatoria").max(5000),
  contactEmail: z.string().email("Email de contacto obligatorio"),
  imageUrl: z.string().url().optional().nullable().or(z.literal("")),
  images: z.array(z.string().url()).optional().default([]),
});

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.errors[0];
      return NextResponse.json(
        { message: first?.message ?? "Datos inválidos" },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const announcement = await prisma.boardAnnouncement.create({
      data: {
        title: data.title,
        category: data.category,
        territory: data.territory ?? null,
        description: data.description,
        contactEmail: data.contactEmail,
        imageUrl: data.imageUrl && data.imageUrl.trim() ? data.imageUrl : null,
        images: data.images ?? [],
        approved: true,
        approvedAt: new Date(),
        approvedBy: session.user.id,
      },
    });

    return NextResponse.json(announcement);
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    console.error("Admin create board announcement:", e);
    return NextResponse.json(
      { message: "Error al crear el anuncio" },
      { status: 500 }
    );
  }
}
