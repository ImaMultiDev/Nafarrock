import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { z } from "zod";
import { uniqueSlug } from "@/lib/slug";

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  bio: z.string().optional(),
  genres: z.array(z.string()).default([]),
  location: z.string().optional(),
  foundedYear: z.coerce.number().optional(),
  spotifyUrl: z.string().url().optional().or(z.literal("")),
  bandcampUrl: z.string().url().optional().or(z.literal("")),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  facebookUrl: z.string().url().optional().or(z.literal("")),
  youtubeUrl: z.string().url().optional().or(z.literal("")),
  webUrl: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  isEmerging: z.boolean().default(false),
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
      (s) => prisma.band.findUnique({ where: { slug: s } }).then(Boolean),
      data.slug ?? data.name
    );

    const band = await prisma.band.create({
      data: {
        slug,
        name: data.name,
        bio: data.bio || null,
        genres: data.genres,
        location: data.location || null,
        foundedYear: data.foundedYear || null,
        spotifyUrl: data.spotifyUrl || null,
        bandcampUrl: data.bandcampUrl || null,
        instagramUrl: data.instagramUrl || null,
        facebookUrl: data.facebookUrl || null,
        youtubeUrl: data.youtubeUrl || null,
        webUrl: data.webUrl || null,
        isActive: data.isActive,
        isEmerging: data.isEmerging,
        approved: true,
        approvedAt: new Date(),
        approvedBy: session.user.id,
        createdByNafarrock: true,
        userId: null,
      },
    });

    return NextResponse.json(band);
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    console.error("Admin create band:", e);
    return NextResponse.json(
      { message: "Error al crear la banda" },
      { status: 500 }
    );
  }
}
