"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";

type DiscoveryEvent = {
  id: string;
  name: string;
  url: string;
  startDate: string | null;
  imageUrl: string | null;
  venueName: string | null;
  venueCity: string | null;
  isRegistered: boolean;
};

export default function DescubrirEventosPage() {
  const [events, setEvents] = useState<DiscoveryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchEvents = async (pageNum: number, append: boolean) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const res = await fetch(`/api/admin/event-discovery?page=${pageNum}`);
      const json = await res.json();

      if (!res.ok) {
        setError(json.message ?? "Error al cargar");
        if (!append) setEvents([]);
        return;
      }

      const newEvents = (json.events ?? []) as DiscoveryEvent[];
      if (append) {
        setEvents((prev) => {
          const seen = new Set(prev.map((e) => e.id));
          const unique = newEvents.filter((e) => !seen.has(e.id));
          return [...prev, ...unique];
        });
        setPage(pageNum);
        setHasMore(newEvents.length >= 15);
      } else {
        setEvents(newEvents);
        setPage(0);
        setHasMore(newEvents.length >= 15);
      }
      setMessage(json.message ?? null);
      setError(null);
    } catch {
      setError("Error de conexión");
      if (!append) setEvents([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchEvents(0, false);
  }, []);

  const handleLoadMore = () => {
    fetchEvents(page + 1, true);
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    try {
      const d = parseISO(iso);
      return isValid(d) ? format(d, "d MMM yyyy", { locale: es }) : "—";
    } catch {
      return "—";
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl">
            DESCUBRIR EVENTOS
          </h1>
          <p className="mt-2 font-body text-punk-white/60">
            Eventos de música en Navarra y País Vasco (Ticketmaster)
          </p>
        </div>
        <Link
          href="/admin/eventos"
          className="border-2 border-punk-white/30 px-6 py-3 font-punch text-sm uppercase tracking-widest text-punk-white/70 hover:border-punk-white"
        >
          ← Volver a eventos
        </Link>
      </div>

      {loading && (
        <div className="mt-10 font-body text-punk-white/60">Cargando eventos…</div>
      )}

      {error && (
        <div className="mt-6 border-2 border-punk-red bg-punk-red/10 p-4">
          <p className="font-body text-punk-red">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="mt-10">
          {message && (
            <p className="mb-6 font-body text-sm text-punk-white/60">{message}</p>
          )}
          {events.length === 0 ? (
            <div className="border-2 border-dashed border-punk-white/20 p-12 text-center">
              <p className="font-body text-punk-white/60">
                No hay eventos disponibles. Configura TICKETMASTER_API_KEY o prueba más tarde.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-wrap items-center gap-4 border-2 border-punk-red/30 bg-punk-black p-4"
                >
                  {event.imageUrl ? (
                    <img
                      src={event.imageUrl}
                      alt=""
                      className="h-20 w-20 shrink-0 object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center bg-punk-white/10 font-punch text-2xl text-punk-white/40">
                      ?
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-lg text-punk-white">{event.name}</h3>
                    <p className="mt-1 font-body text-sm text-punk-white/60">
                      {formatDate(event.startDate)} · {event.venueName ?? "—"}
                      {event.venueCity ? ` · ${event.venueCity}` : ""}
                    </p>
                    {event.isRegistered && (
                      <span className="mt-1 inline-block font-body text-xs text-punk-green">
                        Ya registrado
                      </span>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-2 border-punk-white/30 px-3 py-2 font-punch text-xs uppercase tracking-widest text-punk-white/70 hover:border-punk-white"
                    >
                      Ver en Ticketmaster
                    </a>
                    <Link
                      href={`/admin/eventos/nuevo?autofillUrl=${encodeURIComponent(event.url)}`}
                      className={`border-2 px-3 py-2 font-punch text-xs uppercase tracking-widest ${
                        event.isRegistered
                          ? "cursor-not-allowed border-punk-white/20 text-punk-white/40"
                          : "border-punk-red bg-punk-red/20 text-punk-red hover:bg-punk-red/30"
                      }`}
                    >
                      {event.isRegistered ? "Registrado" : "Registrar evento"}
                    </Link>
                  </div>
                </div>
              ))}
              {events.length > 0 && hasMore && (
                <div className="pt-6 text-center">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="border-2 border-punk-white/30 px-6 py-3 font-punch text-sm uppercase tracking-widest text-punk-white/70 hover:border-punk-red hover:text-punk-red disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingMore ? "Buscando…" : "Buscar más eventos"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
