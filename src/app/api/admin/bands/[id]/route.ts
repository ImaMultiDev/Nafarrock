import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { z } from "zod";
import { uniqueSlug } from "@/lib/slug";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().optional(),
  bio: z.string().optional().nullable(),
  genres: z.array(z.string()).optional(),
  location: z.string().optional().nullable(),
  foundedYear: z.coerce.number().optional().nullable(),
  logoUrl: z.string().url().optional().nullable().or(z.literal("")),
  imageUrl: z.string().url().optional().nullable().or(z.literal("")),
  images: z.array(z.string().url()).optional(),
  spotifyUrl: z.string().url().optional().nullable().or(z.literal("")),
  bandcampUrl: z.string().url().optional().nullable().or(z.literal("")),
  instagramUrl: z.string().url().optional().nullable().or(z.literal("")),
  facebookUrl: z.string().url().optional().nullable().or(z.literal("")),
  youtubeUrl: z.string().url().optional().nullable().or(z.literal("")),
  webUrl: z.string().url().optional().nullable().or(z.literal("")),
  merchUrl: z.string().url().optional().nullable().or(z.literal("")),
  status: z.enum(["ACTIVE", "INACTIVE", "PAUSED"]).optional(),
  isActive: z.boolean().optional(),
  isEmerging: z.boolean().optional(),
  approved: z.boolean().optional(),
});

function cleanUrl(s: string | null | undefined): string | null {
  if (s == null || s.trim() === "") return null;
  return s;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Datos inválidos", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const band = await prisma.band.findUnique({ where: { id } });
    if (!band) {
      return NextResponse.json({ message: "Banda no encontrada" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (data.name != null) updateData.name = data.name;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.genres != null) updateData.genres = data.genres;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.foundedYear !== undefined) updateData.foundedYear = data.foundedYear;
    if (data.logoUrl !== undefined) updateData.logoUrl = cleanUrl(data.logoUrl);
    if (data.imageUrl !== undefined) updateData.imageUrl = cleanUrl(data.imageUrl);
    if (data.images !== undefined) updateData.images = data.images ?? [];
    if (data.spotifyUrl !== undefined) updateData.spotifyUrl = cleanUrl(data.spotifyUrl);
    if (data.bandcampUrl !== undefined) updateData.bandcampUrl = cleanUrl(data.bandcampUrl);
    if (data.instagramUrl !== undefined) updateData.instagramUrl = cleanUrl(data.instagramUrl);
    if (data.facebookUrl !== undefined) updateData.facebookUrl = cleanUrl(data.facebookUrl);
    if (data.youtubeUrl !== undefined) updateData.youtubeUrl = cleanUrl(data.youtubeUrl);
    if (data.webUrl !== undefined) updateData.webUrl = cleanUrl(data.webUrl);
    if (data.merchUrl !== undefined) updateData.merchUrl = cleanUrl(data.merchUrl);
    if (data.status !== undefined) updateData.status = data.status;
    if (data.isActive != null) updateData.isActive = data.isActive;
    if (data.isEmerging != null) updateData.isEmerging = data.isEmerging;
    if (data.approved != null) {
      updateData.approved = data.approved;
      if (data.approved) {
        updateData.approvedAt = new Date();
        updateData.approvedBy = session.user.id;
      }
    }
    if (data.slug != null && data.slug !== band.slug) {
      const slug = await uniqueSlug(
        (s) => prisma.band.findUnique({ where: { slug: s } }).then(Boolean),
        data.slug
      );
      updateData.slug = slug;
    }

    const updated = await prisma.band.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    console.error("Admin update band:", e);
    return NextResponse.json(
      { message: "Error al actualizar la banda" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const band = await prisma.band.findUnique({ where: { id } });
    if (!band) {
      return NextResponse.json({ message: "Banda no encontrada" }, { status: 404 });
    }

    await prisma.band.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    console.error("Admin delete band:", e);
    return NextResponse.json(
      { message: "Error al eliminar la banda" },
      { status: 500 }
    );
  }
}
