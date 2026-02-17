/**
 * Cloudinary - Configuración y helpers de upload
 * Estructura: nafarrock/{tipo}/{entityId}/{filename}
 */
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export type UploadFolder =
  | "bands"
  | "venues"
  | "events"
  | "festivals"
  | "promoters"
  | "organizers";

const MAX_IMAGES = 3; // Máximo de imágenes en galería por entidad
const MAX_FILE_SIZE_MB = 5;

export function getUploadFolder(
  folder: UploadFolder,
  entityId: string | null
): string {
  const base = `nafarrock/${folder}`;
  return entityId ? `${base}/${entityId}` : `${base}/pending/${Date.now()}`;
}

export function validateImageCount(currentCount: number): boolean {
  return currentCount < MAX_IMAGES;
}

export function getMaxImages(): number {
  return MAX_IMAGES;
}

export async function uploadFromBuffer(
  buffer: Buffer,
  options: {
    folder: string;
    publicId?: string;
    resourceType?: "image" | "auto";
  }
): Promise<{ url: string; secureUrl: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: options.folder,
      public_id: options.publicId,
      resource_type: options.resourceType ?? "image",
      overwrite: true,
    };

    cloudinary.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (error) return reject(error);
        if (!result?.secure_url) return reject(new Error("Upload failed"));
        resolve({
          url: result.url,
          secureUrl: result.secure_url,
          publicId: result.public_id,
        });
      })
      .end(buffer);
  });
}

export async function deleteByPublicId(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
