"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
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
      <div className="relative md:hidden">
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

      {/* Desktop: layout clásico */}
      <div className="hidden space-y-4 md:block">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="font-body text-punk-white/60">
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
              className="border-2 border-punk-white/20 bg-punk-black px-3 py-2 font-body text-punk-white focus:border-punk-pink focus:outline-none"
            >
              {FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(opt.labelKey)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <MapaInteractivo points={filteredPoints} />
      </div>
    </div>
  );
}
