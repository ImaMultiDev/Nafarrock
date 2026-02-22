"use client";

import { useState, useRef } from "react";

type ImageUploadProps = {
  folder: "bands" | "venues" | "events" | "festivals" | "promoters" | "organizers";
  type: "logo" | "image";
  entityId?: string | null;
  /** Modo reclamación: sube sin auth usando claimId (perfil a reclamar) */
  claimMode?: boolean;
  claimId?: string;
  currentImageCount?: number;
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  label?: string;
  maxImages?: number;
  className?: string;
};

export function ImageUpload({
  folder,
  type,
  entityId,
  claimMode,
  claimId,
  currentImageCount = 0,
  value,
  onChange,
  onRemove,
  label,
  maxImages = 3,
  className = "",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("folder", folder);
      formData.set("type", type);
      if (claimMode && claimId) {
        formData.set("claimId", claimId);
      } else if (entityId) {
        formData.set("entityId", entityId);
      }
      formData.set("currentImageCount", String(currentImageCount));

      const uploadUrl = claimMode && claimId ? "/api/upload-claim" : "/api/upload";
      const res = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message ?? "Error al subir");
      }

      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block font-punch text-xs uppercase tracking-widest text-punk-white/70">
          {label}
        </label>
      )}
      <div className="mt-2 flex items-center gap-4">
        {value ? (
          <div className="relative">
            <img
              src={value}
              alt="Preview"
              className="h-24 w-24 object-cover border-2 border-punk-green/50"
            />
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="absolute -right-1 -top-1 rounded-full bg-punk-red px-1.5 py-0.5 text-xs text-punk-white hover:bg-punk-blood"
              >
                ✕
              </button>
            )}
          </div>
        ) : (
          <div className="flex h-24 w-24 items-center justify-center border-2 border-dashed border-punk-white/30 bg-punk-black/50">
            {uploading ? (
              <span className="font-body text-xs text-punk-white/60">
                Subiendo...
              </span>
            ) : (
              <span className="font-body text-xs text-punk-white/40">+</span>
            )}
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleChange}
          disabled={uploading || (type === "image" && currentImageCount >= maxImages)}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || (type === "image" && currentImageCount >= maxImages)}
          className="border-2 border-punk-white/30 px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-white/80 transition-colors hover:border-punk-green hover:text-punk-green disabled:opacity-50"
        >
          {value ? "Cambiar" : "Subir"}
        </button>
      </div>
      {error && (
        <p className="mt-1 font-body text-sm text-punk-red">{error}</p>
      )}
      {type === "image" && (
        <p className="mt-1 font-body text-xs text-punk-white/50">
          {currentImageCount}/{maxImages} imágenes (máx. 5 MB cada una)
        </p>
      )}
    </div>
  );
}
