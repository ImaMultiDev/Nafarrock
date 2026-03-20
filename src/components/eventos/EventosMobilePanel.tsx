"use client";

import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { SearchInput } from "@/components/ui/SearchInput";

export type FilterValue = "" | "CONCIERTO" | "FESTIVAL";

const FILTER_OPTIONS: { value: FilterValue; labelKey: string }[] = [
  { value: "", labelKey: "all" },
  { value: "CONCIERTO", labelKey: "concert" },
  { value: "FESTIVAL", labelKey: "festival" },
];

type EventosMobilePanelProps = {
  /** Modo controlado: usa state externo en lugar de URL */
  controlled?: boolean;
  filter?: FilterValue;
  onFilterChange?: (v: FilterValue) => void;
  search?: string;
  onSearchChange?: (v: string) => void;
  onSubmit?: (search: string) => void;
  /** Scroll Hide/Show: false = oculto al hacer scroll hacia abajo */
  visible?: boolean;
};

export function EventosMobilePanel({
  controlled = false,
  filter: controlledFilter,
  onFilterChange,
  search: controlledSearch,
  onSearchChange,
  onSubmit,
  visible = true,
}: EventosMobilePanelProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("filters.eventos");

  const [search, setSearch] = useState(controlledSearch ?? searchParams.get("search") ?? "");
  const currentType = controlled ? (controlledFilter ?? "") : (searchParams.get("type") as FilterValue) ?? "";

  useEffect(() => {
    if (!controlled) setSearch(searchParams.get("search") ?? "");
  }, [controlled, searchParams]);

  useEffect(() => {
    if (controlled && controlledSearch !== undefined) setSearch(controlledSearch);
  }, [controlled, controlledSearch]);

  const applyFilters = useCallback(
    (newSearch: string, newType: FilterValue) => {
      if (controlled) {
        onFilterChange?.(newType);
        onSubmit?.(newSearch);
      } else {
        const params = new URLSearchParams();
        if (newSearch.trim()) params.set("search", newSearch.trim());
        if (newType) params.set("type", newType);
        router.push(`/eventos?${params.toString()}`);
      }
    },
    [controlled, onFilterChange, onSubmit, router],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (controlled) {
      onSearchChange?.(search);
      onSubmit?.(search);
    } else {
      applyFilters(search, currentType as FilterValue);
    }
  };

  const handleSearchChange = useCallback(
    (v: string) => {
      setSearch(v);
      if (controlled) {
        onSearchChange?.(v);
        onSubmit?.(v);
      } else {
        applyFilters(v, currentType as FilterValue);
      }
    },
    [controlled, currentType, onSearchChange, onSubmit, applyFilters],
  );

  const handleFilterClick = (type: FilterValue) => {
    if (controlled) {
      onFilterChange?.(type);
    } else {
      applyFilters(search, type);
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
      {/* Buscador + filtros */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 px-4">
        <div className="flex items-center gap-2">
          <SearchInput
            value={controlled ? (controlledSearch ?? search) : search}
            onChange={handleSearchChange}
            placeholder={t("searchPlaceholder")}
            aria-label={t("search")}
            accent="punk-green"
            compact
            variant="green"
          />
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
