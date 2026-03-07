import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slug";
import { z } from "zod";
import { bandLocationSchema } from "@/lib/band-locations";

const createSchema = z.object({
  name: z.string().min(1, "Nombre obligatorio"),
  bio: z.string().optional(),
  genres: z.array(z.string()).default([]),
  location: bandLocationSchema,
  foundedYear: z.coerce.number().min(1900).max(new Date().getFullYear()).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "PAUSED"]).optional().default("ACTIVE"),
  logoUrl: z.string().url().optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  images: z.array(z.string().url()).optional().default([]),
  spotifyUrl: z.string().url().optional().or(z.literal("")),
  bandcampUrl: z.string().url().optional().or(z.literal("")),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  facebookUrl: z.string().url().optional().or(z.literal("")),
  youtubeUrl: z.string().url().optional().or(z.literal("")),
  webUrl: z.string().url().optional().or(z.literal("")),
  merchUrl: z.string().url().optional().or(z.literal("")),
  featuredVideoUrl: z.string().url().optional().or(z.literal("")),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Debes iniciar sesión" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.errors[0];
      return NextResponse.json(
        { message: first?.message ?? "Datos inválidos", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const slug = await uniqueSlug(
      (s) => prisma.band.findUnique({ where: { slug: s } }).then(Boolean),
      data.name
    );

    await prisma.band.create({
      data: {
        slug,
        name: data.name,
        bio: data.bio || null,
        genres: data.genres,
        location: data.location,
        foundedYear: data.foundedYear || null,
        logoUrl: data.logoUrl || null,
        imageUrl: data.imageUrl || null,
        images: data.images ?? [],
        spotifyUrl: data.spotifyUrl || null,
        bandcampUrl: data.bandcampUrl || null,
        instagramUrl: data.instagramUrl || null,
        facebookUrl: data.facebookUrl || null,
        youtubeUrl: data.youtubeUrl || null,
        webUrl: data.webUrl || null,
        merchUrl: data.merchUrl || null,
        featuredVideoUrl: data.featuredVideoUrl || null,
        status: data.status ?? "ACTIVE",
        isActive: data.status !== "INACTIVE",
        isEmerging: false,
        approved: false,
        approvedAt: null,
        approvedBy: null,
        createdByNafarrock: false,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, message: "Propuesta enviada. El administrador la revisará." });
  } catch (e) {
    console.error("Proposal band:", e);
    return NextResponse.json(
      { message: "Error al enviar la propuesta" },
      { status: 500 }
    );
  }
}
