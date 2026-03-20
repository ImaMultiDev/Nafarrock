"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { Filter } from "lucide-react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { getDateLocale } from "@/lib/date-locale";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { TablonOptimizedFilters } from "./TablonOptimizedFilters";
import { PunkLoadingIndicator } from "@/components/ui/PunkLoadingIndicator";
import { useScrollHide } from "@/hooks/useScrollHide";

type AnnouncementItem = {
  id: string;
  title: string;
  category: string;
  territory: string | null;
  description: string;
  contactEmail: string;
  imageUrl: string | null;
  images: string[];
  createdAt: string;
};

const PAGE_SIZE = 12;

async function fetchTablon(
  page: number,
  category: string,
  territory: string
): Promise<{ items: AnnouncementItem[]; total: number; hasMore: boolean }> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(PAGE_SIZE));
  if (category) params.set("category", category);
  if (territory) params.set("territory", territory);
  const res = await fetch(`/api/tablon?${params.toString()}`);
  if (!res.ok) throw new Error("Error al cargar anuncios");
  return res.json();
}

function AnnouncementCard({
  a,
  t,
  dateLocale,
}: {
  a: AnnouncementItem;
  t: (key: string) => string;
  dateLocale: import("date-fns").Locale;
}) {
  const mainImage = a.imageUrl || (a.images?.[0]);

  return (
    <Link
      href={`/tablon/${a.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border-2 border-punk-white/10 bg-punk-black transition-all duration-300 hover:border-punk-yellow/50 hover:shadow-[0_0_24px_rgba(255,214,10,0.12)] active:scale-[0.99]"
    >
      <div className="aspect-[16/10] overflow-hidden bg-punk-black">
        {mainImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mainImage}
            alt={a.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-5xl text-punk-yellow/30">
            {a.title.charAt(0)}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="border border-punk-yellow/50 bg-punk-yellow/10 px-2 py-0.5 font-punch text-[10px] uppercase tracking-widest text-punk-yellow">
            {t(`categories.${a.category}`)}
          </span>
          {a.territory && (
            <span className="font-body text-xs text-punk-white/60">{a.territory}</span>
          )}
        </div>
        <h2 className="mt-2 font-display text-lg font-semibold tracking-tight text-punk-white transition-colors group-hover:text-punk-yellow line-clamp-2">
          {a.title}
        </h2>
        <p className="mt-1 line-clamp-2 font-body text-sm text-punk-white/70">
          {a.description}
        </p>
        <p className="mt-2 font-body text-xs text-punk-white/50">
          {format(new Date(a.createdAt), "d MMM yyyy", { locale: dateLocale })}
        </p>
      </div>
    </Link>
  );
}

export function TablonOptimizedView() {
  const t = useTranslations("boardAnnouncement");
  const tActions = useTranslations("common.actions");
  const tFilters = useTranslations("boardAnnouncement.filters");
  const locale = useLocale();
  const dateLocale = getDateLocale(locale);
  const queryClient = useQueryClient();

  const [category, setCategory] = useState("");
  const [territory, setTerritory] = useState("");

  useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: ["tablon-optimized"] });
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
    queryKey: ["tablon-optimized", category, territory],
    queryFn: ({ pageParam }) => fetchTablon(pageParam, category, territory),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length + 1 : undefined,
    staleTime: 5 * 60 * 1000,
  });

  const allItems = data?.pages.flatMap((p) => p.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  const loadMoreRef = useRef<HTMLDivElement>(null);

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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(255,214,10,0.08)_0%,transparent_50%)]" />
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header: se oculta al hacer scroll hacia abajo, reaparece al subir */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-out ${
            headerVisible ? "max-h-[280px] opacity-100 lg:max-h-[500px]" : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          <header className="sticky top-14 z-20 border-b-2 border-punk-white/10 bg-punk-black/95 px-6 py-4 backdrop-blur-md sm:px-12 lg:px-20">
            <div className="mx-auto max-w-7xl 2xl:max-w-content-wide">
              {/* Título y count solo en desktop */}
              <h1 className="mb-4 hidden font-display text-3xl tracking-tighter text-punk-white lg:block sm:text-4xl lg:text-5xl">
                {t("title")}
              </h1>
              <p className="mb-4 hidden font-body text-sm text-punk-white/60 lg:block sm:text-base">
                {t("subtitle")}
              </p>
              <TablonOptimizedFilters
                category={category}
                onCategoryChange={setCategory}
                territory={territory}
                onTerritoryChange={setTerritory}
              />
            </div>
          </header>
        </div>

        {/* FAB: mostrar filtros cuando está oculto */}
        {!headerVisible && allItems.length > 0 && (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label={tFilters("filter")}
            className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-[max(1.5rem,env(safe-area-inset-right))] z-30 flex items-center gap-2 rounded-full border-2 border-punk-yellow bg-punk-yellow px-4 py-3 font-punch text-xs uppercase tracking-widest text-punk-black shadow-lg transition-all hover:bg-transparent hover:text-punk-yellow"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">{tFilters("filter")}</span>
          </button>
        )}

        {/* Contenido */}
        <div className="flex-1 px-6 py-6 sm:px-12 sm:py-8 lg:px-20 lg:py-10">
          <div className="mx-auto max-w-7xl 2xl:max-w-content-wide">
            {isLoading ? (
              <div className="flex min-h-[40vh] items-center justify-center">
                <PunkLoadingIndicator label={t("loading") || "Cargando anuncios"} />
              </div>
            ) : isError ? (
              <div className="rounded-xl border-2 border-punk-white/20 border-dashed p-12 text-center">
                <p className="font-body text-punk-white/60">{t("error") || "Error al cargar anuncios"}</p>
              </div>
            ) : allItems.length === 0 ? (
              <div className="rounded-xl border-2 border-punk-white/20 border-dashed p-12 text-center">
                <p className="font-body text-punk-white/60">{t("empty")}</p>
                <Link
                  href="/"
                  className="mt-4 inline-block font-punch text-sm uppercase tracking-widest text-punk-yellow transition-colors hover:text-punk-yellow/80"
                >
                  ← {tActions("backToHome")}
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {allItems.map((a) => (
                    <AnnouncementCard key={a.id} a={a} t={t} dateLocale={dateLocale} />
                  ))}
                </div>

                {hasNextPage && (
                  <div ref={loadMoreRef} className="flex justify-center py-8">
                    <button
                      type="button"
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="rounded-lg border-2 border-punk-yellow/50 bg-punk-yellow/10 px-6 py-3 font-punch text-xs uppercase tracking-widest text-punk-yellow transition-colors hover:bg-punk-yellow/20 disabled:opacity-50"
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
