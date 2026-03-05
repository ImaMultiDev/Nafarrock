import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { searchEventsInRegion } from "@/lib/ticketmaster";

export type DiscoveryEventItem = {
  id: string;
  name: string;
  url: string;
  startDate: string | null;
  imageUrl: string | null;
  venueName: string | null;
  venueCity: string | null;
  isRegistered: boolean;
};

export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const apiKey = process.env.TICKETMASTER_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({
      events: [],
      message: "Ticketmaster API no configurada. Añade TICKETMASTER_API_KEY en .env",
    });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(0, parseInt(searchParams.get("page") ?? "0", 10) || 0);

  try {
    const tmEvents = await searchEventsInRegion(apiKey, 5, page);

    const events: DiscoveryEventItem[] = await Promise.all(
      tmEvents.map(async (e) => {
        const existing = await prisma.event.findFirst({
          where: {
            OR: [
              { ticketUrl: { contains: e.id } },
              { ticketUrl: { contains: e.url } },
            ],
          },
        });
        const isRegistered = !!existing;

        return {
          id: e.id,
          name: e.name,
          url: e.url,
          startDate: e.startDate ?? null,
          imageUrl: e.imageUrl ?? null,
          venueName: e.venueName ?? null,
          venueCity: e.venueCity ?? null,
          isRegistered,
        };
      })
    );

    return NextResponse.json({
      events,
      message: events.length === 0 ? "No se encontraron eventos en la región." : undefined,
    });
  } catch (err) {
    console.error("[event-discovery] Error:", err);
    return NextResponse.json(
      { events: [], message: "Error al buscar eventos." },
      { status: 500 }
    );
  }
}
