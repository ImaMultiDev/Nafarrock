"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { ImageGallery } from "@/components/ui/ImageGallery";

const inputClass = "mt-2 w-full border-2 border-punk-white/20 bg-punk-black px-4 py-3 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-green focus:outline-none";
const labelClass = "block font-punch text-xs uppercase tracking-widest text-punk-white/70";

type Asociacion = {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  foundedYear: number | null;
  websiteUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  logoUrl: string | null;
  images: string[];
};

export function AsociacionForm({ association }: { association: Asociacion }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState(association.logoUrl ?? "");
  const [images, setImages] = useState<string[]>(association.images ?? []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await fetch("/api/dashboard/asociacion", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        description: formData.get("description") || null,
        location: formData.get("location") || null,
        foundedYear: formData.get("foundedYear") ? Number(formData.get("foundedYear")) : null,
        websiteUrl: formData.get("websiteUrl") || null,
        instagramUrl: formData.get("instagramUrl") || null,
        facebookUrl: formData.get("facebookUrl") || null,
        logoUrl: logoUrl || null,
        images,
      }),
    });

    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.message ?? "Error al actualizar");
      return;
    }
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-10 max-w-2xl space-y-6">
      {error && (
        <div className="border-2 border-punk-red bg-punk-red/10 p-4">
          <p className="font-body text-punk-red">{error}</p>
        </div>
      )}
      <div>
        <label htmlFor="name" className={labelClass}>Nombre *</label>
        <input id="name" name="name" type="text" required defaultValue={association.name} className={inputClass} />
      </div>
      <div>
        <ImageUpload folder="asociaciones" type="logo" entityId={association.id} value={logoUrl} onChange={setLogoUrl} onRemove={() => setLogoUrl("")} label="Logo" />
      </div>
      <div>
        <ImageGallery folder="asociaciones" entityId={association.id} images={images} onChange={setImages} label="Galería (máx. 3 imágenes)" maxImages={3} />
      </div>
      <div>
        <label htmlFor="description" className={labelClass}>Descripción</label>
        <textarea id="description" name="description" rows={3} defaultValue={association.description ?? ""} className={inputClass} />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="location" className={labelClass}>Localidad</label>
          <input id="location" name="location" type="text" defaultValue={association.location ?? ""} className={inputClass} />
        </div>
        <div>
          <label htmlFor="foundedYear" className={labelClass}>Año fundación</label>
          <input id="foundedYear" name="foundedYear" type="number" min={1900} defaultValue={association.foundedYear ?? ""} className={inputClass} />
        </div>
      </div>
      <div>
        <label htmlFor="websiteUrl" className={labelClass}>Web</label>
        <input id="websiteUrl" name="websiteUrl" type="url" defaultValue={association.websiteUrl ?? ""} className={inputClass} />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="instagramUrl" className={labelClass}>Instagram</label>
          <input id="instagramUrl" name="instagramUrl" type="url" defaultValue={association.instagramUrl ?? ""} className={inputClass} />
        </div>
        <div>
          <label htmlFor="facebookUrl" className={labelClass}>Facebook</label>
          <input id="facebookUrl" name="facebookUrl" type="url" defaultValue={association.facebookUrl ?? ""} className={inputClass} />
        </div>
      </div>
      <button type="submit" disabled={loading} className="border-2 border-punk-yellow bg-punk-yellow px-8 py-3 font-punch text-sm uppercase tracking-widest text-punk-black hover:bg-punk-yellow/90 disabled:opacity-50">
        {loading ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}
