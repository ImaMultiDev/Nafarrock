import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  foundedYear: z.coerce.number().optional().nullable(),
  websiteUrl: z.string().url().optional().nullable().or(z.literal("")),
  instagramUrl: z.string().url().optional().nullable().or(z.literal("")),
  facebookUrl: z.string().url().optional().nullable().or(z.literal("")),
  logoUrl: z.string().optional().nullable(),
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

    const festival = await prisma.festival.findFirst({
      where: { userId: session.user.id },
    });
    if (!festival) {
      return NextResponse.json({ message: "No tienes un festival asociado" }, { status: 404 });
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
    if (data.description !== undefined) updateData.description = data.description;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.foundedYear !== undefined) updateData.foundedYear = data.foundedYear;
    if (data.websiteUrl !== undefined) updateData.websiteUrl = cleanUrl(data.websiteUrl);
    if (data.instagramUrl !== undefined) updateData.instagramUrl = cleanUrl(data.instagramUrl);
    if (data.facebookUrl !== undefined) updateData.facebookUrl = cleanUrl(data.facebookUrl);
    if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl;

    const updated = await prisma.festival.update({
      where: { id: festival.id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error("Dashboard update festival:", e);
    return NextResponse.json(
      { message: "Error al actualizar el festival" },
      { status: 500 }
    );
  }
}
