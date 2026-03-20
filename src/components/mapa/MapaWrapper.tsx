"use client";

import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useScrollHide } from "@/hooks/useScrollHide";
import type { MapPoint } from "./MapaInteractivo";

const MapaInteractivo = dynamic(() => import("./MapaInteractivo").then((m) => m.MapaInteractivo), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[400px] items-center justify-center border-2 border-punk-red bg-punk-black/60">
      <p className="font-body text-punk-white/70">Cargando mapa…</p>
    </div>
  ),
});

type FilterValue = "all" | "TABERNA_BAR" | "SALA_CONCIERTOS" | "RECINTO_ABIERTO" | "GAZTETXE" | "SIN_CATEGORIA" | "festival";

const FILTER_OPTIONS: { value: FilterValue; labelKey: string }[] = [
  { value: "all", labelKey: "filter.all" },
  { value: "TABERNA_BAR", labelKey: "filter.TABERNA_BAR" },
  { value: "SALA_CONCIERTOS", labelKey: "filter.SALA_CONCIERTOS" },
  { value: "RECINTO_ABIERTO", labelKey: "filter.RECINTO_ABIERTO" },
  { value: "GAZTETXE", labelKey: "filter.GAZTETXE" },
  { value: "festival", labelKey: "filter.festival" },
  { value: "SIN_CATEGORIA", labelKey: "filter.SIN_CATEGORIA" },
];

type Props = {
  points: MapPoint[];
};

export function MapaWrapper({ points }: Props) {
  const t = useTranslations("map");
  const [filter, setFilter] = useState<FilterValue>("all");
  const headerVisible = useScrollHide();

  const filteredPoints = useMemo(() => {
    if (filter === "all") return points;
    if (filter === "festival") {
      return points.filter((p) => p.type === "festival");
    }
    if (filter === "SIN_CATEGORIA") {
      return points.filter((p) => p.type === "venue" && (!p.category || !p.category.trim()));
    }
    return points.filter((p) => p.type === "venue" && p.category === filter);
  }, [points, filter]);

  return (
    <div className="relative">
      {/* Mobile: mapa + overlays + barra inferior fija */}
      <div className="relative lg:hidden">
        {/* Contenedor mapa */}
        <div className="relative z-0 overflow-hidden">
          <MapaInteractivo
            points={filteredPoints}
            className="h-[calc(100dvh-3.5rem)] min-h-[280px] rounded-none border-2 border-punk-red shadow-[0_0_15px_rgba(230,0,38,0.3)]"
          />
        </div>

        {/* Barra inferior fija: solo filtros por categoría */}
        <div
          className="neon-map-bottom-bar fixed bottom-0 left-0 right-0 z-30 flex border-t-2 border-punk-green bg-punk-black/95 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] backdrop-blur-sm"
          style={{
            boxShadow: "0 -4px 20px rgba(0, 200, 83, 0.25), 0 0 30px rgba(0, 200, 83, 0.1)",
          }}
        >
          {/* Fila: filtros con scroll horizontal - padding en el contenido para que no se corte en los bordes */}
          <div className="flex min-w-0 flex-1 flex-nowrap gap-2 overflow-x-auto scrollbar-hide [scroll-snap-type:x_mandatory]">
            <div className="flex flex-nowrap gap-2 pl-4 pr-4">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFilter(opt.value)}
                className={`map-filter-btn flex shrink-0 items-center font-punch text-[10px] uppercase tracking-widest transition-all ${
                  filter === opt.value ? "active" : ""
                }`}
              >
                {t(opt.labelKey)}
              </button>
            ))}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: nuevo estilo con header scroll-hide (mobile sin cambios) */}
      <div className="hidden lg:block">
        {/* Header: se oculta al hacer scroll hacia abajo, reaparece al subir */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-out ${
            headerVisible ? "max-h-[180px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          <header className="sticky top-14 z-20 border-b-2 border-punk-white/10 bg-punk-black/95 px-6 py-4 backdrop-blur-md sm:px-12 lg:px-20 -mx-6 sm:-mx-12 lg:-mx-20">
            <div className="mx-auto max-w-7xl 2xl:max-w-content-wide">
              <h1 className="mb-4 font-display text-3xl tracking-tighter text-punk-white sm:text-4xl lg:text-5xl">
                {t("title")}
              </h1>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="font-body text-sm text-punk-white/60">
                  {t("subtitle", { count: filteredPoints.length })}
                </p>
                <div className="flex items-center gap-2">
                  <label htmlFor="map-filter" className="font-punch text-xs uppercase tracking-widest text-punk-white/70">
                    {t("filter.label")}
                  </label>
                  <select
                    id="map-filter"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as FilterValue)}
                    className="rounded-lg border-2 border-punk-white/20 bg-punk-black px-3 py-2 font-body text-punk-white focus:border-punk-pink focus:outline-none"
                  >
                    {FILTER_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {t(opt.labelKey)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </header>
        </div>

        {/* FAB: mostrar filtros cuando está oculto */}
        {!headerVisible && (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label={t("filter.label")}
            className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-[max(1.5rem,env(safe-area-inset-right))] z-30 flex items-center gap-2 rounded-full border-2 border-punk-pink bg-punk-pink px-4 py-3 font-punch text-xs uppercase tracking-widest text-punk-black shadow-lg transition-all hover:bg-transparent hover:text-punk-pink"
          >
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">{t("filter.label")}</span>
          </button>
        )}

        <div className="mt-4">
          <MapaInteractivo points={filteredPoints} />
        </div>
      </div>
    </div>
  );
}
