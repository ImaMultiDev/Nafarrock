"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { FestivalesMobilePanel } from "./FestivalesMobilePanel";

type FestivalItem = {
  id: string;
  slug: string;
  name: string;
  location: string | null;
  logoUrl: string | null;
};

const PAGE_SIZE = 12;
const CARD_HEIGHT_ESTIMATE = 180;
const CARD_GAP = 12;

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
      className="group relative block min-w-0 overflow-hidden border-2 border-punk-red bg-punk-black p-4 transition-all duration-300 active:scale-[0.99] hover:shadow-[0_0_40px_rgba(230,0,38,0.2)]"
    >
      <div
        className="absolute right-0 top-0 h-12 w-12 border-t-2 border-r-2 border-punk-red"
        style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }}
      />
      <div className="aspect-[4/3] min-h-0 min-w-0 overflow-hidden border border-punk-white/10">
        {festival.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={festival.logoUrl}
            alt={festival.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-punk-black/80 font-display text-4xl text-punk-red/50">
            {festival.name.charAt(0)}
          </div>
        )}
      </div>
      <h2 className="mt-3 font-display text-lg tracking-tighter text-punk-white transition-colors group-hover:text-punk-red">
        {festival.name}
      </h2>
      {festival.location && (
        <p className="mt-1 font-body text-sm text-punk-white/70">{festival.location}</p>
      )}
    </Link>
  );
}

export function FestivalesMobileView() {
  const t = useTranslations("scene.festivals");

  const [search, setSearch] = useState("");

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["festivales", search],
    queryFn: ({ pageParam }) => fetchFestivales(pageParam, search),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length + 1 : undefined,
    staleTime: 5 * 60 * 1000,
  });

  const allItems = data?.pages.flatMap((p) => p.items) ?? [];

  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: allItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => CARD_HEIGHT_ESTIMATE,
    overscan: 5,
    gap: CARD_GAP,
  });

  const handleSearchSubmit = useCallback((s: string) => setSearch(s), []);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const [panelVisible, setPanelVisible] = useState(true);
  const lastScrollTop = useRef(0);
  const SCROLL_THRESHOLD = 8;

  useEffect(() => {
    setPanelVisible(true);
  }, [search]);

  useEffect(() => {
    const el = parentRef.current;
    if (!el || allItems.length === 0) return;
    const onScroll = () => {
      const scrollTop = el.scrollTop;
      const delta = scrollTop - lastScrollTop.current;
      if (Math.abs(delta) < SCROLL_THRESHOLD) return;
      setPanelVisible(delta < 0);
      lastScrollTop.current = scrollTop;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [allItems.length]);

  return (
    <>
      <FestivalesMobilePanel
        visible={panelVisible}
        search={search}
        onSearchChange={setSearch}
        onSubmit={handleSearchSubmit}
        controlled
      />
      <div className="flex flex-col pb-24 md:hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-punk-red border-t-transparent" />
            <p className="mt-4 font-body text-punk-white/60">{t("loading") || "Cargando festivales..."}</p>
          </div>
        ) : isError ? (
          <div className="border-2 border-punk-white/20 border-dashed p-16 text-center">
            <p className="font-body text-punk-white/60">{t("error") || "Error al cargar festivales"}</p>
          </div>
        ) : allItems.length === 0 ? (
          <div className="border-2 border-punk-white/20 border-dashed p-16 text-center">
            <p className="font-body text-punk-white/60">{t("empty")}</p>
          </div>
        ) : (
          <div
            ref={parentRef}
            className="h-[calc(100dvh-3.5rem-8rem)] overflow-auto overscroll-contain"
          >
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const festival = allItems[virtualRow.index];
                return (
                  <div
                    key={festival.id}
                    ref={virtualizer.measureElement}
                    data-index={virtualRow.index}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className="px-0"
                  >
                    <div className="pb-3">
                      <FestivalCard festival={festival} />
                    </div>
                  </div>
                );
              })}
            </div>
            {hasNextPage && (
              <div className="flex justify-center px-4 py-6">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={isFetchingNextPage}
                  className="map-filter-btn flex items-center gap-2 font-punch text-xs uppercase tracking-widest"
                >
                  {isFetchingNextPage ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-punk-red border-t-transparent" />
                      {t("loading") || "Cargando..."}
                    </>
                  ) : (
                    t("loadMore") || "Cargar más"
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
