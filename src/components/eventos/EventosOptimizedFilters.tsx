"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { SearchInput } from "@/components/ui/SearchInput";

export type FilterValue = "" | "CONCIERTO" | "FESTIVAL";

const FILTER_OPTIONS: { value: FilterValue; labelKey: string }[] = [
  { value: "", labelKey: "all" },
  { value: "CONCIERTO", labelKey: "concert" },
  { value: "FESTIVAL", labelKey: "festival" },
];

type Props = {
  filter: FilterValue;
  onFilterChange: (v: FilterValue) => void;
  search: string;
  onSearchChange: (v: string) => void;
  onSubmit: (search: string) => void;
};

export function EventosOptimizedFilters({
  filter,
  onFilterChange,
  search,
  onSearchChange,
  onSubmit,
}: Props) {
  const t = useTranslations("filters.eventos");

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
          accent="punk-red"
        />
      </div>

      {/* Filtros: select nativo en mobile (mejor UX), botones en desktop */}
      <div className="lg:hidden">
        <select
          value={filter}
          onChange={(e) => onFilterChange(e.target.value as FilterValue)}
          aria-label={t("type")}
          className="w-full min-h-[44px] rounded-lg border-2 border-punk-white/20 bg-punk-black px-4 py-2.5 font-body text-punk-white focus:border-punk-red focus:outline-none"
        >
          {FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {t(opt.labelKey)}
            </option>
          ))}
        </select>
      </div>
      <div className="hidden flex-wrap gap-2 lg:flex">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onFilterChange(opt.value)}
            className={`rounded-lg border-2 px-4 py-2 font-punch text-xs uppercase tracking-widest transition-all min-h-[44px] ${
              filter === opt.value
                ? "border-punk-red bg-punk-red/20 text-punk-red"
                : "border-punk-white/30 text-punk-white/80 hover:border-punk-white/50 hover:text-punk-white"
            }`}
          >
            {t(opt.labelKey)}
          </button>
        ))}
      </div>
    </form>
  );
}
