import { NextRequest, NextResponse } from "next/server";
import { getVenues } from "@/services/venue.service";

const VENUE_CATEGORIES = ["TABERNA_BAR", "SALA_CONCIERTOS", "RECINTO_ABIERTO", "GAZTETXE", "SIN_CATEGORIA"] as const;

/** API para listado de salas (paginado) - usado por mobile infinite scroll */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const search = searchParams.get("search")?.trim() || undefined;
    const city = searchParams.get("city")?.trim() || undefined;
    const category = searchParams.get("category") || undefined;
    const capacityMin = searchParams.get("capacityMin") ? parseInt(searchParams.get("capacityMin")!, 10) : undefined;
    const capacityMax = searchParams.get("capacityMax") ? parseInt(searchParams.get("capacityMax")!, 10) : undefined;
    const pageSize = Math.min(50, Math.max(10, parseInt(searchParams.get("pageSize") ?? "12", 10) || 12));

    const validCategory =
      category && VENUE_CATEGORIES.includes(category as (typeof VENUE_CATEGORIES)[number])
        ? (category as (typeof VENUE_CATEGORIES)[number])
        : undefined;

    const { items, total } = await getVenues({
      search,
      city,
      category: validCategory,
      capacityMin: Number.isNaN(capacityMin) ? undefined : capacityMin,
      capacityMax: Number.isNaN(capacityMax) ? undefined : capacityMax,
      page,
      pageSize,
    });

    return NextResponse.json({
      items: items.map((v) => ({
        id: v.id,
        slug: v.slug,
        name: v.name,
        city: v.city,
        capacity: v.capacity,
        category: v.category,
        logoUrl: v.logoUrl,
        imageUrl: v.imageUrl,
        images: v.images,
      })),
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    });
  } catch (err) {
    console.error("[API /salas]", err);
    return NextResponse.json({ error: "Error al cargar salas" }, { status: 500 });
  }
}
