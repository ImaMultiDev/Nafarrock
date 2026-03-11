import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { z } from "zod";

function cleanUrl(s: string | null | undefined): string | null {
  if (s == null || s.trim() === "") return null;
  return s;
}

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  descriptionEu: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  foundedYear: z.coerce.number().optional().nullable(),
  logoUrl: z.string().url().optional().nullable().or(z.literal("")),
  images: z.array(z.string().url()).optional(),
  websiteUrl: z.string().url().optional().nullable().or(z.literal("")),
  instagramUrl: z.string().url().optional().nullable().or(z.literal("")),
  facebookUrl: z.string().url().optional().nullable().or(z.literal("")),
  approved: z.boolean().optional(),
});

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

    const festival = await prisma.festival.findUnique({ where: { id } });
    if (!festival) {
      return NextResponse.json({ message: "Festival no encontrado" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (data.name != null) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.descriptionEu !== undefined) updateData.descriptionEu = data.descriptionEu;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;
    if (data.foundedYear !== undefined) updateData.foundedYear = data.foundedYear;
    if (data.logoUrl !== undefined) updateData.logoUrl = cleanUrl(data.logoUrl);
    if (data.images !== undefined) updateData.images = data.images ?? [];
    if (data.websiteUrl !== undefined) updateData.websiteUrl = cleanUrl(data.websiteUrl);
    if (data.instagramUrl !== undefined) updateData.instagramUrl = cleanUrl(data.instagramUrl);
    if (data.facebookUrl !== undefined) updateData.facebookUrl = cleanUrl(data.facebookUrl);
    if (data.approved != null) {
      updateData.approved = data.approved;
      if (data.approved) {
        updateData.approvedAt = new Date();
        updateData.approvedBy = session.user.id;
      }
    }

    const updated = await prisma.festival.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    console.error("Admin update festival:", e);
    return NextResponse.json(
      { message: "Error al actualizar el festival" },
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

    const festival = await prisma.festival.findUnique({ where: { id } });
    if (!festival) {
      return NextResponse.json({ message: "Festival no encontrado" }, { status: 404 });
    }

    await prisma.festival.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    console.error("Admin delete festival:", e);
    return NextResponse.json(
      { message: "Error al borrar el festival" },
      { status: 500 }
    );
  }
}
