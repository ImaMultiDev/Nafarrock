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
    <div className="space-y-4">
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
            <option value="all">{t("filter.all")}</option>
            <option value="TABERNA_BAR">{t("filter.TABERNA_BAR")}</option>
            <option value="SALA_CONCIERTOS">{t("filter.SALA_CONCIERTOS")}</option>
            <option value="RECINTO_ABIERTO">{t("filter.RECINTO_ABIERTO")}</option>
            <option value="GAZTETXE">{t("filter.GAZTETXE")}</option>
            <option value="festival">{t("filter.festival")}</option>
            <option value="SIN_CATEGORIA">{t("filter.SIN_CATEGORIA")}</option>
          </select>
        </div>
      </div>
      <MapaInteractivo points={filteredPoints} />
    </div>
  );
}
