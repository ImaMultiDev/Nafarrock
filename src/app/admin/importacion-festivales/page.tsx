"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import type { FestivalImportRow, RowValidationError } from "@/lib/csv-festivals";

type Step = "upload" | "preview" | "done";

function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toISOString().slice(0, 10);
}

export default function ImportacionFestivalesPage() {
  const [step, setStep] = useState<Step>("upload");
  const [valid, setValid] = useState<FestivalImportRow[]>([]);
  const [errors, setErrors] = useState<RowValidationError[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{
    created: number;
    eventsCreated: number;
    failed: number;
    createdNames: string[];
    eventNames: string[];
    failedDetails: { row: number; message: string }[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    window.open("/api/admin/festivals/import/template", "_blank");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("file", file);

      const res = await fetch("/api/admin/festivals/import/validate", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.message ?? "Error al validar");
        setValid([]);
        setErrors([]);
        return;
      }

      setValid(data.valid ?? []);
      setErrors(data.errors ?? []);

      if (data.valid?.length > 0) {
        setStep("preview");
      }
    } catch {
      setUploadError("Error de conexión");
      setValid([]);
      setErrors([]);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleImport = async () => {
    if (valid.length === 0) return;

    setLoading(true);
    setUploadError(null);

    try {
      const res = await fetch("/api/admin/festivals/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(valid),
      });

      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.message ?? "Error al importar");
        return;
      }

      setImportResult(data);
      setStep("done");
    } catch {
      setUploadError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep("upload");
    setValid([]);
    setErrors([]);
    setImportResult(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const inputClass =
    "mt-2 w-full border-2 border-punk-white/20 bg-punk-black px-4 py-3 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-pink focus:outline-none";

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl">
            IMPORTACIÓN FESTIVALES
          </h1>
          <p className="mt-2 font-body text-punk-white/60">
            {step === "upload" && "Sube un CSV para validar e importar festivales"}
            {step === "preview" && `${valid.length} festivales listos para importar`}
            {step === "done" && "Importación completada"}
          </p>
        </div>
        <Link
          href="/admin/festivales"
          className="border-2 border-punk-white/30 px-6 py-3 font-punch text-sm uppercase tracking-widest text-punk-white/70 hover:border-punk-white hover:text-punk-white"
        >
          ← Festivales
        </Link>
      </div>

      {step === "upload" && (
        <div className="mt-10 max-w-2xl space-y-6">
          <div className="border-2 border-punk-pink/30 bg-punk-black/60 p-6">
            <h2 className="font-punch text-sm uppercase tracking-widest text-punk-pink">
              1. Descarga la plantilla
            </h2>
            <p className="mt-2 font-body text-sm text-punk-white/70">
              Usa la plantilla CSV con las columnas correctas y un ejemplo de relleno.
            </p>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="mt-4 inline-flex items-center gap-2 border-2 border-punk-pink bg-punk-pink px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-black transition-all hover:bg-punk-pink/90"
            >
              Descargar plantilla CSV
            </button>
          </div>

          <div className="border-2 border-punk-white/20 bg-punk-black/60 p-6">
            <h2 className="font-punch text-sm uppercase tracking-widest text-punk-white/70">
              2. Sube tu archivo
            </h2>
            <p className="mt-2 font-body text-sm text-punk-white/60">
              Obligatorio: <strong className="text-punk-white">Nombre</strong>. Resto
              opcional: ubicación, descripción, fechas de edición, URLs, logo e imágenes.
            </p>
            <p className="mt-1 font-body text-xs text-punk-white/50">
              Si hay fecha_inicio se crea también un evento de edición (tipo festival), sin
              bandas. Podrás completar cartel y más datos después.
            </p>
            <label className="mt-4 block">
              <span className="sr-only">Seleccionar CSV</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={loading}
                className={inputClass}
              />
            </label>
          </div>

          {uploadError && (
            <div className="border-2 border-punk-red bg-punk-red/10 p-4">
              <p className="font-body text-punk-red">{uploadError}</p>
            </div>
          )}

          {errors.length > 0 && valid.length === 0 && (
            <div className="border-2 border-punk-red/50 bg-punk-red/5 p-6">
              <h3 className="font-punch text-sm uppercase tracking-widest text-punk-red">
                Errores de validación
              </h3>
              <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto font-body text-sm text-punk-white/90">
                {errors.map((e, i) => (
                  <li key={i}>
                    Fila {e.row}: {e.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {errors.length > 0 && valid.length > 0 && (
            <div className="border-2 border-punk-yellow/50 bg-punk-yellow/5 p-6">
              <h3 className="font-punch text-sm uppercase tracking-widest text-punk-yellow">
                Filas con errores (ignoradas)
              </h3>
              <ul className="mt-3 max-h-32 space-y-1 overflow-y-auto font-body text-sm text-punk-white/80">
                {errors.map((e, i) => (
                  <li key={i}>
                    Fila {e.row}: {e.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {loading && (
            <p className="font-body text-punk-white/60">Validando archivo...</p>
          )}
        </div>
      )}

      {step === "preview" && (
        <div className="mt-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="font-body text-punk-white/80">
              {valid.length} festivales válidos. Se crearán como{" "}
              <strong className="text-punk-pink">aprobados</strong> (creados por
              Nafarrock).
              {valid.some((r) => r.fecha_inicio) && (
                <span className="mt-1 block text-sm text-punk-white/60">
                  Con fecha_inicio se creará también el evento de esa edición.
                </span>
              )}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="border-2 border-punk-white/30 px-6 py-2 font-punch text-xs uppercase tracking-widest text-punk-white/70 hover:border-punk-white"
              >
                Subir otro archivo
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={loading}
                className="border-2 border-punk-pink bg-punk-pink px-6 py-2 font-punch text-xs uppercase tracking-widest text-punk-black transition-all hover:bg-punk-pink/90 disabled:opacity-50"
              >
                {loading ? "Importando..." : "Confirmar importación"}
              </button>
            </div>
          </div>

          {uploadError && (
            <div className="border-2 border-punk-red bg-punk-red/10 p-4">
              <p className="font-body text-punk-red">{uploadError}</p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead>
                <tr className="border-b-2 border-punk-pink/50">
                  <th className="py-3 font-punch text-xs uppercase tracking-widest text-punk-white/70">
                    Nombre
                  </th>
                  <th className="py-3 font-punch text-xs uppercase tracking-widest text-punk-white/70">
                    Ubicación
                  </th>
                  <th className="py-3 font-punch text-xs uppercase tracking-widest text-punk-white/70">
                    Fechas
                  </th>
                  <th className="py-3 font-punch text-xs uppercase tracking-widest text-punk-white/70">
                    Web / IG
                  </th>
                </tr>
              </thead>
              <tbody>
                {valid.map((row, i) => (
                  <tr key={i} className="border-b border-punk-white/10">
                    <td className="py-3 font-body text-punk-white">{row.nombre}</td>
                    <td className="py-3 font-body text-sm text-punk-white/60">
                      {row.ubicacion || "—"}
                    </td>
                    <td className="py-3 font-body text-sm text-punk-white/60">
                      {row.fecha_inicio
                        ? `${formatDate(row.fecha_inicio)}${
                            row.fecha_fin ? ` → ${formatDate(row.fecha_fin)}` : ""
                          }`
                        : "—"}
                    </td>
                    <td className="py-3 font-body text-sm text-punk-white/60 max-w-[180px] truncate">
                      {row.web_url || row.instagram_url || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {step === "done" && importResult && (
        <div className="mt-10 max-w-2xl space-y-6">
          <div className="border-2 border-punk-pink/50 bg-punk-pink/10 p-6">
            <h2 className="font-punch text-sm uppercase tracking-widest text-punk-pink">
              Importación completada
            </h2>
            <p className="mt-2 font-body text-punk-white/90">
              {importResult.created} festivales creados correctamente.
              {importResult.eventsCreated > 0 && (
                <span className="mt-1 block">
                  {importResult.eventsCreated} eventos de edición creados.
                </span>
              )}
              {importResult.failed > 0 && (
                <span className="mt-2 block text-punk-yellow">
                  {importResult.failed} filas fallaron.
                </span>
              )}
            </p>
            {importResult.failedDetails?.length > 0 && (
              <ul className="mt-3 space-y-1 font-body text-sm text-punk-white/70">
                {importResult.failedDetails.map((f, i) => (
                  <li key={i}>
                    Fila {f.row}: {f.message}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/admin/festivales"
              className="border-2 border-punk-pink bg-punk-pink px-6 py-3 font-punch text-sm uppercase tracking-widest text-punk-black transition-all hover:bg-punk-pink/90"
            >
              Ver festivales
            </Link>
            <button
              type="button"
              onClick={handleReset}
              className="border-2 border-punk-white/30 px-6 py-3 font-punch text-sm uppercase tracking-widest text-punk-white/70 hover:border-punk-white"
            >
              Importar más
            </button>
          </div>
        </div>
      )}
    </>
  );
}
