"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ui/ImageUpload";

const inputClass = "mt-2 w-full border-2 border-punk-white/20 bg-punk-black px-4 py-3 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-green focus:outline-none";
const labelClass = "block font-punch text-xs uppercase tracking-widest text-punk-white/70";

type Promoter = { id: string; name: string; description: string | null; websiteUrl: string | null; contactEmail: string | null; imageUrl: string | null };

export function PromotorForm({ promoter }: { promoter: Promoter }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState(promoter.imageUrl ?? "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await fetch("/api/dashboard/promotor", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        description: formData.get("description") || null,
        websiteUrl: formData.get("websiteUrl") || null,
        contactEmail: formData.get("contactEmail") || null,
        imageUrl: imageUrl || null,
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
        <input id="name" name="name" type="text" required defaultValue={promoter.name} className={inputClass} />
      </div>
      <div>
        <ImageUpload folder="promoters" type="logo" entityId={promoter.id} value={imageUrl} onChange={setImageUrl} onRemove={() => setImageUrl("")} label="Logo / Imagen" />
      </div>
      <div>
        <label htmlFor="description" className={labelClass}>Descripción</label>
        <textarea id="description" name="description" rows={3} defaultValue={promoter.description ?? ""} className={inputClass} />
      </div>
      <div>
        <label htmlFor="websiteUrl" className={labelClass}>Web</label>
        <input id="websiteUrl" name="websiteUrl" type="url" defaultValue={promoter.websiteUrl ?? ""} className={inputClass} />
      </div>
      <div>
        <label htmlFor="contactEmail" className={labelClass}>Email contacto</label>
        <input id="contactEmail" name="contactEmail" type="email" defaultValue={promoter.contactEmail ?? ""} className={inputClass} />
      </div>
      <button type="submit" disabled={loading} className="border-2 border-punk-pink bg-punk-pink px-8 py-3 font-punch text-sm uppercase tracking-widest text-punk-black hover:bg-punk-pink/90 disabled:opacity-50">
        {loading ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}
