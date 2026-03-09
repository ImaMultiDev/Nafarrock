import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Debes iniciar sesión" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.inboxMessage.updateMany({
      where: { id, userId: session.user.id },
      data: { readAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Inbox mark read:", e);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
