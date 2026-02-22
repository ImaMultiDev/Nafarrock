import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const advertiserType = searchParams.get("advertiserType"); // PROMOTER | VENUE | FESTIVAL | ORGANIZER
    const zone = searchParams.get("zone");
    const genre = searchParams.get("genre");

    const validTypes = ["PROMOTER", "VENUE", "FESTIVAL", "ORGANIZER"] as const;
    const advertiserTypeFilter =
      advertiserType && validTypes.includes(advertiserType as (typeof validTypes)[number])
        ? (advertiserType as (typeof validTypes)[number])
        : undefined;

    const where = {
      status: "ACTIVE" as const,
      isApproved: true,
      ...(advertiserTypeFilter ? { advertiserType: advertiserTypeFilter } : {}),
      ...(zone?.trim() ? { zone: { contains: zone.trim(), mode: "insensitive" as const } } : {}),
      ...(genre?.trim() ? { genres: { has: genre.trim().toLowerCase() } } : {}),
    };

    const announcements = await prisma.announcement.findMany({
      where,
      include: {
        promoter: { select: { id: true, name: true, slug: true } },
        venue: { select: { id: true, name: true, slug: true, city: true } },
        festival: { select: { id: true, name: true, slug: true } },
        organizer: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(announcements);
  } catch (e) {
    console.error("[GET announcements]", e);
    return NextResponse.json({ message: "Error al obtener anuncios" }, { status: 500 });
  }
}
