"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FestivalesOptimizedFilters } from "./FestivalesOptimizedFilters";
import { PunkLoadingIndicator } from "@/components/ui/PunkLoadingIndicator";
import { useScrollHide } from "@/hooks/useScrollHide";

type FestivalItem = {
  id: string;
  slug: string;
  name: string;
  location: string | null;
  logoUrl: string | null;
};

const PAGE_SIZE = 12;

async function fetchFestivales(
  page: number,
  search: string
): Promise<{ items: FestivalItem[]; total: number; hasMore: boolean }> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(PAGE_SIZE));
  if (search.trim()) params.set("search", search.trim());
  const res = await fetch(`/api/festivales?${params.toString()}`);
  if (!res.ok) throw new Error("Error al cargar festivales");
  return res.json();
}

function FestivalCard({ festival }: { festival: FestivalItem }) {
  return (
    <Link
      href={`/festivales/${festival.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border-2 border-punk-white/10 bg-punk-black transition-all duration-300 hover:border-punk-red/50 hover:shadow-[0_0_24px_rgba(230,0,38,0.12)] active:scale-[0.99]"
    >
      <div className="aspect-[16/10] overflow-hidden bg-punk-black">
        {festival.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={festival.logoUrl}
            alt={festival.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-5xl text-punk-red/30">
            {festival.name.charAt(0)}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h2 className="font-display text-lg font-semibold tracking-tight text-punk-white transition-colors group-hover:text-punk-red line-clamp-2">
          {festival.name}
        </h2>
        {festival.location && (
          <p className="mt-1 font-body text-sm text-punk-white/60">{festival.location}</p>
        )}
      </div>
    </Link>
  );
}

export function FestivalesOptimizedView() {
  const t = useTranslations("scene.festivals");
  const tFilters = useTranslations("filters.festivales");
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");

  useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: ["festivales-optimized"] });
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
    queryKey: ["festivales-optimized", submittedSearch],
    queryFn: ({ pageParam }) => fetchFestivales(pageParam, submittedSearch),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length + 1 : undefined,
    staleTime: 5 * 60 * 1000,
  });

  const allFestivals = data?.pages.flatMap((p) => p.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleSearchSubmit = useCallback((s: string) => {
    setSubmittedSearch(s);
  }, []);

  const headerVisible = useScrollHide();

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
          headerVisible ? "max-h-[120px] opacity-100 lg:max-h-[500px]" : "max-h-0 opacity-0 pointer-events-none"
        }`}
        >
          <header className="sticky top-14 z-20 border-b-2 border-punk-white/10 bg-punk-black/95 px-6 py-4 backdrop-blur-md sm:px-12 lg:px-20">
            <div className="mx-auto max-w-7xl 2xl:max-w-content-wide">
              {/* Título y count solo en desktop (navbar ya los muestra en mobile) */}
              <h1 className="mb-4 hidden font-display text-3xl tracking-tighter text-punk-white lg:block sm:text-4xl lg:text-5xl">
                {t("metadata.title").toUpperCase()}
              </h1>
              <p className="mb-4 hidden font-body text-sm text-punk-white/60 lg:block sm:text-base">
                {t(total === 1 ? "count" : "count_other", { count: total })}
              </p>
              <FestivalesOptimizedFilters
                search={search}
                onSearchChange={setSearch}
                onSubmit={handleSearchSubmit}
              />
            </div>
          </header>
        </div>

        {/* FAB: mostrar buscador cuando está oculto */}
        {!headerVisible && allFestivals.length > 0 && (
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
                <PunkLoadingIndicator label={t("loading") || "Cargando festivales"} />
              </div>
            ) : isError ? (
              <div className="rounded-xl border-2 border-punk-white/20 border-dashed p-12 text-center">
                <p className="font-body text-punk-white/60">{t("error") || "Error al cargar festivales"}</p>
              </div>
            ) : allFestivals.length === 0 ? (
              <div className="rounded-xl border-2 border-punk-white/20 border-dashed p-12 text-center">
                <p className="font-body text-punk-white/60">{t("empty")}</p>
                <Link
                  href="/escena"
                  className="mt-4 inline-block font-punch text-sm uppercase tracking-widest text-punk-red transition-colors hover:text-punk-red/80"
                >
                  ← Volver a Escena
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {allFestivals.map((festival) => (
                    <FestivalCard key={festival.id} festival={festival} />
                  ))}
                </div>

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
