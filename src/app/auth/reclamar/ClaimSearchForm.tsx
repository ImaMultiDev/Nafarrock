"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type SearchResult = {
  id: string;
  name: string;
  slug: string;
  location?: string;
  city?: string;
  genres?: string[];
};

const TYPES = [
  { value: "BAND", label: "Banda" },
  { value: "VENUE", label: "Sala" },
  { value: "FESTIVAL", label: "Festival" },
] as const;

export function ClaimSearchForm() {
  const router = useRouter();
  const [type, setType] = useState<"BAND" | "VENUE" | "FESTIVAL">("BAND");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
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

  const handleClaim = async (entityId: string, entityName: string) => {
    setClaiming(entityId);
    setError(null);
    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: type,
          entityId,
          message: message.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Error al enviar la solicitud");
        return;
      }
      router.refresh();
      setMessage("");
      setResults((r) => r.filter((x) => x.id !== entityId));
      alert(`Solicitud enviada. El administrador revisará tu reclamación de "${entityName}".`);
    } catch {
      setError("Error de conexión");
    } finally {
      setClaiming(null);
    }
  };

  return (
    <div className="mt-10 max-w-2xl space-y-6">
      <div>
        <label className="block font-punch text-xs uppercase tracking-widest text-punk-white/70">
          Tipo de perfil
        </label>
        <div className="mt-2 flex gap-2">
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={`border-2 px-4 py-2 font-punch text-xs uppercase tracking-widest transition-colors ${
                type === t.value
                  ? "border-punk-green bg-punk-green/10 text-punk-green"
                  : "border-punk-white/20 text-punk-white/70 hover:border-punk-white/40"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-punch text-xs uppercase tracking-widest text-punk-white/70">
          Buscar por nombre
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

      {error && (
        <div className="border-2 border-punk-red bg-punk-red/10 p-4">
          <p className="font-body text-punk-red">{error}</p>
        </div>
      )}

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
                    href={
                      type === "BAND"
                        ? `/bandas/${item.slug}`
                        : type === "VENUE"
                        ? `/salas/${item.slug}`
                        : `/festivales/${item.slug}`
                    }
                    target="_blank"
                    className="font-punch text-xs uppercase tracking-widest text-punk-white/60 hover:text-punk-green"
                  >
                    Ver perfil →
                  </Link>
                </div>
                <p className="mt-2 font-body text-sm text-punk-red/90">
                  Este perfil ya existe y fue creado por Nafarrock
                </p>
                <div className="mt-3 flex flex-wrap items-end gap-3">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Mensaje opcional para el administrador"
                    className="flex-1 min-w-[200px] border-2 border-punk-white/20 bg-punk-black px-3 py-2 font-body text-sm text-punk-white placeholder:text-punk-white/40 focus:border-punk-red focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleClaim(item.id, item.name)}
                    disabled={!!claiming}
                    className="border-2 border-punk-green bg-punk-green px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-black transition-all hover:bg-punk-green/90 disabled:opacity-50"
                  >
                    {claiming === item.id ? "Enviando…" : "Reclamar este perfil"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {query && !loading && results.length === 0 && (
        <p className="font-body text-punk-white/60">
          No se encontraron perfiles.{" "}
          <Link href="/auth/registro" className="text-punk-green hover:underline">
            Crea un nuevo perfil
          </Link>
          .
        </p>
      )}
    </div>
  );
}
