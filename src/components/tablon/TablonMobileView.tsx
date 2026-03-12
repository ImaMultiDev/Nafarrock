"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { getDateLocale } from "@/lib/date-locale";
import { useLocale } from "next-intl";
import { TablonMobilePanel } from "./TablonMobilePanel";

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
const CARD_HEIGHT_ESTIMATE = 140;
const CARD_GAP = 12;

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
  return (
    <article className="overflow-hidden border-2 border-punk-yellow/50 bg-punk-black p-4 transition-all duration-300 hover:border-punk-yellow/80">
      <div className="flex flex-wrap items-center gap-2">
        <span className="border border-punk-yellow/50 bg-punk-yellow/10 px-2 py-0.5 font-punch text-xs uppercase tracking-widest text-punk-yellow">
          {t(`categories.${a.category}`)}
        </span>
        {a.territory && (
          <span className="font-body text-sm text-punk-white/60">{a.territory}</span>
        )}
      </div>
      <h2 className="mt-2 font-display text-lg tracking-tighter text-punk-white line-clamp-2">
        {a.title}
      </h2>
      <p className="mt-2 line-clamp-2 font-body text-sm text-punk-white/80">
        {a.description}
      </p>
      <a
        href={`mailto:${a.contactEmail}`}
        className="mt-2 block font-punch text-xs uppercase tracking-widest text-punk-yellow transition-colors hover:text-punk-yellow/80"
      >
        {t("contact")}: {a.contactEmail}
      </a>
      <p className="mt-1 font-body text-xs text-punk-white/50">
        {format(new Date(a.createdAt), "d MMM yyyy", { locale: dateLocale })}
      </p>
    </article>
  );
}

export function TablonMobileView() {
  const t = useTranslations("boardAnnouncement");
  const locale = useLocale();
  const dateLocale = getDateLocale(locale);

  const [category, setCategory] = useState("");
  const [territory, setTerritory] = useState("");

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["tablon", category, territory],
    queryFn: ({ pageParam }) => fetchTablon(pageParam, category, territory),
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

  const handleFilterSubmit = useCallback(() => {
    // No-op - filters are applied in controlled mode via onChange
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const [panelVisible, setPanelVisible] = useState(true);
  const lastScrollTop = useRef(0);
  const SCROLL_THRESHOLD = 8;

  useEffect(() => {
    setPanelVisible(true);
  }, [category, territory]);

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
      <TablonMobilePanel
        visible={panelVisible}
        category={category}
        onCategoryChange={setCategory}
        territory={territory}
        onTerritoryChange={setTerritory}
        onSubmit={handleFilterSubmit}
        controlled
      />
      <div className="flex flex-col pb-24 md:hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-punk-yellow border-t-transparent" />
            <p className="mt-4 font-body text-punk-white/60">{t("loading") || "Cargando anuncios..."}</p>
          </div>
        ) : isError ? (
          <div className="border-2 border-punk-white/20 border-dashed p-16 text-center">
            <p className="font-body text-punk-white/60">{t("error") || "Error al cargar anuncios"}</p>
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
                const a = allItems[virtualRow.index];
                return (
                  <div
                    key={a.id}
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
                      <AnnouncementCard a={a} t={t} dateLocale={dateLocale} />
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
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-punk-yellow border-t-transparent" />
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
