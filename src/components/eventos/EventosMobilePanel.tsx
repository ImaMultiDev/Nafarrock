"use client";

import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

type FilterValue = "" | "CONCIERTO" | "FESTIVAL";

const FILTER_OPTIONS: { value: FilterValue; labelKey: string }[] = [
  { value: "", labelKey: "all" },
  { value: "CONCIERTO", labelKey: "concert" },
  { value: "FESTIVAL", labelKey: "festival" },
];

export function EventosMobilePanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("filters.eventos");

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const currentType = (searchParams.get("type") as FilterValue) ?? "";

  useEffect(() => {
    setSearch(searchParams.get("search") ?? "");
  }, [searchParams]);

  const applyFilters = useCallback(
    (newSearch: string, newType: FilterValue) => {
      const params = new URLSearchParams();
      if (newSearch.trim()) params.set("search", newSearch.trim());
      if (newType) params.set("type", newType);
      router.push(`/eventos?${params.toString()}`);
    },
    [router],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(search, currentType);
  };

  const handleFilterClick = (type: FilterValue) => {
    applyFilters(search, type);
  };

  return (
    <div
      className="neon-map-bottom-bar fixed bottom-0 left-0 right-0 z-30 flex flex-col gap-2 border-t-2 border-punk-green bg-punk-black/95 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] backdrop-blur-sm md:hidden"
      style={{
        boxShadow: "0 -4px 20px rgba(0, 200, 83, 0.25), 0 0 30px rgba(0, 200, 83, 0.1)",
      }}
    >
      {/* Buscador + filtros */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 px-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="min-h-[36px] min-w-0 flex-1 border-2 border-punk-green bg-punk-black px-3 py-2 font-body text-punk-white placeholder:text-punk-white/40 focus:outline-none"
            aria-label={t("search")}
          />
          <button
            type="submit"
            className="map-filter-btn flex shrink-0 items-center gap-1.5 font-punch text-[10px] uppercase tracking-widest transition-all"
            aria-label={t("searchButton")}
          >
            <Search className="h-4 w-4" />
            {t("searchButton")}
          </button>
        </div>
        <div className="flex min-w-0 flex-1 flex-nowrap gap-2 overflow-x-auto scrollbar-hide [scroll-snap-type:x_mandatory]">
          <div className="flex flex-nowrap gap-2 pl-0 pr-4">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleFilterClick(opt.value)}
                className={`map-filter-btn flex shrink-0 items-center font-punch text-[10px] uppercase tracking-widest transition-all ${
                  currentType === opt.value ? "active" : ""
                }`}
              >
                {t(opt.labelKey)}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
