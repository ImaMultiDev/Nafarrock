import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const announcement = await prisma.announcement.findUnique({
      where: { id, status: "ACTIVE", isApproved: true },
      include: {
        promoter: { select: { id: true, name: true, slug: true } },
        venue: { select: { id: true, name: true, slug: true, city: true } },
        festival: { select: { id: true, name: true, slug: true } },
        organizer: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!announcement) {
      return NextResponse.json({ message: "Anuncio no encontrado" }, { status: 404 });
    }

    return NextResponse.json(announcement);
  } catch (e) {
    console.error("[GET announcement]", e);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
