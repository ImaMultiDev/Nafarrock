"use client";

import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { BAND_LOCATIONS } from "@/lib/band-locations";

const CATEGORIES = [
  { value: "SE_BUSCA_MUSICO", key: "SE_BUSCA_MUSICO" },
  { value: "SE_BUSCAN_BANDAS", key: "SE_BUSCAN_BANDAS" },
  { value: "CONCURSO", key: "CONCURSO" },
  { value: "LOCAL_MATERIAL", key: "LOCAL_MATERIAL" },
  { value: "SERVICIOS", key: "SERVICIOS" },
  { value: "OTROS", key: "OTROS" },
] as const;

type TablonMobilePanelProps = {
  controlled?: boolean;
  category?: string;
  onCategoryChange?: (v: string) => void;
  territory?: string;
  onTerritoryChange?: (v: string) => void;
  onSubmit?: () => void;
  visible?: boolean;
};

export function TablonMobilePanel({
  controlled = false,
  category: controlledCategory,
  onCategoryChange,
  territory: controlledTerritory,
  onTerritoryChange,
  onSubmit,
  visible = true,
}: TablonMobilePanelProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("boardAnnouncement");
  const tFilters = useTranslations("boardAnnouncement.filters");

  const [category, setCategory] = useState(controlledCategory ?? searchParams.get("category") ?? "");
  const [territory, setTerritory] = useState(controlledTerritory ?? searchParams.get("territory") ?? "");

  useEffect(() => {
    if (!controlled) {
      setCategory(searchParams.get("category") ?? "");
      setTerritory(searchParams.get("territory") ?? "");
    }
  }, [controlled, searchParams]);

  useEffect(() => {
    if (controlled && controlledCategory !== undefined) setCategory(controlledCategory);
    if (controlled && controlledTerritory !== undefined) setTerritory(controlledTerritory);
  }, [controlled, controlledCategory, controlledTerritory]);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (controlled) {
        onSubmit?.();
      } else {
        const form = e.currentTarget;
        const formData = new FormData(form);
        const params = new URLSearchParams();
        params.set("category", (formData.get("category") as string) || "");
        params.set("territory", (formData.get("territory") as string) || "");
        params.set("page", "1");
        router.push(`/tablon?${params.toString()}`);
      }
    },
    [controlled, onSubmit, router],
  );

  return (
    <div
      className="neon-map-bottom-bar fixed bottom-0 left-0 right-0 z-30 flex flex-col gap-2 border-t-2 border-punk-green bg-punk-black/95 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] backdrop-blur-sm transition-transform duration-300 ease-out md:hidden"
      style={{
        boxShadow:
          "0 -4px 20px rgba(0, 200, 83, 0.25), 0 0 30px rgba(0, 200, 83, 0.1)",
        transform: visible ? "translateY(0)" : "translateY(100%)",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 px-4"
      >
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-0 flex-1">
            <label
              htmlFor="tablon-mobile-category"
              className="block font-punch text-[10px] uppercase tracking-widest text-punk-white/70"
            >
              {tFilters("category")}
            </label>
            <select
              id="tablon-mobile-category"
              name="category"
              value={controlled ? (controlledCategory ?? category) : category}
              onChange={(e) => {
                const v = e.target.value;
                setCategory(v);
                if (controlled) onCategoryChange?.(v);
              }}
              className="mt-1 w-full min-w-0 min-h-[44px] border-2 border-punk-green bg-punk-black px-3 py-2.5 font-body text-sm text-punk-white focus:border-punk-green focus:outline-none"
            >
              <option value="">{tFilters("all")}</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {t(`categories.${c.key}`)}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-0 flex-1">
            <label
              htmlFor="tablon-mobile-territory"
              className="block font-punch text-[10px] uppercase tracking-widest text-punk-white/70"
            >
              {tFilters("territory")}
            </label>
            <select
              id="tablon-mobile-territory"
              name="territory"
              value={controlled ? (controlledTerritory ?? territory) : territory}
              onChange={(e) => {
                const v = e.target.value;
                setTerritory(v);
                if (controlled) onTerritoryChange?.(v);
              }}
              className="mt-1 w-full min-w-0 min-h-[44px] border-2 border-punk-green bg-punk-black px-3 py-2.5 font-body text-sm text-punk-white focus:border-punk-green focus:outline-none"
            >
              <option value="">{tFilters("allTerritories")}</option>
              {BAND_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="map-filter-btn flex shrink-0 items-center font-punch text-[10px] uppercase tracking-widest transition-all"
          >
            {tFilters("filter")}
          </button>
        </div>
      </form>
    </div>
  );
}
