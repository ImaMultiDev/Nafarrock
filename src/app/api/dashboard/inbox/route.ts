import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Debes iniciar sesión" }, { status: 401 });
    }

    const messages = await prisma.inboxMessage.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    const unreadCount = messages.filter((m) => !m.readAt).length;

    return NextResponse.json({ messages, unreadCount });
  } catch (e) {
    console.error("Inbox:", e);
    return NextResponse.json({ message: "Error al cargar el buzón" }, { status: 500 });
  }
}
