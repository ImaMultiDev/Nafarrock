import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { z } from "zod";
import { uniqueSlug } from "@/lib/slug";

const createSchema = z.object({
  name: z.string().min(1),
  city: z.string().min(1),
  address: z.string().optional(),
  description: z.string().optional(),
  foundedYear: z.coerce.number().optional(),
  capacity: z.coerce.number().positive().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  images: z.array(z.string().url()).optional().default([]),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  mapUrl: z.string().url().optional().or(z.literal("")),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  facebookUrl: z.string().url().optional().or(z.literal("")),
});

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Datos inválidos", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const slug = await uniqueSlug(
      (s) => prisma.venue.findUnique({ where: { slug: s } }).then(Boolean),
      data.name
    );

    const venue = await prisma.venue.create({
      data: {
        slug,
        name: data.name,
        city: data.city,
        address: data.address || null,
        description: data.description || null,
        foundedYear: data.foundedYear || null,
        capacity: data.capacity || null,
        logoUrl: data.logoUrl || null,
        imageUrl: data.imageUrl || null,
        images: data.images ?? [],
        websiteUrl: data.websiteUrl || null,
        mapUrl: data.mapUrl || null,
        instagramUrl: data.instagramUrl || null,
        facebookUrl: data.facebookUrl || null,
        approved: true,
        approvedAt: new Date(),
        approvedBy: session.user.id,
        createdByNafarrock: true,
        userId: null,
      },
    });

    return NextResponse.json(venue);
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    console.error("Admin create venue:", e);
    return NextResponse.json(
      { message: "Error al crear la sala" },
      { status: 500 }
    );
  }
}
