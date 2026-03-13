"use client";

import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

type FilterValue = "" | "TABERNA_BAR" | "SALA_CONCIERTOS" | "RECINTO_ABIERTO" | "GAZTETXE" | "SIN_CATEGORIA";

const FILTER_OPTIONS: { value: FilterValue; labelKey: string }[] = [
  { value: "", labelKey: "all" },
  { value: "TABERNA_BAR", labelKey: "TABERNA_BAR" },
  { value: "SALA_CONCIERTOS", labelKey: "SALA_CONCIERTOS" },
  { value: "RECINTO_ABIERTO", labelKey: "RECINTO_ABIERTO" },
  { value: "GAZTETXE", labelKey: "GAZTETXE" },
  { value: "SIN_CATEGORIA", labelKey: "SIN_CATEGORIA" },
];

type SalasMobilePanelProps = {
  controlled?: boolean;
  category?: FilterValue;
  onCategoryChange?: (v: FilterValue) => void;
  search?: string;
  onSearchChange?: (v: string) => void;
  onSubmit?: (search: string) => void;
  visible?: boolean;
};

export function SalasMobilePanel({
  controlled = false,
  category: controlledCategory,
  onCategoryChange,
  search: controlledSearch,
  onSearchChange,
  onSubmit,
  visible = true,
}: SalasMobilePanelProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("filters.salas");

  const [search, setSearch] = useState(controlledSearch ?? searchParams.get("search") ?? "");
  const currentCategory = controlled ? (controlledCategory ?? "") : (searchParams.get("category") as FilterValue) ?? "";

  useEffect(() => {
    if (!controlled) setSearch(searchParams.get("search") ?? "");
  }, [controlled, searchParams]);

  useEffect(() => {
    if (controlled && controlledSearch !== undefined) setSearch(controlledSearch);
  }, [controlled, controlledSearch]);

  const applyFilters = useCallback(
    (newSearch: string, newCategory: FilterValue) => {
      if (controlled) {
        onCategoryChange?.(newCategory);
        onSubmit?.(newSearch);
      } else {
        const params = new URLSearchParams();
        if (newSearch.trim()) params.set("search", newSearch.trim());
        if (newCategory) params.set("category", newCategory);
        router.push(`/salas?${params.toString()}`);
      }
    },
    [controlled, onCategoryChange, onSubmit, router],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (controlled) {
      onSearchChange?.(search);
      onSubmit?.(search);
    } else {
      applyFilters(search, currentCategory as FilterValue);
    }
  };

  const handleFilterClick = (category: FilterValue) => {
    if (controlled) {
      onCategoryChange?.(category);
    } else {
      applyFilters(search, category);
    }
  };

  return (
    <div
      className="neon-map-bottom-bar fixed bottom-0 left-0 right-0 z-30 flex flex-col gap-2 border-t-2 border-punk-green bg-punk-black/95 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] backdrop-blur-sm transition-transform duration-300 ease-out lg:hidden"
      style={{
        boxShadow: "0 -4px 20px rgba(0, 200, 83, 0.25), 0 0 30px rgba(0, 200, 83, 0.1)",
        transform: visible ? "translateY(0)" : "translateY(100%)",
      }}
    >
      {/* Buscador (nombre o ciudad) + filtros por categoría */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 px-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={controlled ? (controlledSearch ?? search) : search}
            onChange={(e) => {
              const v = e.target.value;
              setSearch(v);
              if (controlled) onSearchChange?.(v);
            }}
            placeholder={t("searchPlaceholder")}
            className="min-h-[44px] min-w-0 flex-1 border-2 border-punk-green bg-punk-black px-3 py-2.5 font-body text-punk-white placeholder:text-punk-white/40 focus:outline-none"
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
                  currentCategory === opt.value ? "active" : ""
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
