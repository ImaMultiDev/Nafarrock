"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "mt-2 w-full border-2 border-punk-white/20 bg-punk-black px-4 py-3 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-green focus:outline-none";
const labelClass = "block font-punch text-xs uppercase tracking-widest text-punk-white/70";

export function VenueForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await fetch("/api/admin/venues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        city: formData.get("city"),
        address: formData.get("address") || undefined,
        description: formData.get("description") || undefined,
        foundedYear: formData.get("foundedYear")
          ? Number(formData.get("foundedYear"))
          : undefined,
        capacity: formData.get("capacity") ? Number(formData.get("capacity")) : undefined,
        websiteUrl: formData.get("websiteUrl") || undefined,
        mapUrl: formData.get("mapUrl") || undefined,
        instagramUrl: formData.get("instagramUrl") || undefined,
        facebookUrl: formData.get("facebookUrl") || undefined,
      }),
    });

    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.message ?? "Error al crear");
      return;
    }
    router.push("/admin/salas");
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
        <label htmlFor="name" className={labelClass}>
          Nombre *
        </label>
        <input id="name" name="name" type="text" required className={inputClass} />
      </div>
      <div>
        <label htmlFor="city" className={labelClass}>
          Ciudad *
        </label>
        <input id="city" name="city" type="text" required className={inputClass} placeholder="Pamplona" />
      </div>
      <div>
        <label htmlFor="address" className={labelClass}>
          Dirección
        </label>
        <input id="address" name="address" type="text" className={inputClass} />
      </div>
      <div>
        <label htmlFor="description" className={labelClass}>
          Descripción
        </label>
        <textarea id="description" name="description" rows={3} className={inputClass} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="foundedYear" className={labelClass}>
            Año fundación
          </label>
          <input id="foundedYear" name="foundedYear" type="number" min={1900} className={inputClass} />
        </div>
        <div>
          <label htmlFor="capacity" className={labelClass}>
            Aforo
          </label>
          <input id="capacity" name="capacity" type="number" min={1} className={inputClass} />
        </div>
      </div>
      <div>
        <label htmlFor="websiteUrl" className={labelClass}>
          Web
        </label>
        <input id="websiteUrl" name="websiteUrl" type="url" className={inputClass} />
      </div>
      <div>
        <label htmlFor="mapUrl" className={labelClass}>
          Enlace mapa (Google Maps)
        </label>
        <input id="mapUrl" name="mapUrl" type="url" className={inputClass} />
      </div>
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="border-2 border-punk-pink bg-punk-pink px-8 py-3 font-punch text-sm uppercase tracking-widest text-punk-black transition-all hover:bg-punk-pink/90 disabled:opacity-50"
        >
          {loading ? "Creando..." : "Crear sala"}
        </button>
        <a
          href="/admin/salas"
          className="border-2 border-punk-white/30 px-8 py-3 font-punch text-sm uppercase tracking-widest text-punk-white/70 hover:border-punk-white"
        >
          Cancelar
        </a>
      </div>
    </form>
  );
}
