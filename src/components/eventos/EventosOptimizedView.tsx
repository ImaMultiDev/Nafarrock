"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { getDateLocale } from "@/lib/date-locale";
import { Link } from "@/i18n/navigation";
import { EventosOptimizedFilters } from "./EventosOptimizedFilters";
import { EventosOptimizedCard } from "./EventosOptimizedCard";
import { PunkLoadingIndicator } from "@/components/ui/PunkLoadingIndicator";
import { useScrollHide } from "@/hooks/useScrollHide";
import type { FilterValue } from "./EventosOptimizedFilters";

type EventItem = {
  id: string;
  slug: string;
  title: string;
  date: string;
  endDate: string | null;
  type: string;
  imageUrl: string | null;
  venue: { name: string; city: string } | null;
  venueText: string | null;
  festival: { name: string; slug: string; location: string | null } | null;
  isSoldOut?: boolean;
};

const PAGE_SIZE = 12;

async function fetchEventos(
  page: number,
  type: FilterValue,
  search: string
): Promise<{ items: EventItem[]; total: number; hasMore: boolean }> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(PAGE_SIZE));
  if (type) params.set("type", type);
  if (search.trim()) params.set("search", search.trim());
  const res = await fetch(`/api/eventos?${params.toString()}`);
  if (!res.ok) throw new Error("Error al cargar eventos");
  return res.json();
}

export function EventosOptimizedView() {
  const t = useTranslations("events");
  const tActions = useTranslations("common.actions");
  const tFilters = useTranslations("filters.eventos");
  const locale = useLocale();
  const dateLocale = getDateLocale(locale);
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState<FilterValue>("");
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");

  useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: ["eventos-optimized"] });
    };
  }, [queryClient]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["eventos-optimized", filter, submittedSearch],
    queryFn: ({ pageParam }) => fetchEventos(pageParam, filter, submittedSearch),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length + 1 : undefined,
    staleTime: 5 * 60 * 1000,
  });

  const allEvents = data?.pages.flatMap((p) => p.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleSearchSubmit = useCallback((s: string) => {
    setSubmittedSearch(s);
  }, []);

  const headerVisible = useScrollHide();

  // Intersection observer para "Cargar más" automático
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchNextPage();
      },
      { rootMargin: "200px", threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-punk-black">
      {/* Fondo coherente con PageLayout */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,200,83,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,83,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(230,0,38,0.08)_0%,transparent_50%)]" />
      <div className="relative z-10 flex min-h-screen flex-col">
      {/* Header: se oculta al hacer scroll hacia abajo, reaparece al subir */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          headerVisible ? "max-h-[220px] opacity-100 lg:max-h-[500px]" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <header className="sticky top-14 z-20 border-b-2 border-punk-white/10 bg-punk-black/95 px-6 py-4 backdrop-blur-md sm:px-12 lg:px-20">
          <div className="mx-auto max-w-7xl 2xl:max-w-content-wide">
            {/* Título y count solo en desktop (navbar ya los muestra en mobile) */}
            <h1 className="mb-4 hidden font-display text-3xl tracking-tighter text-punk-white lg:block sm:text-4xl lg:text-5xl">
              {t("title")}
            </h1>
            <p className="mb-4 hidden font-body text-sm text-punk-white/60 lg:block sm:text-base">
              {t("subtitle", { count: total })}
            </p>
            <EventosOptimizedFilters
              filter={filter}
              onFilterChange={setFilter}
              search={search}
              onSearchChange={setSearch}
              onSubmit={handleSearchSubmit}
            />
          </div>
        </header>
      </div>

      {/* FAB: mostrar buscador cuando está oculto */}
      {!headerVisible && allEvents.length > 0 && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label={tFilters("search")}
          className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-[max(1.5rem,env(safe-area-inset-right))] z-30 flex items-center gap-2 rounded-full border-2 border-punk-red bg-punk-red px-4 py-3 font-punch text-xs uppercase tracking-widest text-punk-white shadow-lg transition-all hover:bg-transparent hover:text-punk-red"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">{tFilters("searchButton")}</span>
        </button>
      )}

      {/* Contenido */}
      <div className="flex-1 px-6 py-6 sm:px-12 sm:py-8 lg:px-20 lg:py-10">
        <div className="mx-auto max-w-7xl 2xl:max-w-content-wide">
          {isLoading ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <PunkLoadingIndicator label={t("loading") || "Cargando eventos"} />
            </div>
          ) : isError ? (
            <div className="rounded-xl border-2 border-punk-white/20 border-dashed p-12 text-center">
              <p className="font-body text-punk-white/60">{t("error") || "Error al cargar eventos"}</p>
            </div>
          ) : allEvents.length === 0 ? (
            <div className="rounded-xl border-2 border-punk-white/20 border-dashed p-12 text-center">
              <p className="font-body text-punk-white/60">{t("empty")}</p>
              <Link
                href="/"
                className="mt-4 inline-block font-punch text-sm uppercase tracking-widest text-punk-red transition-colors hover:text-punk-red/80"
              >
                {tActions("backToHome")}
              </Link>
            </div>
          ) : (
            <>
              {/* Grid: mobile 1 col, tablet 2, desktop 3 */}
              <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
                {allEvents.map((event) => (
                  <EventosOptimizedCard
                    key={event.id}
                    event={event}
                    dateLocale={dateLocale}
                  />
                ))}
              </div>

              {/* Cargar más */}
              {hasNextPage && (
                <div ref={loadMoreRef} className="flex justify-center py-8">
                  <button
                    type="button"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="rounded-lg border-2 border-punk-red/50 bg-punk-red/10 px-6 py-3 font-punch text-xs uppercase tracking-widest text-punk-red transition-colors hover:bg-punk-red/20 disabled:opacity-50"
                  >
                    {isFetchingNextPage ? (
                      <PunkLoadingIndicator label={t("loading") || "Cargando"} variant="inline" />
                    ) : (
                      t("loadMore") || "Cargar más"
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      </div>
    </main>
  );
}
