"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type Announcement = {
  id: string;
  title: string;
  description: string;
  zone: string | null;
  genres: string[];
  createdAt: Date;
  advertiserType: string;
  createdByNafarrock?: boolean;
  contactEmail: string;
  contactInfo: string | null;
  enableApplicationForm: boolean;
  cacheInfo: string | null;
  equipmentInfo: string | null;
  technicalInfo: string | null;
  extraInfo: string | null;
  promoter: { id: string; name: string; slug: string } | null;
  venue: { id: string; name: string; slug: string; city: string } | null;
  festival: { id: string; name: string; slug: string } | null;
  organizer: { id: string; name: string; slug: string } | null;
  association?: { id: string; name: string; slug: string } | null;
};

function advertiserLabel(a: Announcement): string {
  if (a.createdByNafarrock || a.advertiserType === "NAFARROCK") return "Nafarrock";
  if (a.promoter) return "Promotor";
  if (a.venue) return "Sala / Recinto";
  if (a.festival) return "Festival";
  if (a.organizer) return "Organizador";
  if (a.association) return "Asociación";
  return "";
}

function advertiserName(a: Announcement): string {
  if (a.createdByNafarrock || a.advertiserType === "NAFARROCK") return "Nafarrock";
  return a.promoter?.name ?? a.venue?.name ?? a.festival?.name ?? a.organizer?.name ?? a.association?.name ?? "";
}

