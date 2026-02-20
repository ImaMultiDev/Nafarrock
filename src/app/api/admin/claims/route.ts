import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();
    const claims = await prisma.profileClaim.findMany({
      where: { status: "PENDING_CLAIM" },
      include: {
        user: { select: { id: true, email: true, name: true } },
        band: { select: { id: true, name: true, slug: true } },
        venue: { select: { id: true, name: true, slug: true, city: true } },
        festival: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(claims);
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    console.error("[admin claims GET]", e);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
