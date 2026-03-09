import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ count: 0 });
    }

    const count = await prisma.inboxMessage.count({
      where: { userId: session.user.id, readAt: null },
    });

    return NextResponse.json({ count });
  } catch (e) {
    console.error("Inbox unread count:", e);
    return NextResponse.json({ count: 0 });
  }
}
