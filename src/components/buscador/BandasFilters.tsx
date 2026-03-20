"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { BAND_LOCATIONS } from "@/lib/band-locations";
import { useTranslations } from "next-intl";
import { SearchInput } from "@/components/ui/SearchInput";

export function BandasFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("filters.bandas");

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [location, setLocation] = useState(searchParams.get("location") ?? "");

  useEffect(() => {
    setSearch(searchParams.get("search") ?? "");
    setLocation(searchParams.get("location") ?? "");
  }, [searchParams]);

  const applyFilters = useCallback(
    (newSearch: string, newLocation: string) => {
      const params = new URLSearchParams();
      if (newSearch.trim()) params.set("search", newSearch.trim());
      if (newLocation) params.set("location", newLocation);
      router.push(`/bandas?${params.toString()}`);
    },
    [router],
  );

  const handleSearchChange = useCallback(
    (v: string) => {
      setSearch(v);
      applyFilters(v, location);
    },
    [location, applyFilters],
  );

  const handleLocationChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const v = e.target.value;
      setLocation(v);
      applyFilters(search, v);
    },
    [search, applyFilters],
  );

  return (
    <div className="mb-8 flex flex-wrap items-end gap-4 border-b-2 border-punk-green/30 pb-6">
      <div className="min-w-[180px] flex-1">
        <label htmlFor="bandas-search" className="block font-punch text-xs uppercase tracking-widest text-punk-white/70">
          {t("search")}
        </label>
        <div className="mt-1">
          <SearchInput
            id="bandas-search"
            value={search}
            onChange={handleSearchChange}
            placeholder={t("searchPlaceholder")}
            aria-label={t("search")}
            accent="punk-green"
          />
        </div>
      </div>
      <div>
        <label htmlFor="bandas-location" className="block font-punch text-xs uppercase tracking-widest text-punk-white/70">
          {t("territory")}
        </label>
        <select
          id="bandas-location"
          value={location}
          onChange={handleLocationChange}
          className="mt-1 w-36 border-2 border-punk-white/20 bg-punk-black px-4 py-2 font-body text-punk-white focus:border-punk-green focus:outline-none"
        >
          <option value="">{t("all")}</option>
          {BAND_LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
