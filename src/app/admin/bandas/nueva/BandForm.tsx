"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "mt-2 w-full border-2 border-punk-white/20 bg-punk-black px-4 py-3 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-green focus:outline-none";
const labelClass = "block font-punch text-xs uppercase tracking-widest text-punk-white/70";

export function BandForm({ genres }: { genres: string[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const selectedGenres = formData.getAll("genres") as string[];

    const res = await fetch("/api/admin/bands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        bio: formData.get("bio") || undefined,
        genres: selectedGenres,
        location: formData.get("location") || undefined,
        foundedYear: formData.get("foundedYear")
          ? Number(formData.get("foundedYear"))
          : undefined,
        spotifyUrl: formData.get("spotifyUrl") || undefined,
        bandcampUrl: formData.get("bandcampUrl") || undefined,
        instagramUrl: formData.get("instagramUrl") || undefined,
        facebookUrl: formData.get("facebookUrl") || undefined,
        youtubeUrl: formData.get("youtubeUrl") || undefined,
        webUrl: formData.get("webUrl") || undefined,
      }),
    });

    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.message ?? "Error al crear");
      return;
    }
    router.push("/admin/bandas");
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
        <label htmlFor="bio" className={labelClass}>
          Biografía
        </label>
        <textarea id="bio" name="bio" rows={3} className={inputClass} />
      </div>
      <div>
        <label htmlFor="location" className={labelClass}>
          Localidad
        </label>
        <input id="location" name="location" type="text" className={inputClass} />
      </div>
      <div>
        <label htmlFor="foundedYear" className={labelClass}>
          Año fundación
        </label>
        <input
          id="foundedYear"
          name="foundedYear"
          type="number"
          min={1900}
          max={new Date().getFullYear()}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Géneros</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {genres.map((g) => (
            <label key={g} className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" name="genres" value={g} className="accent-punk-green" />
              <span className="font-body text-sm text-punk-white/80">{g}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="spotifyUrl" className={labelClass}>
            Spotify
          </label>
          <input id="spotifyUrl" name="spotifyUrl" type="url" className={inputClass} />
        </div>
        <div>
          <label htmlFor="instagramUrl" className={labelClass}>
            Instagram
          </label>
          <input id="instagramUrl" name="instagramUrl" type="url" className={inputClass} />
        </div>
        <div>
          <label htmlFor="youtubeUrl" className={labelClass}>
            YouTube
          </label>
          <input id="youtubeUrl" name="youtubeUrl" type="url" className={inputClass} />
        </div>
        <div>
          <label htmlFor="webUrl" className={labelClass}>
            Web
          </label>
          <input id="webUrl" name="webUrl" type="url" className={inputClass} />
        </div>
      </div>
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="border-2 border-punk-green bg-punk-green px-8 py-3 font-punch text-sm uppercase tracking-widest text-punk-black transition-all hover:bg-punk-green/90 disabled:opacity-50"
        >
          {loading ? "Creando..." : "Crear banda"}
        </button>
        <a
          href="/admin/bandas"
          className="border-2 border-punk-white/30 px-8 py-3 font-punch text-sm uppercase tracking-widest text-punk-white/70 hover:border-punk-white"
        >
          Cancelar
        </a>
      </div>
    </form>
  );
}
