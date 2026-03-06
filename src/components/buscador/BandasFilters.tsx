"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { BAND_LOCATIONS } from "@/lib/band-locations";
import { useTranslations } from "next-intl";

export function BandasFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("filters.bandas");

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const formData = new FormData(form);
      const params = new URLSearchParams();
      params.set("search", (formData.get("search") as string) || "");
      params.set("location", (formData.get("location") as string) || "");
      router.push(`/bandas?${params.toString()}`);
    },
    [router]
  );

  return (
    <form onSubmit={handleSubmit} className="mb-8 flex flex-wrap items-end gap-4 border-b-2 border-punk-green/30 pb-6">
      <div className="min-w-[180px] flex-1">
        <label htmlFor="bandas-search" className="block font-punch text-xs uppercase tracking-widest text-punk-white/70">
          {t("search")}
        </label>
        <input
          id="bandas-search"
          name="search"
          type="text"
          defaultValue={searchParams.get("search") ?? ""}
          placeholder={t("searchPlaceholder")}
          className="mt-1 w-full border-2 border-punk-white/20 bg-punk-black px-4 py-2 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-green focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="bandas-location" className="block font-punch text-xs uppercase tracking-widest text-punk-white/70">
          {t("territory")}
        </label>
        <select
          id="bandas-location"
          name="location"
          defaultValue={searchParams.get("location") ?? ""}
          className="mt-1 w-36 border-2 border-punk-white/20 bg-punk-black px-4 py-2 font-body text-punk-white focus:border-punk-green focus:outline-none"
        >
          <option value="">{t("all")}</option>
          {BAND_LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>
      <button type="submit" className="border-2 border-punk-green bg-punk-green px-6 py-2 font-punch text-xs uppercase tracking-widest text-punk-black hover:bg-transparent hover:text-punk-green transition-colors">
        {t("searchButton")}
      </button>
    </form>
  );
}
