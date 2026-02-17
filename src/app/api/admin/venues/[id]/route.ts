import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { z } from "zod";
import { uniqueSlug } from "@/lib/slug";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().optional(),
  city: z.string().min(1).optional(),
  address: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  foundedYear: z.coerce.number().optional().nullable(),
  capacity: z.coerce.number().positive().optional().nullable(),
  websiteUrl: z.string().url().optional().nullable().or(z.literal("")),
  mapUrl: z.string().url().optional().nullable().or(z.literal("")),
  instagramUrl: z.string().url().optional().nullable().or(z.literal("")),
  facebookUrl: z.string().url().optional().nullable().or(z.literal("")),
  isActive: z.boolean().optional(),
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

    const venue = await prisma.venue.findUnique({ where: { id } });
    if (!venue) {
      return NextResponse.json({ message: "Sala no encontrada" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (data.name != null) updateData.name = data.name;
    if (data.city != null) updateData.city = data.city;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.foundedYear !== undefined) updateData.foundedYear = data.foundedYear;
    if (data.capacity !== undefined) updateData.capacity = data.capacity;
    if (data.websiteUrl !== undefined) updateData.websiteUrl = cleanUrl(data.websiteUrl);
    if (data.mapUrl !== undefined) updateData.mapUrl = cleanUrl(data.mapUrl);
    if (data.instagramUrl !== undefined) updateData.instagramUrl = cleanUrl(data.instagramUrl);
    if (data.facebookUrl !== undefined) updateData.facebookUrl = cleanUrl(data.facebookUrl);
    if (data.isActive != null) updateData.isActive = data.isActive;
    if (data.approved != null) {
      updateData.approved = data.approved;
      if (data.approved) {
        updateData.approvedAt = new Date();
        updateData.approvedBy = session.user.id;
      }
    }
    if (data.slug != null && data.slug !== venue.slug) {
      const slug = await uniqueSlug(
        (s) => prisma.venue.findUnique({ where: { slug: s } }).then(Boolean),
        data.slug
      );
      updateData.slug = slug;
    }

    const updated = await prisma.venue.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    console.error("Admin update venue:", e);
    return NextResponse.json(
      { message: "Error al actualizar la sala" },
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

    const venue = await prisma.venue.findUnique({ where: { id } });
    if (!venue) {
      return NextResponse.json({ message: "Sala no encontrada" }, { status: 404 });
    }

    await prisma.venue.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    console.error("Admin delete venue:", e);
    return NextResponse.json(
      { message: "Error al eliminar la sala" },
      { status: 500 }
    );
  }
}
