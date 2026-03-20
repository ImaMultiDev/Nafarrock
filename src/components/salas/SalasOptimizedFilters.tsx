"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { SearchInput } from "@/components/ui/SearchInput";

export type CategoryValue =
  | ""
  | "TABERNA_BAR"
  | "SALA_CONCIERTOS"
  | "RECINTO_ABIERTO"
  | "GAZTETXE"
  | "SIN_CATEGORIA";

const CATEGORY_OPTIONS: { value: CategoryValue; labelKey: string }[] = [
  { value: "", labelKey: "all" },
  { value: "TABERNA_BAR", labelKey: "TABERNA_BAR" },
  { value: "SALA_CONCIERTOS", labelKey: "SALA_CONCIERTOS" },
  { value: "RECINTO_ABIERTO", labelKey: "RECINTO_ABIERTO" },
  { value: "GAZTETXE", labelKey: "GAZTETXE" },
  { value: "SIN_CATEGORIA", labelKey: "SIN_CATEGORIA" },
];

type Props = {
  category: CategoryValue;
  onCategoryChange: (v: CategoryValue) => void;
  search: string;
  onSearchChange: (v: string) => void;
  onSubmit: (search: string) => void;
};

export function SalasOptimizedFilters({
  category,
  onCategoryChange,
  search,
  onSearchChange,
  onSubmit,
}: Props) {
  const t = useTranslations("filters.salas");

  const handleSearchChange = useCallback(
    (v: string) => {
      onSearchChange(v);
      onSubmit(v);
    },
    [onSearchChange, onSubmit],
  );

  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4">
      <div className="flex gap-2">
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder={t("searchPlaceholder")}
          aria-label={t("search")}
          accent="punk-pink"
        />
      </div>

      {/* Filtros: select nativo en mobile (mejor UX), botones en desktop */}
      <div className="lg:hidden">
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value as CategoryValue)}
          aria-label={t("category")}
          className="w-full min-h-[44px] rounded-lg border-2 border-punk-white/20 bg-punk-black px-4 py-2.5 font-body text-punk-white focus:border-punk-pink focus:outline-none"
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {t(opt.labelKey)}
            </option>
          ))}
        </select>
      </div>
      <div className="hidden flex-wrap gap-2 lg:flex">
        {CATEGORY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onCategoryChange(opt.value)}
            className={`rounded-lg border-2 px-4 py-2 font-punch text-xs uppercase tracking-widest transition-all min-h-[44px] ${
              category === opt.value
                ? "border-punk-pink bg-punk-pink/20 text-punk-pink"
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
