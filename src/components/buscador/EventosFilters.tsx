"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { SearchInput } from "@/components/ui/SearchInput";

export function EventosFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("filters.eventos");

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [type, setType] = useState(searchParams.get("type") ?? "");

  useEffect(() => {
    setSearch(searchParams.get("search") ?? "");
    setType(searchParams.get("type") ?? "");
  }, [searchParams]);

  const applyFilters = useCallback(
    (newSearch: string, newType: string) => {
      const params = new URLSearchParams();
      if (newSearch.trim()) params.set("search", newSearch.trim());
      if (newType) params.set("type", newType);
      router.push(`/eventos?${params.toString()}`);
    },
    [router],
  );

  const handleSearchChange = useCallback(
    (v: string) => {
      setSearch(v);
      applyFilters(v, type);
    },
    [type, applyFilters],
  );

  const handleTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const v = e.target.value;
      setType(v);
      applyFilters(search, v);
    },
    [search, applyFilters],
  );

  return (
    <div className="mb-8 flex flex-wrap items-end gap-4 border-b-2 border-punk-red/30 pb-6">
      <div className="min-w-[180px] flex-1">
        <label
          htmlFor="eventos-search"
          className="block font-punch text-xs uppercase tracking-widest text-punk-white/70"
        >
          {t("search")}
        </label>
        <div className="mt-1">
          <SearchInput
            id="eventos-search"
            value={search}
            onChange={handleSearchChange}
            placeholder={t("searchPlaceholder")}
            aria-label={t("search")}
            accent="punk-red"
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="eventos-type"
          className="block font-punch text-xs uppercase tracking-widest text-punk-white/70"
        >
          {t("type")}
        </label>
        <select
          id="eventos-type"
          value={type}
          onChange={handleTypeChange}
          className="mt-1 border-2 border-punk-white/20 bg-punk-black px-4 py-2 font-body text-punk-white focus:border-punk-red focus:outline-none"
        >
          <option value="">{t("all")}</option>
          <option value="CONCIERTO">{t("concert")}</option>
          <option value="FESTIVAL">{t("festival")}</option>
        </select>
      </div>
    </div>
  );
}
