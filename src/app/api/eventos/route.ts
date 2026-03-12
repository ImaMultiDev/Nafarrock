import { NextRequest, NextResponse } from "next/server";
import { getEvents } from "@/services/event.service";

/** API para listado de eventos (paginado) - usado por mobile infinite scroll */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const type = searchParams.get("type") as "CONCIERTO" | "FESTIVAL" | null;
    const search = searchParams.get("search")?.trim() || undefined;
    const pageSize = Math.min(50, Math.max(10, parseInt(searchParams.get("pageSize") ?? "12", 10) || 12));

    const { items, total } = await getEvents({
      search,
      type: type && (type === "CONCIERTO" || type === "FESTIVAL") ? type : undefined,
      page,
      pageSize,
      includePast: false,
    });

    return NextResponse.json({
      items: items.map((e) => ({
        id: e.id,
        slug: e.slug,
        title: e.title,
        date: e.date.toISOString(),
        endDate: e.endDate?.toISOString() ?? null,
        type: e.type,
        imageUrl: e.imageUrl,
        venue: e.venue ? { name: e.venue.name, city: e.venue.city } : null,
        venueText: e.venueText,
        festival: e.festival
          ? { name: e.festival.name, slug: e.festival.slug, location: e.festival.location }
          : null,
        isSoldOut: e.isSoldOut,
      })),
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    });
  } catch (err) {
    console.error("[API /eventos]", err);
    return NextResponse.json({ error: "Error al cargar eventos" }, { status: 500 });
  }
}
