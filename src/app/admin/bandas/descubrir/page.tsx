"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type DiscoveryArtist = {
  id: string;
  name: string;
  imageUrl: string | null;
  spotifyUrl: string | null;
  source: "spotify";
  isRegistered: boolean;
};

const inputClass =
  "w-full border-2 border-punk-white/20 bg-punk-black px-4 py-3 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-green focus:outline-none";
const labelClass = "block font-punch text-xs uppercase tracking-widest text-punk-white/70";

export default function DescubrirBandasPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [artists, setArtists] = useState<DiscoveryArtist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || query.trim().length < 2) {
      setError("Introduce al menos 2 caracteres");
      return;
    }

    setError(null);
    setMessage(null);
    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(
        `/api/admin/band-discovery?q=${encodeURIComponent(query.trim())}`
      );
      const json = await res.json();

      if (!res.ok) {
        setError(json.message ?? "Error al buscar");
        setArtists([]);
        return;
      }

      setArtists(json.artists ?? []);
      setMessage(json.message ?? null);
    } catch {
      setError("Error de conexión");
      setArtists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (artistName: string) => {
    router.push(
      `/admin/bandas/nueva?autofill=${encodeURIComponent(artistName)}`
    );
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl">
            DESCUBRIR BANDAS
          </h1>
          <p className="mt-2 font-body text-punk-white/60">
            Busca bandas en Spotify. Se priorizan las del territorio (Navarra, Araba, Bizkaia, Gipuzkoa).
          </p>
        </div>
        <Link
          href="/admin/bandas"
          className="border-2 border-punk-white/30 px-6 py-3 font-punch text-sm uppercase tracking-widest text-punk-white/70 hover:border-punk-white"
        >
          ← Volver a bandas
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mt-10 max-w-2xl">
        <label htmlFor="discovery-query" className={labelClass}>
          Buscar por género, nombre o término
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            id="discovery-query"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ej: punk, indie Bilbao, rock Pamplona"
            className={inputClass}
            minLength={2}
          />
          <button
            type="submit"
            disabled={loading}
            className="shrink-0 border-2 border-punk-green bg-punk-green px-6 py-3 font-punch text-sm uppercase tracking-widest text-punk-black transition-all hover:bg-punk-green/90 disabled:opacity-50"
          >
            {loading ? "Buscando…" : "Buscar"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-6 border-2 border-punk-red bg-punk-red/10 p-4">
          <p className="font-body text-punk-red">{error}</p>
        </div>
      )}

      {message && !error && (
        <p className="mt-6 font-body text-sm text-punk-white/60">{message}</p>
      )}

      {searched && !loading && (
        <div className="mt-8">
          {artists.length === 0 ? (
            <div className="border-2 border-dashed border-punk-white/20 p-12 text-center">
              <p className="font-body text-punk-white/60">
                No se encontraron bandas. Prueba con otro término (género, ciudad, nombre).
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {artists.map((artist) => (
                <div
                  key={artist.id}
                  className="flex items-center gap-3 border-2 border-punk-white/10 p-4"
                >
                  {artist.imageUrl ? (
                    <img
                      src={artist.imageUrl}
                      alt=""
                      className="h-14 w-14 shrink-0 object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-punk-white/10 font-punch text-lg text-punk-white/40">
                      ?
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-body font-medium text-punk-white">
                      {artist.name}
                    </p>
                    {artist.isRegistered && (
                      <span className="mt-1 inline-block font-body text-xs text-punk-green">
                        Ya registrada
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRegister(artist.name)}
                    disabled={artist.isRegistered}
                    className="shrink-0 border-2 border-punk-white/30 px-3 py-2 font-punch text-xs uppercase tracking-widest text-punk-white/70 transition-colors hover:border-punk-green hover:text-punk-green disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-punk-white/30 disabled:hover:text-punk-white/70"
                  >
                    {artist.isRegistered ? "Registrada" : "Registrar banda"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!searched && (
        <div className="mt-12 border-2 border-dashed border-punk-white/20 p-12 text-center">
          <p className="font-body text-punk-white/60">
            Introduce un término de búsqueda (género, ciudad, nombre de banda) y pulsa Buscar.
          </p>
          <p className="mt-2 font-body text-sm text-punk-white/40">
            Se priorizan bandas de Navarra y País Vasco. Si no hay de la región, se muestran sugerencias de Spotify.
          </p>
        </div>
      )}
    </>
  );
}
