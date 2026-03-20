"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { BAND_LOCATIONS } from "@/lib/band-locations";

const CATEGORIES = [
  { value: "", key: "all" },
  { value: "SE_BUSCA_MUSICO", key: "SE_BUSCA_MUSICO" },
  { value: "SE_BUSCAN_BANDAS", key: "SE_BUSCAN_BANDAS" },
  { value: "CONCURSO", key: "CONCURSO" },
  { value: "LOCAL_MATERIAL", key: "LOCAL_MATERIAL" },
  { value: "SERVICIOS", key: "SERVICIOS" },
  { value: "OTROS", key: "OTROS" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];
export type TerritoryValue = "" | (typeof BAND_LOCATIONS)[number];

type Props = {
  category: string;
  onCategoryChange: (v: string) => void;
  territory: string;
  onTerritoryChange: (v: string) => void;
};

export function TablonOptimizedFilters({
  category,
  onCategoryChange,
  territory,
  onTerritoryChange,
}: Props) {
  const t = useTranslations("boardAnnouncement");
  const tFilters = useTranslations("boardAnnouncement.filters");

  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4">
      {/* Filtros: selects nativos en mobile, botones en desktop */}
      <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:gap-4">
        <div className="lg:hidden">
          <label htmlFor="tablon-opt-category" className="block font-punch text-xs uppercase tracking-widest text-punk-white/70">
            {tFilters("category")}
          </label>
          <select
            id="tablon-opt-category"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            aria-label={tFilters("category")}
            className="mt-1 w-full min-h-[44px] rounded-lg border-2 border-punk-white/20 bg-punk-black px-4 py-2.5 font-body text-punk-white focus:border-punk-yellow focus:outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value || "all"} value={c.value}>
                {c.value ? t(`categories.${c.key}`) : tFilters("all")}
              </option>
            ))}
          </select>
        </div>
        <div className="lg:hidden">
          <label htmlFor="tablon-opt-territory" className="block font-punch text-xs uppercase tracking-widest text-punk-white/70">
            {tFilters("territory")}
          </label>
          <select
            id="tablon-opt-territory"
            value={territory}
            onChange={(e) => onTerritoryChange(e.target.value)}
            aria-label={tFilters("territory")}
            className="mt-1 w-full min-h-[44px] rounded-lg border-2 border-punk-white/20 bg-punk-black px-4 py-2.5 font-body text-punk-white focus:border-punk-yellow focus:outline-none"
          >
            <option value="">{tFilters("allTerritories")}</option>
            {BAND_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <div className="hidden flex-wrap gap-2 lg:flex">
          <button
            type="button"
            onClick={() => onCategoryChange("")}
            className={`rounded-lg border-2 px-4 py-2 font-punch text-xs uppercase tracking-widest transition-all min-h-[44px] ${
              !category
                ? "border-punk-yellow bg-punk-yellow/20 text-punk-yellow"
                : "border-punk-white/30 text-punk-white/80 hover:border-punk-white/50 hover:text-punk-white"
            }`}
          >
            {tFilters("all")}
          </button>
          {CATEGORIES.filter((c) => c.value).map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => onCategoryChange(c.value)}
              className={`rounded-lg border-2 px-4 py-2 font-punch text-xs uppercase tracking-widest transition-all min-h-[44px] ${
                category === c.value
                  ? "border-punk-yellow bg-punk-yellow/20 text-punk-yellow"
                  : "border-punk-white/30 text-punk-white/80 hover:border-punk-white/50 hover:text-punk-white"
              }`}
            >
              {t(`categories.${c.key}`)}
            </button>
          ))}
        </div>
        <div className="hidden flex-wrap gap-2 lg:flex">
          <button
            type="button"
            onClick={() => onTerritoryChange("")}
            className={`rounded-lg border-2 px-4 py-2 font-punch text-xs uppercase tracking-widest transition-all min-h-[44px] ${
              !territory
                ? "border-punk-yellow bg-punk-yellow/20 text-punk-yellow"
                : "border-punk-white/30 text-punk-white/80 hover:border-punk-white/50 hover:text-punk-white"
            }`}
          >
            {tFilters("allTerritories")}
          </button>
          {BAND_LOCATIONS.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => onTerritoryChange(loc)}
              className={`rounded-lg border-2 px-4 py-2 font-punch text-xs uppercase tracking-widest transition-all min-h-[44px] ${
                territory === loc
                  ? "border-punk-yellow bg-punk-yellow/20 text-punk-yellow"
                  : "border-punk-white/30 text-punk-white/80 hover:border-punk-white/50 hover:text-punk-white"
              }`}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
