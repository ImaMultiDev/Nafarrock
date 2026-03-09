import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canUserProposeBand } from "@/lib/validated-band";
import { canUserProposeEventFromDashboard } from "@/lib/validated-event";
import { canUserProposeBoardAnnouncement } from "@/lib/validated-board-announcement";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, message: "Debes iniciar sesión" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (type === "band") {
      const result = await canUserProposeBand(session.user.id);
      return NextResponse.json(result);
    }

    if (type === "event") {
      const result = await canUserProposeEventFromDashboard(session.user.id);
      return NextResponse.json(result);
    }

    if (type === "announcement") {
      const result = await canUserProposeBoardAnnouncement(session.user.id);
      return NextResponse.json(result);
    }

    return NextResponse.json({ ok: false, message: "Tipo inválido" }, { status: 400 });
  } catch (e) {
    console.error("can-propose:", e);
    return NextResponse.json({ ok: false, message: "Error al verificar" }, { status: 500 });
  }
}
