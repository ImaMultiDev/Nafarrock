"use client";

import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { SearchInput } from "@/components/ui/SearchInput";
import { BAND_LOCATIONS } from "@/lib/band-locations";

type BandasMobilePanelProps = {
  /** Modo controlado: usa state externo en lugar de URL */
  controlled?: boolean;
  location?: string;
  onLocationChange?: (v: string) => void;
  search?: string;
  onSearchChange?: (v: string) => void;
  onSubmit?: (search: string) => void;
  /** Scroll Hide/Show: false = oculto al hacer scroll hacia abajo */
  visible?: boolean;
};

export function BandasMobilePanel({
  controlled = false,
  location: controlledLocation,
  onLocationChange,
  search: controlledSearch,
  onSearchChange,
  onSubmit,
  visible = true,
}: BandasMobilePanelProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("filters.bandas");

  const [search, setSearch] = useState(controlledSearch ?? searchParams.get("search") ?? "");
  const currentLocation = controlled ? (controlledLocation ?? "") : searchParams.get("location") ?? "";

  useEffect(() => {
    if (!controlled) setSearch(searchParams.get("search") ?? "");
  }, [controlled, searchParams]);

  useEffect(() => {
    if (controlled && controlledSearch !== undefined) setSearch(controlledSearch);
  }, [controlled, controlledSearch]);

  const applyFilters = useCallback(
    (newSearch: string, newLocation: string) => {
      if (controlled) {
        onLocationChange?.(newLocation);
        onSubmit?.(newSearch);
      } else {
        const params = new URLSearchParams();
        if (newSearch.trim()) params.set("search", newSearch.trim());
        if (newLocation) params.set("location", newLocation);
        router.push(`/bandas?${params.toString()}`);
      }
    },
    [controlled, onLocationChange, onSubmit, router],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (controlled) {
      onSearchChange?.(search);
      onSubmit?.(search);
    } else {
      applyFilters(search, currentLocation);
    }
  };

  const handleSearchChange = useCallback(
    (v: string) => {
      setSearch(v);
      if (controlled) {
        onSearchChange?.(v);
        onSubmit?.(v);
      } else {
        applyFilters(v, currentLocation);
      }
    },
    [controlled, currentLocation, onSearchChange, onSubmit, applyFilters],
  );

  const handleFilterClick = (location: string) => {
    if (controlled) {
      onLocationChange?.(location);
    } else {
      applyFilters(search, location);
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
      {/* Buscador + filtros - padding con safe area para evitar recorte en laterales */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))]"
      >
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
          <div className="flex flex-nowrap gap-2 pl-0 pr-[max(1rem,env(safe-area-inset-right,0px))]">
            <button
              type="button"
              onClick={() => handleFilterClick("")}
              className={`map-filter-btn flex shrink-0 items-center font-punch text-[10px] uppercase tracking-widest transition-all ${
                !currentLocation ? "active" : ""
              }`}
            >
              {t("all")}
            </button>
            {BAND_LOCATIONS.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => handleFilterClick(loc)}
                className={`map-filter-btn flex shrink-0 items-center font-punch text-[10px] uppercase tracking-widest transition-all ${
                  currentLocation === loc ? "active" : ""
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
