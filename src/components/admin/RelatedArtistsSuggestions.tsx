"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type RelatedArtist = {
  id: string;
  name: string;
  imageUrl: string | null;
  spotifyUrl: string;
  isRegistered: boolean;
};

type Props = {
  bandId: string;
  bandName: string;
};

export function RelatedArtistsSuggestions({ bandId, bandName }: Props) {
  const router = useRouter();
  const [artists, setArtists] = useState<RelatedArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchArtists() {
      try {
        const res = await fetch(`/api/admin/related-artists?bandId=${encodeURIComponent(bandId)}`);
        const json = await res.json();

        if (cancelled) return;

        if (!res.ok) {
          setError(json.message ?? "Error al cargar sugerencias");
          setArtists([]);
          return;
        }

        setArtists(json.artists ?? []);
        setMessage(json.message ?? null);
      } catch {
        if (!cancelled) {
          setError("Error de conexión");
          setArtists([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchArtists();
    return () => {
      cancelled = true;
    };
  }, [bandId]);

  const handleRegister = (artistName: string) => {
    router.push(
      `/admin/bandas/nueva?autofill=${encodeURIComponent(artistName)}`
    );
  };

  if (loading) {
    return (
      <div className="mt-8 border-2 border-punk-white/20 p-6">
        <h2 className="font-punch text-sm uppercase tracking-widest text-punk-white/70">
          Bandas similares que podrías registrar
        </h2>
        <p className="mt-4 font-body text-punk-white/50">Cargando sugerencias…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 border-2 border-punk-white/20 p-6">
        <h2 className="font-punch text-sm uppercase tracking-widest text-punk-white/70">
          Bandas similares que podrías registrar
        </h2>
        <p className="mt-4 font-body text-punk-red">{error}</p>
      </div>
    );
  }

  if (artists.length === 0) {
    return (
      <div className="mt-8 border-2 border-punk-white/20 p-6">
        <h2 className="font-punch text-sm uppercase tracking-widest text-punk-white/70">
          Bandas similares que podrías registrar
        </h2>
        <p className="mt-4 font-body text-punk-white/60">
          {message ?? "No hay sugerencias disponibles."}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 border-2 border-punk-white/20 p-6">
      <h2 className="font-punch text-sm uppercase tracking-widest text-punk-white/70">
        Bandas similares que podrías registrar
      </h2>
      {message && (
        <p className="mt-2 font-body text-sm text-punk-white/50">{message}</p>
      )}
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {artists.map((artist) => (
          <li
            key={artist.id}
            className="flex items-center gap-3 border-2 border-punk-white/10 p-3"
          >
            {artist.imageUrl ? (
              <img
                src={artist.imageUrl}
                alt=""
                className="h-12 w-12 shrink-0 object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-punk-white/10 font-punch text-xs text-punk-white/40">
                ?
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-body text-punk-white">{artist.name}</p>
              {artist.isRegistered && (
                <span className="inline-block mt-1 font-body text-xs text-punk-green">
                  Ya registrada
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => handleRegister(artist.name)}
              disabled={artist.isRegistered}
              className="shrink-0 border-2 border-punk-white/30 px-3 py-1.5 font-punch text-xs uppercase tracking-widest text-punk-white/70 transition-colors hover:border-punk-green hover:text-punk-green disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-punk-white/30 disabled:hover:text-punk-white/70"
            >
              {artist.isRegistered ? "Registrada" : "Registrar banda"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
