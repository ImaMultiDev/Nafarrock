"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ui/ImageUpload";

const inputClass = "mt-2 w-full border-2 border-punk-white/20 bg-punk-black px-4 py-3 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-green focus:outline-none";
const labelClass = "block font-punch text-xs uppercase tracking-widest text-punk-white/70";

type Organizer = { id: string; name: string; description: string | null; websiteUrl: string | null; contactEmail: string | null; logoUrl: string | null };

export function OrganizadorForm({ organizer }: { organizer: Organizer }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState(organizer.logoUrl ?? "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await fetch("/api/dashboard/organizador", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        description: formData.get("description") || null,
        websiteUrl: formData.get("websiteUrl") || null,
        contactEmail: formData.get("contactEmail") || null,
        logoUrl: logoUrl || null,
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
        <input id="name" name="name" type="text" required defaultValue={organizer.name} className={inputClass} />
      </div>
      <div>
        <ImageUpload folder="organizers" type="logo" entityId={organizer.id} value={logoUrl} onChange={setLogoUrl} onRemove={() => setLogoUrl("")} label="Logo" />
      </div>
      <div>
        <label htmlFor="description" className={labelClass}>Descripción</label>
        <textarea id="description" name="description" rows={3} defaultValue={organizer.description ?? ""} className={inputClass} />
      </div>
      <div>
        <label htmlFor="websiteUrl" className={labelClass}>Web</label>
        <input id="websiteUrl" name="websiteUrl" type="url" defaultValue={organizer.websiteUrl ?? ""} className={inputClass} />
      </div>
      <div>
        <label htmlFor="contactEmail" className={labelClass}>Email contacto</label>
        <input id="contactEmail" name="contactEmail" type="email" defaultValue={organizer.contactEmail ?? ""} className={inputClass} />
      </div>
      <button type="submit" disabled={loading} className="border-2 border-punk-pink bg-punk-pink px-8 py-3 font-punch text-sm uppercase tracking-widest text-punk-black hover:bg-punk-pink/90 disabled:opacity-50">
        {loading ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}
