"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { SearchInput } from "@/components/ui/SearchInput";

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  onSubmit: (search: string) => void;
};

export function FestivalesOptimizedFilters({
  search,
  onSearchChange,
  onSubmit,
}: Props) {
  const t = useTranslations("filters.festivales");

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
          accent="punk-red"
        />
      </div>
    </form>
  );
}
