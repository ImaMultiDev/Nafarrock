"use client";

import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useCallback } from "react";
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

export function TablonMobilePanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("boardAnnouncement");
  const tFilters = useTranslations("boardAnnouncement.filters");

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const formData = new FormData(form);
      const params = new URLSearchParams();
      params.set("category", (formData.get("category") as string) || "");
      params.set("territory", (formData.get("territory") as string) || "");
      params.set("page", "1");
      router.push(`/tablon?${params.toString()}`);
    },
    [router],
  );

  return (
    <div
      className="neon-map-bottom-bar fixed bottom-0 left-0 right-0 z-30 flex flex-col gap-2 border-t-2 border-punk-green bg-punk-black/95 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] backdrop-blur-sm md:hidden"
      style={{
        boxShadow:
          "0 -4px 20px rgba(0, 200, 83, 0.25), 0 0 30px rgba(0, 200, 83, 0.1)",
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
              defaultValue={searchParams.get("category") ?? ""}
              className="mt-1 w-full min-w-0 border-2 border-punk-green bg-punk-black px-3 py-2 font-body text-sm text-punk-white focus:border-punk-green focus:outline-none"
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
              defaultValue={searchParams.get("territory") ?? ""}
              className="mt-1 w-full min-w-0 border-2 border-punk-green bg-punk-black px-3 py-2 font-body text-sm text-punk-white focus:border-punk-green focus:outline-none"
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
