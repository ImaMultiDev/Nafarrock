import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slug";
import { z } from "zod";

const VENUE_CATEGORIES = ["TABERNA_BAR", "SALA_CONCIERTOS", "RECINTO_ABIERTO", "GAZTETXE"] as const;

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  category: z.enum(VENUE_CATEGORIES).optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().min(1).optional(),
  foundedYear: z.coerce.number().optional().nullable(),
  capacity: z.coerce.number().positive().optional().nullable(),
  websiteUrl: z.string().url().optional().nullable().or(z.literal("")),
  mapUrl: z.string().url().optional().nullable().or(z.literal("")),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  instagramUrl: z.string().url().optional().nullable().or(z.literal("")),
  facebookUrl: z.string().url().optional().nullable().or(z.literal("")),
  logoUrl: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  images: z.array(z.string()).optional(),
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

    const venue = await prisma.venue.findFirst({
      where: { userId: session.user.id },
    });
    if (!venue) {
      return NextResponse.json({ message: "No tienes un espacio asociado" }, { status: 404 });
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
    if (data.address !== undefined) updateData.address = data.address;
    if (data.city != null) updateData.city = data.city;
    if (data.foundedYear !== undefined) updateData.foundedYear = data.foundedYear;
    if (data.capacity !== undefined) updateData.capacity = data.capacity;
    if (data.websiteUrl !== undefined) updateData.websiteUrl = cleanUrl(data.websiteUrl);
    if (data.mapUrl !== undefined) updateData.mapUrl = cleanUrl(data.mapUrl);
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;
    if (data.instagramUrl !== undefined) updateData.instagramUrl = cleanUrl(data.instagramUrl);
    if (data.facebookUrl !== undefined) updateData.facebookUrl = cleanUrl(data.facebookUrl);
    if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.images !== undefined) updateData.images = data.images;

    if (data.name != null && data.name !== venue.name) {
      const newSlug = await uniqueSlug(
        (s) => prisma.venue.findFirst({ where: { slug: s, id: { not: venue.id } } }).then(Boolean),
        data.name
      );
      updateData.slug = newSlug;
    }

    const updated = await prisma.venue.update({
      where: { id: venue.id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error("Dashboard update venue:", e);
    return NextResponse.json(
      { message: "Error al actualizar el espacio" },
      { status: 500 }
    );
  }
}
