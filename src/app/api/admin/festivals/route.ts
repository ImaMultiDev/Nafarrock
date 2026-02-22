import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { z } from "zod";
import { uniqueSlug } from "@/lib/slug";

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  location: z.string().optional(),
  foundedYear: z.coerce.number().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  images: z.array(z.string().url()).optional().default([]),
  websiteUrl: z.string().url().optional().or(z.literal("")),
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
      (s) => prisma.festival.findUnique({ where: { slug: s } }).then(Boolean),
      data.name
    );

    const festival = await prisma.festival.create({
      data: {
        slug,
        name: data.name,
        description: data.description || null,
        location: data.location || null,
        foundedYear: data.foundedYear || null,
        logoUrl: data.logoUrl || null,
        images: data.images ?? [],
        websiteUrl: data.websiteUrl || null,
        instagramUrl: data.instagramUrl || null,
        facebookUrl: data.facebookUrl || null,
        approved: true,
        approvedAt: new Date(),
        approvedBy: session.user.id,
        createdByNafarrock: true,
        userId: null,
      },
    });

    return NextResponse.json(festival);
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    console.error("Admin create festival:", e);
    return NextResponse.json(
      { message: "Error al crear el festival" },
      { status: 500 }
    );
  }
}
