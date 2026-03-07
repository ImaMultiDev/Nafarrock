"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { ImageGallery } from "@/components/ui/ImageGallery";
import { TranslateButton } from "@/components/admin/TranslateButton";

const inputClass =
  "mt-2 w-full border-2 border-punk-white/20 bg-punk-black px-4 py-3 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-green focus:outline-none";
const labelClass = "block font-punch text-xs uppercase tracking-widest text-punk-white/70";

export function BandForm({ genres }: { genres: string[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [bioEu, setBioEu] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [autofillLoading, setAutofillLoading] = useState(false);
  const [createdBand, setCreatedBand] = useState<{ id: string; name: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const autofillName = searchParams.get("autofill");
    if (!autofillName) return;

    const runAutofill = async () => {
      const form = formRef.current;
      const nameInput = form?.querySelector<HTMLInputElement>('[name="name"]');
      if (nameInput) nameInput.value = autofillName;

      setError(null);
      setAutofillLoading(true);
      try {
        const res = await fetch("/api/admin/band-autofill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bandName: autofillName }),
        });
        const json = await res.json();

        if (!res.ok) {
          setError(json.message ?? "Error al buscar");
          return;
        }

        const data = json.data;
        if (data) {
          applyAutofillData(form, data, (input) => {
            if (input) input.value = (data.name as string) ?? autofillName;
          });
        } else {
          setError(json.message ?? "No se encontró información");
        }
      } catch {
        setError("Error de conexión al buscar información");
      } finally {
        setAutofillLoading(false);
      }
    };

    runAutofill();
    router.replace("/admin/bandas/nueva", { scroll: false });
  }, [searchParams, router]);

  const applyAutofillData = (
    form: HTMLFormElement | null,
    data: Record<string, unknown>,
    setName?: (input: HTMLInputElement | null) => void
  ) => {
    if (data.bio) setBio(data.bio as string);
    if (data.logoUrl) setLogoUrl(data.logoUrl as string);
    if (data.imageUrl) setImageUrl(data.imageUrl as string);

    const nameInput = form?.querySelector<HTMLInputElement>('[name="name"]');
    if (setName) setName(nameInput ?? null);
    else if (data.name && nameInput) nameInput.value = data.name as string;

    const setFormValue = (name: string, value: string | number | undefined) => {
      const el = form?.querySelector<HTMLInputElement | HTMLSelectElement>(`[name="${name}"]`);
      if (el && value !== undefined) el.value = String(value);
    };
    setFormValue("location", data.location as string ?? "");
    setFormValue("foundedYear", data.foundedYear as number ?? "");
    setFormValue("spotifyUrl", data.spotifyUrl as string ?? "");
    setFormValue("instagramUrl", data.instagramUrl as string ?? "");
    setFormValue("facebookUrl", data.facebookUrl as string ?? "");
    setFormValue("youtubeUrl", data.youtubeUrl as string ?? "");
    setFormValue("webUrl", data.webUrl as string ?? "");
    setFormValue("bandcampUrl", data.bandcampUrl as string ?? "");

    form?.querySelectorAll<HTMLInputElement>('[name="genres"]').forEach((cb) => {
      cb.checked = ((data.genres as string[]) ?? []).includes(cb.value);
    });
  };

  const handleAutofill = async () => {
    const form = formRef.current;
    const nameInput = form?.querySelector<HTMLInputElement>('[name="name"]');
    const bandName = nameInput?.value?.trim();
    if (!bandName) {
      setError("Escribe el nombre de la banda antes de buscar");
      return;
    }

    setError(null);
    setAutofillLoading(true);
    try {
      const res = await fetch("/api/admin/band-autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bandName }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.message ?? "Error al buscar");
        return;
      }

      const data = json.data;
      if (!data) {
        setError(json.message ?? "No se encontró información");
        return;
      }

      applyAutofillData(form, data, (input) => {
        if (data.name && input) input.value = data.name;
      });
    } catch {
      setError("Error de conexión al buscar información");
    } finally {
      setAutofillLoading(false);
    }
  };

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
        bio: bio || undefined,
        bioEu: bioEu || undefined,
        genres: selectedGenres,
        location: formData.get("location") || undefined,
        foundedYear: formData.get("foundedYear")
          ? Number(formData.get("foundedYear"))
          : undefined,
        status: formData.get("status") || "ACTIVE",
        spotifyUrl: formData.get("spotifyUrl") || undefined,
        bandcampUrl: formData.get("bandcampUrl") || undefined,
        instagramUrl: formData.get("instagramUrl") || undefined,
        facebookUrl: formData.get("facebookUrl") || undefined,
        youtubeUrl: formData.get("youtubeUrl") || undefined,
        webUrl: formData.get("webUrl") || undefined,
        merchUrl: formData.get("merchUrl") || undefined,
        logoUrl: logoUrl || undefined,
        imageUrl: imageUrl || undefined,
        images,
      }),
    });

    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.message ?? "Error al crear");
      return;
    }
    setCreatedBand({ id: data.id, name: data.name });
  };

  if (createdBand) {
    return (
      <div className="mt-10 max-w-2xl space-y-6">
        <div className="border-2 border-punk-green bg-punk-green/10 p-6">
          <p className="font-body text-punk-green">
            Banda <strong>{createdBand.name}</strong> registrada correctamente.
          </p>
        </div>
        <div className="flex gap-4">
          <a
            href="/admin/bandas"
            className="border-2 border-punk-green bg-punk-green px-8 py-3 font-punch text-sm uppercase tracking-widest text-punk-black transition-all hover:bg-punk-green/90"
          >
            Volver al listado
          </a>
          <button
            type="button"
            onClick={() => setCreatedBand(null)}
            className="border-2 border-punk-white/30 px-8 py-3 font-punch text-sm uppercase tracking-widest text-punk-white/70 hover:border-punk-white"
          >
            Registrar otra banda
          </button>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="mt-10 max-w-2xl space-y-6">
      {error && (
        <div className="border-2 border-punk-red bg-punk-red/10 p-4">
          <p className="font-body text-punk-red">{error}</p>
        </div>
      )}
      <div>
        <label htmlFor="name" className={labelClass}>
          Nombre *
        </label>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input id="name" name="name" type="text" required className={`${inputClass} flex-1 min-w-[200px]`} />
          <button
            type="button"
            onClick={handleAutofill}
            disabled={autofillLoading}
            className="shrink-0 border-2 border-punk-white/30 px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-white/70 transition-colors hover:border-punk-green hover:text-punk-green disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {autofillLoading ? "Buscando…" : "Buscar información automáticamente"}
          </button>
        </div>
      </div>
      <div>
        <label htmlFor="bio" className={labelClass}>
          Biografía
        </label>
        <textarea id="bio" name="bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label htmlFor="bioEu" className={labelClass}>
          Biografía (Euskera)
        </label>
        <div className="mt-2 flex flex-wrap items-start gap-2">
          <textarea id="bioEu" name="bioEu" rows={3} value={bioEu} onChange={(e) => setBioEu(e.target.value)} className={inputClass} placeholder="Traducción al euskera batua" />
          <TranslateButton sourceText={bio} onTranslated={setBioEu} />
        </div>
      </div>
      <div>
        <ImageUpload
          folder="bands"
          type="logo"
          entityId={null}
          value={logoUrl}
          onChange={setLogoUrl}
          onRemove={() => setLogoUrl("")}
          label="Logo (opcional)"
        />
      </div>
      <div>
        <ImageUpload
          folder="bands"
          type="image"
          entityId={null}
          value={imageUrl}
          onChange={setImageUrl}
          onRemove={() => setImageUrl("")}
          label="Imagen principal (opcional)"
        />
      </div>
      <div>
        <ImageGallery
          folder="bands"
          entityId="new"
          images={images}
          onChange={setImages}
          label="Galería (máx. 3)"
          maxImages={3}
        />
      </div>
      <div>
        <label htmlFor="location" className={labelClass}>
          Territorio
        </label>
        <select id="location" name="location" className={inputClass}>
          <option value="">—</option>
          <option value="Nafarroa">Nafarroa</option>
          <option value="Araba">Araba</option>
          <option value="Bizkaia">Bizkaia</option>
          <option value="Gipuzkoa">Gipuzkoa</option>
        </select>
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
        <label htmlFor="status" className={labelClass}>
          Estado de la banda
        </label>
        <select id="status" name="status" defaultValue="ACTIVE" className={inputClass}>
          <option value="ACTIVE">Activa</option>
          <option value="PAUSED">En pausa</option>
          <option value="INACTIVE">Inactiva</option>
        </select>
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
          <label htmlFor="bandcampUrl" className={labelClass}>
            Bandcamp
          </label>
          <input id="bandcampUrl" name="bandcampUrl" type="url" className={inputClass} />
        </div>
        <div>
          <label htmlFor="instagramUrl" className={labelClass}>
            Instagram
          </label>
          <input id="instagramUrl" name="instagramUrl" type="url" className={inputClass} />
        </div>
        <div>
          <label htmlFor="facebookUrl" className={labelClass}>
            Facebook
          </label>
          <input id="facebookUrl" name="facebookUrl" type="url" className={inputClass} />
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
        <div>
          <label htmlFor="merchUrl" className={labelClass}>
            Tienda / Merch
          </label>
          <input id="merchUrl" name="merchUrl" type="url" className={inputClass} placeholder="https://..." />
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
