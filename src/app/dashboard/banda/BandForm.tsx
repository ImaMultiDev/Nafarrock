"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { ImageGallery } from "@/components/ui/ImageGallery";

const inputClass =
  "mt-2 w-full border-2 border-punk-white/20 bg-punk-black px-4 py-3 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-green focus:outline-none";
const labelClass = "block font-punch text-xs uppercase tracking-widest text-punk-white/70";

type Member = { name: string; instrument: string };
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
  images: string[];
  members?: { name: string; instrument: string; order: number }[];
};

export function BandForm({ band, genres }: { band: Band; genres: string[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState(band.logoUrl ?? "");
  const [images, setImages] = useState<string[]>(band.images ?? []);
  const [members, setMembers] = useState<Member[]>(
    (band.members ?? []).length > 0
      ? band.members!.map((m) => ({ name: m.name, instrument: m.instrument }))
      : [{ name: "", instrument: "" }]
  );

  const addMember = () => setMembers((m) => [...m, { name: "", instrument: "" }]);
  const removeMember = (i: number) => setMembers((m) => m.filter((_, j) => j !== i));
  const updateMember = (i: number, field: keyof Member, value: string) =>
    setMembers((m) => m.map((x, j) => (j === i ? { ...x, [field]: value } : x)));

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
        images,
        members: members
          .filter((m) => m.name.trim() && m.instrument.trim())
          .map((m, i) => ({ name: m.name, instrument: m.instrument, order: i })),
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
        <ImageGallery folder="bands" entityId={band.id} images={images} onChange={setImages} label="Galería (máx. 3 imágenes)" />
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
        <label className={labelClass}>Miembros</label>
        <div className="mt-2 space-y-3">
          {members.map((m, i) => (
            <div key={i} className="flex flex-wrap gap-2 items-center">
              <input
                type="text"
                placeholder="Nombre"
                value={m.name}
                onChange={(e) => updateMember(i, "name", e.target.value)}
                className={inputClass + " flex-1 min-w-[120px]"}
              />
              <input
                type="text"
                placeholder="Instrumento"
                value={m.instrument}
                onChange={(e) => updateMember(i, "instrument", e.target.value)}
                className={inputClass + " flex-1 min-w-[120px]"}
              />
              <button
                type="button"
                onClick={() => removeMember(i)}
                className="border-2 border-punk-red/50 px-3 py-2 font-punch text-xs text-punk-red hover:bg-punk-red/10"
              >
                Quitar
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addMember}
            className="border-2 border-dashed border-punk-white/30 px-4 py-2 font-punch text-xs text-punk-white/70 hover:border-punk-green hover:text-punk-green"
          >
            + Añadir miembro
          </button>
        </div>
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
