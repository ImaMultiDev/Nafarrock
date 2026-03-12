import { NextRequest, NextResponse } from "next/server";
import { getBoardAnnouncements } from "@/services/board-announcement.service";

const VALID_CATEGORIES = ["SE_BUSCA_MUSICO", "SE_BUSCAN_BANDAS", "CONCURSO", "LOCAL_MATERIAL", "SERVICIOS", "OTROS"] as const;

/** API para listado del tablón de anuncios (paginado) - usado por mobile infinite scroll */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const category = searchParams.get("category") || undefined;
    const territory = searchParams.get("territory")?.trim() || undefined;
    const pageSize = Math.min(50, Math.max(10, parseInt(searchParams.get("pageSize") ?? "12", 10) || 12));

    const validCategory =
      category && VALID_CATEGORIES.includes(category as (typeof VALID_CATEGORIES)[number])
        ? (category as (typeof VALID_CATEGORIES)[number])
        : undefined;

    const { items, total } = await getBoardAnnouncements({
      category: validCategory,
      territory,
      page,
      pageSize,
    });

    return NextResponse.json({
      items: items.map((a) => ({
        id: a.id,
        title: a.title,
        category: a.category,
        territory: a.territory,
        description: a.description,
        contactEmail: a.contactEmail,
        imageUrl: a.imageUrl,
        images: a.images,
        createdAt: a.createdAt.toISOString(),
      })),
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    });
  } catch (err) {
    console.error("[API /tablon]", err);
    return NextResponse.json({ error: "Error al cargar anuncios" }, { status: 500 });
  }
}
