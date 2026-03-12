import { NextRequest, NextResponse } from "next/server";
import { getFestivals } from "@/services/festival.service";

/** API para listado de festivales (paginado) - usado por mobile infinite scroll */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const search = searchParams.get("search")?.trim() || undefined;
    const pageSize = Math.min(50, Math.max(10, parseInt(searchParams.get("pageSize") ?? "12", 10) || 12));

    const { items, total } = await getFestivals(
      {
        search,
        page,
        pageSize,
      },
      true
    );

    return NextResponse.json({
      items: items.map((f) => ({
        id: f.id,
        slug: f.slug,
        name: f.name,
        location: f.location,
        logoUrl: f.logoUrl,
      })),
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    });
  } catch (err) {
    console.error("[API /festivales]", err);
    return NextResponse.json({ error: "Error al cargar festivales" }, { status: 500 });
  }
}
