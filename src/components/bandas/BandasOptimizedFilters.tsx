"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { BAND_LOCATIONS } from "@/lib/band-locations";
import { SearchInput } from "@/components/ui/SearchInput";

type Props = {
  location: string;
  onLocationChange: (v: string) => void;
  search: string;
  onSearchChange: (v: string) => void;
  onSubmit: (search: string) => void;
};

export function BandasOptimizedFilters({
  location,
  onLocationChange,
  search,
  onSearchChange,
  onSubmit,
}: Props) {
  const t = useTranslations("filters.bandas");

  const handleSearchChange = useCallback(
    (v: string) => {
      onSearchChange(v);
      onSubmit(v);
    },
    [onSearchChange, onSubmit],
  );

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex flex-col gap-4"
    >
      <div className="flex gap-2">
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder={t("searchPlaceholder")}
          aria-label={t("search")}
          accent="punk-green"
        />
      </div>

      {/* Filtros: select nativo en mobile (mejor UX), botones en desktop */}
      <div className="lg:hidden">
        <select
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          aria-label={t("territory")}
          className="w-full min-h-[44px] rounded-lg border-2 border-punk-white/20 bg-punk-black px-4 py-2.5 font-body text-punk-white focus:border-punk-green focus:outline-none"
        >
          <option value="">{t("all")}</option>
          {BAND_LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>
      <div className="hidden flex-wrap gap-2 lg:flex">
        <button
          type="button"
          onClick={() => onLocationChange("")}
          className={`rounded-lg border-2 px-4 py-2 font-punch text-xs uppercase tracking-widest transition-all min-h-[44px] ${
            !location
              ? "border-punk-green bg-punk-green/20 text-punk-green"
              : "border-punk-white/30 text-punk-white/80 hover:border-punk-white/50 hover:text-punk-white"
          }`}
        >
          {t("all")}
        </button>
        {BAND_LOCATIONS.map((loc) => (
          <button
            key={loc}
            type="button"
            onClick={() => onLocationChange(loc)}
            className={`rounded-lg border-2 px-4 py-2 font-punch text-xs uppercase tracking-widest transition-all min-h-[44px] ${
              location === loc
                ? "border-punk-green bg-punk-green/20 text-punk-green"
                : "border-punk-white/30 text-punk-white/80 hover:border-punk-white/50 hover:text-punk-white"
            }`}
          >
            {loc}
          </button>
        ))}
      </div>
    </form>
  );
}
