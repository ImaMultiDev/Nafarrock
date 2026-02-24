"use client";

import { useRouter, useSearchParams } from "next/navigation";

const ADVERTISER_TYPES = [
  { value: "", label: "Todos los anunciantes" },
  { value: "NAFARROCK", label: "Nafarrock" },
  { value: "PROMOTER", label: "Promotores" },
  { value: "VENUE", label: "Salas / Recintos" },
  { value: "FESTIVAL", label: "Festivales" },
  { value: "ORGANIZER", label: "Organizadores" },
];

const GENRES = [
  "punk",
  "rock urbano",
  "grunge",
  "hardcore",
  "indie",
  "alternativo",
  "metal",
];

export function BolosFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/bolos?${next.toString()}`);
  };

  return (
    <div className="mt-6 space-y-4 rounded border-2 border-punk-green/30 bg-punk-black/50 p-4">
      <h2 className="font-punch text-xs uppercase tracking-widest text-punk-green/80">
        Filtros
      </h2>
      <div className="flex flex-wrap gap-4">
        <div>
          <label htmlFor="advertiserType" className="sr-only">
            Tipo de anunciante
          </label>
          <select
            id="advertiserType"
            value={searchParams.get("advertiserType") ?? ""}
            onChange={(e) => updateFilter("advertiserType", e.target.value)}
            className="border-2 border-punk-white/20 bg-punk-black px-4 py-2 font-body text-punk-white focus:border-punk-green focus:outline-none"
          >
            {ADVERTISER_TYPES.map((t) => (
              <option key={t.value || "all"} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="zone" className="sr-only">
            Zona
          </label>
          <input
            id="zone"
            type="text"
            placeholder="Zona / ciudad"
            defaultValue={searchParams.get("zone") ?? ""}
            onKeyDown={(e) => e.key === "Enter" && updateFilter("zone", (e.target as HTMLInputElement).value)}
            onBlur={(e) => updateFilter("zone", e.target.value)}
            className="w-40 border-2 border-punk-white/20 bg-punk-black px-4 py-2 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-green focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="genre" className="sr-only">
            Estilo musical
          </label>
          <select
            id="genre"
            value={searchParams.get("genre") ?? ""}
            onChange={(e) => updateFilter("genre", e.target.value)}
            className="border-2 border-punk-white/20 bg-punk-black px-4 py-2 font-body text-punk-white focus:border-punk-green focus:outline-none"
          >
            <option value="">Todos los estilos</option>
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
