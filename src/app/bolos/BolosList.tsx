"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type AnnouncementWithRelations = {
  id: string;
  title: string;
  description: string;
  zone: string | null;
  genres: string[];
  createdAt: string;
  advertiserType: string;
  contactEmail: string;
  enableApplicationForm: boolean;
  promoter: { id: string; name: string; slug: string } | null;
  venue: { id: string; name: string; slug: string; city: string } | null;
  festival: { id: string; name: string; slug: string } | null;
  organizer: { id: string; name: string; slug: string } | null;
};

function advertiserLabel(a: AnnouncementWithRelations): string {
  if (a.promoter) return "Promotor";
  if (a.venue) return "Sala / Recinto";
  if (a.festival) return "Festival";
  if (a.organizer) return "Organizador";
  return "";
}

function advertiserName(a: AnnouncementWithRelations): string {
  return a.promoter?.name ?? a.venue?.name ?? a.festival?.name ?? a.organizer?.name ?? "";
}

export function BolosList() {
  const searchParams = useSearchParams();
  const [announcements, setAnnouncements] = useState<AnnouncementWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    fetch(`/api/announcements?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setAnnouncements(Array.isArray(data) ? data : []);
      })
      .catch(() => setAnnouncements([]))
      .finally(() => setLoading(false));
  }, [searchParams]);

  if (loading) {
    return (
      <div className="mt-8 font-body text-punk-white/60">
        Cargando anuncios...
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="mt-10 rounded border-2 border-dashed border-punk-white/20 p-12 text-center">
        <p className="font-body text-punk-white/60">
          No hay anuncios activos con los filtros seleccionados.
        </p>
        <p className="mt-2 font-body text-sm text-punk-white/50">
          Prueba a cambiar los filtros o vuelve más tarde.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      {announcements.map((a) => (
        <Link
          key={a.id}
          href={`/bolos/${a.id}`}
          className="block border-2 border-punk-green/50 bg-punk-black p-6 transition-all hover:border-punk-green hover:shadow-[0_0_20px_rgba(0,200,83,0.15)]"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-xl tracking-tighter text-punk-white">
                {a.title}
              </h3>
              <p className="mt-1 font-punch text-xs uppercase tracking-widest text-punk-green/80">
                {advertiserLabel(a)} · {advertiserName(a)}
                {a.zone && ` · ${a.zone}`}
              </p>
              <p className="mt-3 line-clamp-2 font-body text-punk-white/80">
                {a.description}
              </p>
              {a.genres.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {a.genres.slice(0, 4).map((g) => (
                    <span
                      key={g}
                      className="border border-punk-green/40 px-2 py-0.5 font-punch text-xs uppercase text-punk-green/90"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="shrink-0 font-body text-xs text-punk-white/50">
              {format(new Date(a.createdAt), "d MMM yyyy", { locale: es })}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
