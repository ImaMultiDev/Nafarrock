import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getUploadFolder,
  validateImageCount,
  getMaxImages,
  uploadFromBuffer,
  type UploadFolder,
} from "@/lib/cloudinary";
import { z } from "zod";

const CLAIM_FOLDERS = ["bands", "venues", "festivals", "asociaciones"] as const;

const schema = z.object({
  folder: z.enum(CLAIM_FOLDERS),
  type: z.enum(["logo", "image"]),
  claimId: z.string().min(1),
  currentImageCount: z.coerce.number().min(0).max(3).optional().default(0),
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: Request) {
  try {
    if (
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET ||
      !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    ) {
      return NextResponse.json(
        { message: "Cloudinary no está configurado." },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = formData.get("folder") as string;
    const type = formData.get("type") as string;
    const claimId = formData.get("claimId") as string;
    const currentImageCount = formData.get("currentImageCount");

    const parsed = schema.safeParse({
      folder,
      type,
      claimId: claimId || "",
      currentImageCount: currentImageCount ? Number(currentImageCount) : 0,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Parámetros inválidos", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Verificar que el perfil existe y no tiene propietario (el claim se crea al enviar el formulario)
    if (parsed.data.folder === "bands") {
      const band = await prisma.band.findUnique({ where: { id: parsed.data.claimId } });
      if (!band) return NextResponse.json({ message: "Perfil no encontrado" }, { status: 404 });
      if (band.userId) return NextResponse.json({ message: "Este perfil ya tiene propietario" }, { status: 400 });
    } else if (parsed.data.folder === "venues") {
      const venue = await prisma.venue.findUnique({ where: { id: parsed.data.claimId } });
      if (!venue) return NextResponse.json({ message: "Perfil no encontrado" }, { status: 404 });
      if (venue.userId) return NextResponse.json({ message: "Este perfil ya tiene propietario" }, { status: 400 });
    } else if (parsed.data.folder === "asociaciones") {
      const asociacion = await prisma.asociacion.findUnique({ where: { id: parsed.data.claimId } });
      if (!asociacion) return NextResponse.json({ message: "Perfil no encontrado" }, { status: 404 });
      if (asociacion.userId) return NextResponse.json({ message: "Este perfil ya tiene propietario" }, { status: 400 });
    } else {
      const festival = await prisma.festival.findUnique({ where: { id: parsed.data.claimId } });
      if (!festival) return NextResponse.json({ message: "Perfil no encontrado" }, { status: 404 });
      if (festival.userId) return NextResponse.json({ message: "Este perfil ya tiene propietario" }, { status: 400 });
    }

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { message: "No se ha enviado ningún archivo" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "El archivo no puede superar 5 MB" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: "Formato no permitido. Usa JPG, PNG, WebP o GIF" },
        { status: 400 }
      );
    }

    if (
      parsed.data.type === "image" &&
      !validateImageCount(parsed.data.currentImageCount)
    ) {
      return NextResponse.json(
        { message: `Máximo ${getMaxImages()} imágenes` },
        { status: 400 }
      );
    }

    // Subir a nafarrock/{folder}/{claimId}/ (el entityId es el claimId)
    const uploadFolder = getUploadFolder(
      parsed.data.folder as UploadFolder,
      parsed.data.claimId
    );
    const publicId =
      parsed.data.type === "logo" ? "logo" : `img_${Date.now()}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadFromBuffer(buffer, {
      folder: uploadFolder,
      publicId,
    });

    return NextResponse.json({
      url: result.secureUrl,
      publicId: result.publicId,
    });
  } catch (e) {
    console.error("Upload claim error:", e);
    return NextResponse.json(
      { message: "Error al subir la imagen" },
      { status: 500 }
    );
  }
}
