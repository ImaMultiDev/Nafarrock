import { NextRequest, NextResponse } from "next/server";
import { getBands } from "@/services/band.service";
import { isValidBandLocation } from "@/lib/band-locations";

/** API para listado de bandas (paginado) - usado por mobile infinite scroll */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const search = searchParams.get("search")?.trim() || undefined;
    const location = searchParams.get("location")?.trim() || undefined;
    const pageSize = Math.min(50, Math.max(10, parseInt(searchParams.get("pageSize") ?? "12", 10) || 12));

    const validLocation = location && isValidBandLocation(location) ? location : undefined;

    const { items, total } = await getBands({
      search,
      location: validLocation,
      page,
      pageSize,
    });

    return NextResponse.json({
      items: items.map((b) => ({
        id: b.id,
        slug: b.slug,
        name: b.name,
        genres: b.genres,
        location: b.location,
        logoUrl: b.logoUrl,
        imageUrl: b.imageUrl,
        images: b.images,
      })),
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    });
  } catch (err) {
    console.error("[API /bandas]", err);
    return NextResponse.json({ error: "Error al cargar bandas" }, { status: 500 });
  }
}
