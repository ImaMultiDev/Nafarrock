import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Debes iniciar sesión" }, { status: 401 });
    }

    const now = new Date();
    await prisma.inboxMessage.updateMany({
      where: { userId: session.user.id, readAt: null },
      data: { readAt: now },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Inbox read all:", e);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
