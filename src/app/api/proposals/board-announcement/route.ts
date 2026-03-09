import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canUserProposeBoardAnnouncement } from "@/lib/validated-board-announcement";
import { bandLocationSchema } from "@/lib/band-locations";
import { z } from "zod";

const categorySchema = z.enum(["SE_BUSCA_MUSICO", "SE_BUSCAN_BANDAS", "CONCURSO", "LOCAL_MATERIAL", "SERVICIOS", "OTROS"]);

const createSchema = z.object({
  title: z.string().min(1, "Título obligatorio").max(200),
  category: categorySchema,
  territory: bandLocationSchema,
  description: z.string().min(1, "Descripción obligatoria").max(5000),
  contactEmail: z.string().email("Email de contacto obligatorio"),
  imageUrl: z.string().url().optional().nullable().or(z.literal("")),
  images: z.array(z.string().url()).optional().default([]),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Debes iniciar sesión" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.errors[0];
      return NextResponse.json(
        {
          message: first?.message ?? "Datos inválidos",
          errors: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const check = await canUserProposeBoardAnnouncement(session.user.id);
    if (!check.ok) {
      return NextResponse.json({ message: check.message }, { status: 403 });
    }

    await prisma.boardAnnouncement.create({
      data: {
        title: data.title,
        category: data.category,
        territory: data.territory,
        description: data.description,
        contactEmail: data.contactEmail,
        imageUrl: data.imageUrl && data.imageUrl.trim() ? data.imageUrl : null,
        images: data.images ?? [],
        approved: false,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Propuesta enviada. El administrador la revisará.",
    });
  } catch (e) {
    console.error("Proposal board announcement:", e);
    return NextResponse.json(
      { message: "Error al enviar la propuesta" },
      { status: 500 }
    );
  }
}
