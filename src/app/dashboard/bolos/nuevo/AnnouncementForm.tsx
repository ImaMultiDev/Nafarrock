"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const inputClass =
  "mt-2 w-full border-2 border-punk-white/20 bg-punk-black px-4 py-3 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-green focus:outline-none";
const labelClass = "block font-punch text-xs uppercase tracking-widest text-punk-white/70";

type Props = {
  advertiserType: "PROMOTER" | "VENUE" | "FESTIVAL" | "ASSOCIATION" | "ORGANIZER";
  defaultContactEmail: string;
  defaultZone: string;
  genres: string[];
};

export function AnnouncementForm({
  advertiserType,
  defaultContactEmail,
  defaultZone,
  genres,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConvocatoria = advertiserType !== "PROMOTER";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      title: formData.get("title"),
      description: formData.get("description"),
      zone: (formData.get("zone") as string) || undefined,
      genres: formData.getAll("genres") as string[],
      contactEmail: formData.get("contactEmail"),
      contactInfo: (formData.get("contactInfo") as string) || undefined,
      enableApplicationForm: formData.get("enableApplicationForm") === "on",
      cacheInfo: (formData.get("cacheInfo") as string) || undefined,
      equipmentInfo: (formData.get("equipmentInfo") as string) || undefined,
      technicalInfo: (formData.get("technicalInfo") as string) || undefined,
      extraInfo: (formData.get("extraInfo") as string) || undefined,
      advertiserType,
    };

    const res = await fetch("/api/announcements/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.message ?? "Error al crear");
      return;
    }

    router.push("/dashboard");
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
        <label htmlFor="title" className={labelClass}>
          Título del anuncio *
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={200}
          placeholder={isConvocatoria ? "Buscamos bandas para..." : "Servicios de booking / producción..."}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Descripción *
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          required
          minLength={20}
          placeholder={
            isConvocatoria
              ? "Describe la oportunidad, fechas disponibles, requisitos..."
              : "Describe tus servicios para bandas..."
          }
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="zone" className={labelClass}>
          Zona / ciudad
        </label>
        <input
          id="zone"
          name="zone"
          type="text"
          defaultValue={defaultZone}
          placeholder="Pamplona, Nafarroa..."
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Estilos musicales (si aplica)</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {genres.map((g) => (
            <label key={g} className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" name="genres" value={g} className="accent-punk-green" />
              <span className="font-body text-sm text-punk-white/80">{g}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="contactEmail" className={labelClass}>
          Email de contacto *
        </label>
        <input
          id="contactEmail"
          name="contactEmail"
          type="email"
          required
          defaultValue={defaultContactEmail}
          placeholder="contacto@ejemplo.com"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="contactInfo" className={labelClass}>
          Info adicional de contacto
        </label>
        <textarea
          id="contactInfo"
          name="contactInfo"
          rows={2}
          placeholder="Teléfono, horarios de contacto..."
          className={inputClass}
        />
      </div>

      {isConvocatoria && (
        <>
          <div className="border-t-2 border-punk-green/30 pt-6">
            <h3 className="font-punch text-xs uppercase tracking-widest text-punk-green/80">
              Información para bandas
            </h3>
            <p className="mt-1 font-body text-sm text-punk-white/60">
              Indica cache, equipo, técnicos y todo lo que las bandas deban saber.
            </p>
          </div>

          <div>
            <label htmlFor="cacheInfo" className={labelClass}>
              Cache / condiciones económicas
            </label>
            <textarea
              id="cacheInfo"
              name="cacheInfo"
              rows={2}
              placeholder="Ej: 300€, taquilla partida..."
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="equipmentInfo" className={labelClass}>
              Equipo disponible
            </label>
            <textarea
              id="equipmentInfo"
              name="equipmentInfo"
              rows={2}
              placeholder="Batería, amplis, backline..."
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="technicalInfo" className={labelClass}>
              Sonido / luces / técnicos
            </label>
            <textarea
              id="technicalInfo"
              name="technicalInfo"
              rows={2}
              placeholder="Técnico de sonido incluido, equipo de luces..."
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="extraInfo" className={labelClass}>
              Más información
            </label>
            <textarea
              id="extraInfo"
              name="extraInfo"
              rows={2}
              placeholder="Cualquier otro detalle relevante"
              className={inputClass}
            />
          </div>

          <div>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                name="enableApplicationForm"
                className="accent-punk-green"
              />
              <span className={labelClass}>
                Activar formulario de postulación desde Nafarrock
              </span>
            </label>
            <p className="mt-1 font-body text-sm text-punk-white/60">
              Las bandas podrán postularse directamente y recibirás la postulación por email.
            </p>
          </div>
        </>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="border-2 border-punk-green bg-punk-green px-8 py-3 font-punch text-sm uppercase tracking-widest text-punk-black transition-all hover:bg-punk-green/90 disabled:opacity-50"
        >
          {loading ? "Publicando..." : "Publicar anuncio"}
        </button>
        <Link
          href="/dashboard"
          className="border-2 border-punk-white/30 px-8 py-3 font-punch text-sm uppercase tracking-widest text-punk-white/70 hover:border-punk-white"
        >
          Cancelar
        </Link>
      </div>

      <p className="font-body text-sm text-punk-white/50">
        El anuncio será revisado por el administrador antes de publicarse.
      </p>
    </form>
  );
}
