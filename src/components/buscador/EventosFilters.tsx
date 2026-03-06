"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useTranslations } from "next-intl";

export function EventosFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("filters.eventos");

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const formData = new FormData(form);
      const params = new URLSearchParams();
      params.set("search", (formData.get("search") as string) || "");
      params.set("type", (formData.get("type") as string) || "");
      router.push(`/eventos?${params.toString()}`);
    },
    [router],
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 flex flex-wrap items-end gap-4 border-b-2 border-punk-red/30 pb-6"
    >
      <div className="min-w-[180px] flex-1">
        <label
          htmlFor="eventos-search"
          className="block font-punch text-xs uppercase tracking-widest text-punk-white/70"
        >
          {t("search")}
        </label>
        <input
          id="eventos-search"
          name="search"
          type="text"
          defaultValue={searchParams.get("search") ?? ""}
          placeholder={t("searchPlaceholder")}
          className="mt-1 w-full border-2 border-punk-white/20 bg-punk-black px-4 py-2 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-red focus:outline-none"
        />
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
          name="type"
          defaultValue={searchParams.get("type") ?? ""}
          className="mt-1 border-2 border-punk-white/20 bg-punk-black px-4 py-2 font-body text-punk-white focus:border-punk-red focus:outline-none"
        >
          <option value="">{t("all")}</option>
          <option value="CONCIERTO">{t("concert")}</option>
          <option value="FESTIVAL">{t("festival")}</option>
        </select>
      </div>
      <button
        type="submit"
        className="border-2 border-punk-red bg-punk-red px-6 py-2 font-punch text-xs uppercase tracking-widest text-punk-black hover:bg-transparent hover:text-punk-red transition-colors"
      >
        {t("searchButton")}
      </button>
    </form>
  );
}
