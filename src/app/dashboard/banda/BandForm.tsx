"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ui/ImageUpload";

const inputClass =
  "mt-2 w-full border-2 border-punk-white/20 bg-punk-black px-4 py-3 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-green focus:outline-none";
const labelClass = "block font-punch text-xs uppercase tracking-widest text-punk-white/70";

type Band = {
  id: string;
  name: string;
  bio: string | null;
  genres: string[];
  location: string | null;
  foundedYear: number | null;
  spotifyUrl: string | null;
  bandcampUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  youtubeUrl: string | null;
  webUrl: string | null;
  logoUrl: string | null;
};

export function BandForm({ band, genres }: { band: Band; genres: string[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState(band.logoUrl ?? "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const selectedGenres = formData.getAll("genres") as string[];

    const res = await fetch("/api/dashboard/banda", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        bio: formData.get("bio") || null,
        genres: selectedGenres,
        location: formData.get("location") || null,
        foundedYear: formData.get("foundedYear") ? Number(formData.get("foundedYear")) : null,
        spotifyUrl: formData.get("spotifyUrl") || null,
        bandcampUrl: formData.get("bandcampUrl") || null,
        instagramUrl: formData.get("instagramUrl") || null,
        facebookUrl: formData.get("facebookUrl") || null,
        youtubeUrl: formData.get("youtubeUrl") || null,
        webUrl: formData.get("webUrl") || null,
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
        <input id="name" name="name" type="text" required defaultValue={band.name} className={inputClass} />
      </div>
      <div>
        <ImageUpload folder="bands" type="logo" entityId={band.id} value={logoUrl} onChange={setLogoUrl} onRemove={() => setLogoUrl("")} label="Logo" />
      </div>
      <div>
        <label htmlFor="bio" className={labelClass}>Biografía</label>
        <textarea id="bio" name="bio" rows={3} defaultValue={band.bio ?? ""} className={inputClass} />
      </div>
      <div>
        <label htmlFor="location" className={labelClass}>Localidad</label>
        <input id="location" name="location" type="text" defaultValue={band.location ?? ""} className={inputClass} />
      </div>
      <div>
        <label htmlFor="foundedYear" className={labelClass}>Año fundación</label>
        <input id="foundedYear" name="foundedYear" type="number" min={1900} defaultValue={band.foundedYear ?? ""} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Géneros</label>
        <div className="mt-2 flex flex-wrap gap-3">
          {genres.map((g) => (
            <label key={g} className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" name="genres" value={g} defaultChecked={band.genres.includes(g)} className="accent-punk-green" />
              <span className="font-body text-punk-white/80">{g}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div><label htmlFor="spotifyUrl" className={labelClass}>Spotify</label><input id="spotifyUrl" name="spotifyUrl" type="url" defaultValue={band.spotifyUrl ?? ""} className={inputClass} /></div>
        <div><label htmlFor="bandcampUrl" className={labelClass}>Bandcamp</label><input id="bandcampUrl" name="bandcampUrl" type="url" defaultValue={band.bandcampUrl ?? ""} className={inputClass} /></div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div><label htmlFor="instagramUrl" className={labelClass}>Instagram</label><input id="instagramUrl" name="instagramUrl" type="url" defaultValue={band.instagramUrl ?? ""} className={inputClass} /></div>
        <div><label htmlFor="facebookUrl" className={labelClass}>Facebook</label><input id="facebookUrl" name="facebookUrl" type="url" defaultValue={band.facebookUrl ?? ""} className={inputClass} /></div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div><label htmlFor="youtubeUrl" className={labelClass}>YouTube</label><input id="youtubeUrl" name="youtubeUrl" type="url" defaultValue={band.youtubeUrl ?? ""} className={inputClass} /></div>
        <div><label htmlFor="webUrl" className={labelClass}>Web</label><input id="webUrl" name="webUrl" type="url" defaultValue={band.webUrl ?? ""} className={inputClass} /></div>
      </div>
      <button type="submit" disabled={loading} className="border-2 border-punk-pink bg-punk-pink px-8 py-3 font-punch text-sm uppercase tracking-widest text-punk-black hover:bg-punk-pink/90 disabled:opacity-50">
        {loading ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}
