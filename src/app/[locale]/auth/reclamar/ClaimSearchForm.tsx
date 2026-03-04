"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

type SearchResult = {
  id: string;
  name: string;
  slug: string;
  location?: string;
  city?: string;
  genres?: string[];
};

const TYPE_LABELS: Record<string, string> = {
  BAND: "Banda",
  VENUE: "Sala",
  FESTIVAL: "Festival",
  ASOCIACION: "Asociación / Sociedad",
};

export function ClaimSearchForm({ type }: { type: "BAND" | "VENUE" | "FESTIVAL" | "ASOCIACION" }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/profiles/search?type=${type}&q=${encodeURIComponent(query.trim())}`
      );
      const data = await res.json();
      setResults(data.items ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [type, query]);

  const getClaimRegistroUrl = (item: SearchResult) => {
    const params = new URLSearchParams({
      claim: type,
      claimId: item.id,
      claimName: item.name,
    });
    return `/auth/registro?${params.toString()}`;
  };

  const profileUrl =
    type === "BAND"
      ? (slug: string) => `/bandas/${slug}`
      : type === "VENUE"
        ? (slug: string) => `/salas/${slug}`
        : type === "ASOCIACION"
          ? (slug: string) => `/asociaciones/${slug}`
          : (slug: string) => `/festivales/${slug}`;

  return (
    <div className="mt-10 max-w-2xl space-y-6">
      <div>
        <label className="block font-punch text-xs uppercase tracking-widest text-punk-white/70">
          Buscar {TYPE_LABELS[type]} por nombre
        </label>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), search())}
            placeholder={
              type === "BAND"
                ? "Ej: Los Punks"
                : type === "VENUE"
                  ? "Ej: Sala Totem"
                  : type === "ASOCIACION"
                    ? "Ej: Asociación Rock"
                    : "Ej: Nafarroa Rock"
            }
            className="flex-1 border-2 border-punk-white/20 bg-punk-black px-4 py-3 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-red focus:outline-none"
          />
          <button
            type="button"
            onClick={search}
            disabled={loading || !query.trim()}
            className="border-2 border-punk-green bg-punk-green px-6 py-3 font-punch text-xs uppercase tracking-widest text-punk-black transition-all hover:bg-punk-green/90 disabled:opacity-50"
          >
            {loading ? "Buscando…" : "Buscar"}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div>
          <p className="mb-3 font-punch text-xs uppercase tracking-widest text-punk-white/70">
            Coincidencias
          </p>
          <div className="space-y-3">
            {results.map((item) => (
              <div
                key={item.id}
                className="border-2 border-punk-white/20 bg-punk-black/50 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-display text-punk-white">{item.name}</p>
                    <p className="mt-1 font-body text-sm text-punk-white/60">
                      {(item.city ?? item.location ?? item.genres?.join(", ") ?? "").toString() ||
                        "Perfil creado por Nafarrock"}
                    </p>
                  </div>
                  <Link
                    href={profileUrl(item.slug)}
                    target="_blank"
                    className="font-punch text-xs uppercase tracking-widest text-punk-white/60 hover:text-punk-green"
                  >
                    Ver perfil →
                  </Link>
                </div>
                <p className="mt-2 font-body text-sm text-punk-red/90">
                  Este perfil ya existe y fue creado por Nafarrock
                </p>
                <Link
                  href={getClaimRegistroUrl(item)}
                  className="mt-3 inline-block border-2 border-punk-green bg-punk-green px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-black transition-all hover:bg-punk-green/90"
                >
                  Reclamar este perfil
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {query && !loading && results.length === 0 && (
        <p className="font-body text-punk-white/60">
          No se encontraron perfiles.{" "}
          <Link href="/auth/registro" className="text-punk-green hover:underline">
            Crear un nuevo perfil
          </Link>
          .
        </p>
      )}
    </div>
  );
}
