"use client";

import { ImageUpload } from "./ImageUpload";

type ImageGalleryProps = {
  folder: "bands" | "venues" | "events" | "festivals" | "promoters" | "organizers";
  entityId: string;
  images: string[];
  onChange: (images: string[]) => void;
  label?: string;
  maxImages?: number;
  className?: string;
};

export function ImageGallery({
  folder,
  entityId,
  images,
  onChange,
  label = "Galería",
  maxImages = 3,
  className = "",
}: ImageGalleryProps) {
  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const addImage = (url: string) => {
    if (images.length < maxImages) {
      onChange([...images, url]);
    }
  };

  return (
    <div className={className}>
      <label className="block font-punch text-xs uppercase tracking-widest text-punk-white/70">
        {label} ({images.length}/{maxImages})
      </label>
      <div className="mt-2 flex flex-wrap gap-4">
        {images.map((url, i) => (
          <div key={i} className="relative">
            <img
              src={url}
              alt={`Imagen ${i + 1}`}
              className="h-24 w-24 object-cover border-2 border-punk-green/50"
            />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute -right-1 -top-1 rounded-full bg-punk-red px-1.5 py-0.5 text-xs text-punk-white hover:bg-punk-blood"
            >
              ✕
            </button>
          </div>
        ))}
        {images.length < maxImages && (
          <ImageUpload
            folder={folder}
            type="image"
            entityId={entityId}
            currentImageCount={images.length}
            value=""
            onChange={addImage}
            label=""
          />
        )}
      </div>
    </div>
  );
}
