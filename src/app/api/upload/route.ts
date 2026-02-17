import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getUploadFolder,
  validateImageCount,
  getMaxImages,
  uploadFromBuffer,
  type UploadFolder,
} from "@/lib/cloudinary";
import { z } from "zod";

const FOLDERS: UploadFolder[] = [
  "bands",
  "venues",
  "events",
  "festivals",
  "promoters",
  "organizers",
];

const schema = z.object({
  folder: z.enum(FOLDERS as unknown as [string, ...string[]]),
  type: z.enum(["logo", "image"]),
  entityId: z.string().optional().nullable(),
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
        { message: "Cloudinary no está configurado. Revisa las variables de entorno." },
        { status: 503 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Debes iniciar sesión para subir imágenes" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = formData.get("folder") as string;
    const type = formData.get("type") as string;
    const entityId = formData.get("entityId") as string | null;
    const currentImageCount = formData.get("currentImageCount");

    const parsed = schema.safeParse({
      folder,
      type,
      entityId: entityId || null,
      currentImageCount: currentImageCount ? Number(currentImageCount) : 0,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Parámetros inválidos", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { message: "No se ha enviado ningún archivo" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: `El archivo no puede superar 5 MB` },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: "Formato no permitido. Usa JPG, PNG, WebP o GIF" },
        { status: 400 }
      );
    }

    // Si es imagen de galería, comprobar límite
    if (
      parsed.data.type === "image" &&
      !validateImageCount(parsed.data.currentImageCount)
    ) {
      return NextResponse.json(
        {
          message: `Máximo ${getMaxImages()} imágenes por entidad`,
        },
        { status: 400 }
      );
    }

    const uploadFolder = getUploadFolder(
      parsed.data.folder as UploadFolder,
      parsed.data.entityId ?? null
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
    console.error("Upload error:", e);
    return NextResponse.json(
      { message: "Error al subir la imagen" },
      { status: 500 }
    );
  }
}
