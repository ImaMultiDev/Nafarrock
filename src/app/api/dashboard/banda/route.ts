import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slug";
import { z } from "zod";

const memberSchema = z.object({
  name: z.string().min(1),
  instrument: z.string().min(1),
  order: z.number().optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  bio: z.string().optional().nullable(),
  genres: z.array(z.string()).optional(),
  location: z.string().optional().nullable(),
  foundedYear: z.coerce.number().optional().nullable(),
  spotifyUrl: z.string().url().optional().nullable().or(z.literal("")),
  bandcampUrl: z.string().url().optional().nullable().or(z.literal("")),
  instagramUrl: z.string().url().optional().nullable().or(z.literal("")),
  facebookUrl: z.string().url().optional().nullable().or(z.literal("")),
  youtubeUrl: z.string().url().optional().nullable().or(z.literal("")),
  webUrl: z.string().url().optional().nullable().or(z.literal("")),
  logoUrl: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  images: z.array(z.string()).optional(),
  members: z.array(memberSchema).optional(),
});

function cleanUrl(s: string | null | undefined): string | null {
  if (s == null || s.trim() === "") return null;
  return s;
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const band = await prisma.band.findFirst({
      where: { userId: session.user.id },
    });
    if (!band) {
      return NextResponse.json({ message: "No tienes una banda asociada" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Datos inválidos", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const updateData: Record<string, unknown> = {};
    if (data.name != null) updateData.name = data.name;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.genres != null) updateData.genres = data.genres;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.foundedYear !== undefined) updateData.foundedYear = data.foundedYear;
    if (data.spotifyUrl !== undefined) updateData.spotifyUrl = cleanUrl(data.spotifyUrl);
    if (data.bandcampUrl !== undefined) updateData.bandcampUrl = cleanUrl(data.bandcampUrl);
    if (data.instagramUrl !== undefined) updateData.instagramUrl = cleanUrl(data.instagramUrl);
    if (data.facebookUrl !== undefined) updateData.facebookUrl = cleanUrl(data.facebookUrl);
    if (data.youtubeUrl !== undefined) updateData.youtubeUrl = cleanUrl(data.youtubeUrl);
    if (data.webUrl !== undefined) updateData.webUrl = cleanUrl(data.webUrl);
    if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.images !== undefined) updateData.images = data.images;

    if (data.name != null && data.name !== band.name) {
      const newSlug = await uniqueSlug(
        (s) => prisma.band.findFirst({ where: { slug: s, id: { not: band.id } } }).then(Boolean),
        data.name
      );
      updateData.slug = newSlug;
    }

    if (data.members !== undefined) {
      await prisma.bandMember.deleteMany({ where: { bandId: band.id } });
      if (data.members.length > 0) {
        await prisma.bandMember.createMany({
          data: data.members
            .filter((m) => m.name.trim() && m.instrument.trim())
            .map((m, i) => ({
              bandId: band.id,
              name: m.name,
              instrument: m.instrument,
              order: m.order ?? i,
            })),
        });
      }
    }

    const updated = await prisma.band.update({
      where: { id: band.id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error("Dashboard update band:", e);
    return NextResponse.json(
      { message: "Error al actualizar la banda" },
      { status: 500 }
    );
  }
}
