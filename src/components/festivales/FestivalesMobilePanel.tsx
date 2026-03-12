"use client";

import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

type FestivalesMobilePanelProps = {
  controlled?: boolean;
  search?: string;
  onSearchChange?: (v: string) => void;
  onSubmit?: (search: string) => void;
  visible?: boolean;
};

export function FestivalesMobilePanel({
  controlled = false,
  search: controlledSearch,
  onSearchChange,
  onSubmit,
  visible = true,
}: FestivalesMobilePanelProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("filters.festivales");

  const [search, setSearch] = useState(controlledSearch ?? searchParams.get("search") ?? "");

  useEffect(() => {
    if (!controlled) setSearch(searchParams.get("search") ?? "");
  }, [controlled, searchParams]);

  useEffect(() => {
    if (controlled && controlledSearch !== undefined) setSearch(controlledSearch);
  }, [controlled, controlledSearch]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (controlled) {
        onSearchChange?.(search);
        onSubmit?.(search);
      } else {
        const params = new URLSearchParams();
        if (search.trim()) params.set("search", search.trim());
        router.push(`/festivales?${params.toString()}`);
      }
    },
    [controlled, onSearchChange, onSubmit, router, search],
  );

  return (
    <div
      className="neon-map-bottom-bar fixed bottom-0 left-0 right-0 z-30 flex flex-col gap-2 border-t-2 border-punk-green bg-punk-black/95 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] backdrop-blur-sm transition-transform duration-300 ease-out md:hidden"
      style={{
        boxShadow: "0 -4px 20px rgba(0, 200, 83, 0.25), 0 0 30px rgba(0, 200, 83, 0.1)",
        transform: visible ? "translateY(0)" : "translateY(100%)",
      }}
    >
      {/* Solo buscador por nombre */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4">
        <input
          type="text"
          value={controlled ? (controlledSearch ?? search) : search}
          onChange={(e) => {
            const v = e.target.value;
            setSearch(v);
            if (controlled) onSearchChange?.(v);
          }}
          placeholder={t("searchPlaceholder")}
          className="min-h-[44px] min-w-0 flex-1 border-2 border-punk-green bg-punk-black px-3 py-2.5 font-body text-punk-white placeholder:text-punk-white/40 focus:outline-none"
          aria-label={t("search")}
        />
        <button
          type="submit"
          className="map-filter-btn flex shrink-0 items-center gap-1.5 font-punch text-[10px] uppercase tracking-widest transition-all"
          aria-label={t("searchButton")}
        >
          <Search className="h-4 w-4" />
          {t("searchButton")}
        </button>
      </form>
    </div>
  );
}