export function AnnouncementDetail({ announcement }: { announcement: Announcement }) {
  const { data: session, status } = useSession();
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [alreadyApplied, setAlreadyApplied] = useState<boolean | null>(null);

  const a = announcement;

  return (
    <article className="mt-8">
      <div className="border-l-4 border-punk-green bg-punk-black/50 p-6">
        <h1 className="font-display text-3xl tracking-tighter text-punk-white sm:text-4xl">
          {a.title}
        </h1>
        {(a.createdByNafarrock || a.advertiserType === "NAFARROCK") && (
          <p className="mt-2 font-punch text-xs uppercase tracking-widest text-punk-red/90">
            ANUNCIO PUBLICADO POR NAFARROCK
          </p>
        )}
        <p className="mt-2 font-punch text-xs uppercase tracking-widest text-punk-green/80">
          {advertiserLabel(a)} · {advertiserName(a)}
          {a.zone && ` · ${a.zone}`}
        </p>
        <p className="mt-2 font-body text-sm text-punk-white/50">
          Publicado el {format(new Date(a.createdAt), "d 'de' MMMM yyyy", { locale: es })}
        </p>
      </div>

      <div className="mt-8 space-y-6">
        <div>
          <h2 className="font-punch text-xs uppercase tracking-widest text-punk-green/80">
            Descripción
          </h2>
          <p className="mt-2 whitespace-pre-wrap font-body leading-relaxed text-punk-white/90">
            {a.description}
          </p>
        </div>

        {(a.cacheInfo || a.equipmentInfo || a.technicalInfo || a.extraInfo) && (
          <div className="space-y-4">
            <h2 className="font-punch text-xs uppercase tracking-widest text-punk-green/80">
              Información para bandas
            </h2>
            {a.cacheInfo && (
              <div>
                <h3 className="font-body text-sm font-medium text-punk-white/80">Cache</h3>
                <p className="mt-1 whitespace-pre-wrap font-body text-punk-white/70">{a.cacheInfo}</p>
              </div>
            )}
            {a.equipmentInfo && (
              <div>
                <h3 className="font-body text-sm font-medium text-punk-white/80">Equipo</h3>
                <p className="mt-1 whitespace-pre-wrap font-body text-punk-white/70">{a.equipmentInfo}</p>
              </div>
            )}
            {a.technicalInfo && (
              <div>
                <h3 className="font-body text-sm font-medium text-punk-white/80">Sonido / Luces / Técnicos</h3>
                <p className="mt-1 whitespace-pre-wrap font-body text-punk-white/70">{a.technicalInfo}</p>
              </div>
            )}
            {a.extraInfo && (
              <div>
                <h3 className="font-body text-sm font-medium text-punk-white/80">Más información</h3>
                <p className="mt-1 whitespace-pre-wrap font-body text-punk-white/70">{a.extraInfo}</p>
              </div>
            )}
          </div>
        )}

        {a.genres.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {a.genres.map((g) => (
              <span
                key={g}
                className="border border-punk-green/50 bg-punk-green/10 px-3 py-1 font-punch text-xs uppercase tracking-widest text-punk-green"
              >
                {g}
              </span>
            ))}
          </div>
        )}

        <div className="border-t-2 border-punk-green/30 pt-8">
          <h2 className="font-punch text-xs uppercase tracking-widest text-punk-green/80">
            Contacto
          </h2>
          <p className="mt-2 font-body text-punk-white/90">
            <span className="text-punk-white/60">Email:</span>{" "}
            <a
              href={`mailto:${a.contactEmail}`}
              className="text-punk-green hover:underline"
            >
              {a.contactEmail}
            </a>
          </p>
          {a.contactInfo && (
            <p className="mt-2 whitespace-pre-wrap font-body text-punk-white/80">
              {a.contactInfo}
            </p>
          )}

          {a.enableApplicationForm && (
            <div className="mt-6">
              <h3 className="font-punch text-xs uppercase tracking-widest text-punk-green/80">
                Postulación directa desde Nafarrock
              </h3>
              <p className="mt-2 font-body text-sm text-punk-white/70">
                Si tienes una banda verificada en Nafarrock, puedes postularte directamente desde aquí.
                Tu postulación llegará al anunciante por email.
              </p>
              {status === "loading" ? (
                <p className="mt-4 font-body text-punk-white/50">Comprobando sesión...</p>
              ) : !session ? (
                <p className="mt-4">
                  <Link
                    href={`/auth/login?callbackUrl=/bolos/${a.id}`}
                    className="font-punch text-xs uppercase tracking-widest text-punk-green hover:underline"
                  >
                    Inicia sesión
                  </Link>
                  {" "}con tu cuenta de banda para postularte.
                </p>
              ) : alreadyApplied ? (
                <p className="mt-4 font-body text-punk-white/70">
                  Ya te has postulado a este anuncio.
                </p>
              ) : (
                <ApplySection
                  announcementId={a.id}
                  onAlreadyApplied={() => setAlreadyApplied(true)}
                  onSuccess={() => {
                    setApplySuccess(true);
                    setShowApplyForm(false);
                  }}
                  onError={(msg) => setApplyError(msg)}
                  showForm={showApplyForm}
                  onToggleForm={() => {
                    setShowApplyForm((v) => !v);
                    setApplyError(null);
                  }}
                />
              )}
              {applySuccess && (
                <p className="mt-4 font-body text-punk-green">
                  ✓ Tu postulación se ha enviado correctamente al anunciante.
                </p>
              )}
              {applyError && (
                <p className="mt-4 font-body text-punk-red">{applyError}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function ApplySection({
  announcementId,
  onAlreadyApplied,
  onSuccess,
  onError,
  showForm,
  onToggleForm,
}: {
  announcementId: string;
  onAlreadyApplied: () => void;
  onSuccess: () => void;
  onError: (msg: string) => void;
  showForm: boolean;
  onToggleForm: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      onError("Escribe tu mensaje de postulación");
      return;
    }
    setLoading(true);
    onError("");
    try {
      const res = await fetch(`/api/announcements/${announcementId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          onAlreadyApplied();
        }
        onError(data.message ?? "Error al enviar");
        return;
      }
      onSuccess();
    } catch {
      onError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!showForm) return;
    fetch(`/api/announcements/${announcementId}/apply`)
      .then((r) => r.json())
      .then((data) => {
        if (data.applied) onAlreadyApplied();
      })
      .catch(() => {});
  }, [announcementId, showForm, onAlreadyApplied]);

  if (!showForm) {
    return (
      <button
        type="button"
        onClick={onToggleForm}
        className="mt-4 border-2 border-punk-green bg-punk-green px-6 py-3 font-punch text-sm uppercase tracking-widest text-punk-black transition-all hover:bg-punk-green/90"
      >
        Postulación directa
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <label htmlFor="applyMessage" className="block font-punch text-xs uppercase tracking-widest text-punk-white/70">
          Mensaje de postulación
        </label>
        <textarea
          id="applyMessage"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Presenta tu banda, enlaces a música, disponibilidad..."
          className="mt-2 w-full border-2 border-punk-white/20 bg-punk-black px-4 py-3 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-green focus:outline-none"
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading}
          className="border-2 border-punk-green bg-punk-green px-6 py-2 font-punch text-sm uppercase tracking-widest text-punk-black transition-all hover:bg-punk-green/90 disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Enviar postulación"}
        </button>
        <button
          type="button"
          onClick={onToggleForm}
          className="border-2 border-punk-white/30 px-6 py-2 font-punch text-sm uppercase tracking-widest text-punk-white/70 hover:border-punk-white"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
