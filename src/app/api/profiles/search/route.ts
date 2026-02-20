import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const querySchema = z.object({
  type: z.enum(["BAND", "VENUE", "FESTIVAL"]),
  q: z.string().min(1).max(100),
});

/** Busca perfiles sin propietario por nombre y tipo para reclamación */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse({
      type: searchParams.get("type"),
      q: searchParams.get("q")?.trim() || "",
    });
    if (!parsed.success || !parsed.data.q) {
      return NextResponse.json({ type: parsed.data?.type, items: [] });
    }
    const { type, q } = parsed.data;

    if (type === "BAND") {
      const bands = await prisma.band.findMany({
        where: {
          userId: null,
          name: { contains: q, mode: "insensitive" },
          approved: true,
        },
        select: { id: true, name: true, slug: true, location: true, genres: true },
        take: 10,
        orderBy: { name: "asc" },
      });
      return NextResponse.json({ type: "BAND", items: bands });
    }
    if (type === "VENUE") {
      const venues = await prisma.venue.findMany({
        where: {
          userId: null,
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { city: { contains: q, mode: "insensitive" } },
          ],
          approved: true,
        },
        select: { id: true, name: true, slug: true, city: true },
        take: 10,
        orderBy: { name: "asc" },
      });
      return NextResponse.json({ type: "VENUE", items: venues });
    }
    if (type === "FESTIVAL") {
      const festivals = await prisma.festival.findMany({
        where: {
          userId: null,
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { location: { contains: q, mode: "insensitive" } },
          ],
          approved: true,
        },
        select: { id: true, name: true, slug: true, location: true },
        take: 10,
        orderBy: { name: "asc" },
      });
      return NextResponse.json({ type: "FESTIVAL", items: festivals });
    }
    return NextResponse.json({ type, items: [] });
  } catch (e) {
    console.error("[profiles/search]", e);
    return NextResponse.json({ type: "BAND", items: [] });
  }
}
