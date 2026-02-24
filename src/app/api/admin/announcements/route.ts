import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(20),
  zone: z.string().optional(),
  genres: z.array(z.string()).optional().default([]),
  contactEmail: z.string().email(),
  contactInfo: z.string().optional(),
  enableApplicationForm: z.boolean().optional().default(false),
  cacheInfo: z.string().optional(),
  equipmentInfo: z.string().optional(),
  technicalInfo: z.string().optional(),
  extraInfo: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message ?? "Datos inválidos" },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const ann = await prisma.announcement.create({
      data: {
        title: data.title,
        description: data.description,
        zone: data.zone || null,
        genres: data.genres,
        advertiserType: "NAFARROCK",
        contactEmail: data.contactEmail,
        contactInfo: data.contactInfo || null,
        enableApplicationForm: data.enableApplicationForm ?? false,
        cacheInfo: data.cacheInfo || null,
        equipmentInfo: data.equipmentInfo || null,
        technicalInfo: data.technicalInfo || null,
        extraInfo: data.extraInfo || null,
        status: "ACTIVE",
        isApproved: true,
        approvedAt: new Date(),
        createdByNafarrock: true,
      },
    });

    return NextResponse.json(ann);
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    console.error("Admin create announcement:", e);
    return NextResponse.json(
      { message: "Error al crear el anuncio" },
      { status: 500 }
    );
  }
}
