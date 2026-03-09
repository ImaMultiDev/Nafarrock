"use client";

import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { BAND_LOCATIONS } from "@/lib/band-locations";

const CATEGORIES = [
  { value: "SE_BUSCA_MUSICO", key: "SE_BUSCA_MUSICO" },
  { value: "SE_BUSCAN_BANDAS", key: "SE_BUSCAN_BANDAS" },
  { value: "CONCURSO", key: "CONCURSO" },
  { value: "LOCAL_MATERIAL", key: "LOCAL_MATERIAL" },
  { value: "SERVICIOS", key: "SERVICIOS" },
  { value: "OTROS", key: "OTROS" },
] as const;

export function TablonFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("boardAnnouncement");
  const tFilters = useTranslations("boardAnnouncement.filters");

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const formData = new FormData(form);
      const params = new URLSearchParams();
      params.set("category", (formData.get("category") as string) || "");
      params.set("territory", (formData.get("territory") as string) || "");
      params.set("page", "1");
      router.push(`/tablon?${params.toString()}`);
    },
    [router]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 flex flex-wrap items-end gap-4 border-b-2 border-punk-yellow/30 pb-6"
    >
      <div>
        <label
          htmlFor="tablon-category"
          className="block font-punch text-xs uppercase tracking-widest text-punk-white/70"
        >
          {tFilters("category")}
        </label>
        <select
          id="tablon-category"
          name="category"
          defaultValue={searchParams.get("category") ?? ""}
          className="mt-1 w-48 border-2 border-punk-white/20 bg-punk-black px-4 py-2 font-body text-punk-white focus:border-punk-yellow focus:outline-none"
        >
          <option value="">{tFilters("all")}</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {t(`categories.${c.key}`)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          htmlFor="tablon-territory"
          className="block font-punch text-xs uppercase tracking-widest text-punk-white/70"
        >
          {tFilters("territory")}
        </label>
        <select
          id="tablon-territory"
          name="territory"
          defaultValue={searchParams.get("territory") ?? ""}
          className="mt-1 w-48 border-2 border-punk-white/20 bg-punk-black px-4 py-2 font-body text-punk-white focus:border-punk-yellow focus:outline-none"
        >
          <option value="">{tFilters("allTerritories")}</option>
          {BAND_LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="border-2 border-punk-yellow bg-punk-yellow px-6 py-2 font-punch text-xs uppercase tracking-widest text-punk-black transition-colors hover:bg-transparent hover:text-punk-yellow"
      >
        {tFilters("filter")}
      </button>
    </form>
  );
}
