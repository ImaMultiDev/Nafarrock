"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { SalasMobilePanel } from "./SalasMobilePanel";
import { PunkLoadingIndicator } from "@/components/ui/PunkLoadingIndicator";

type FilterValue = "" | "TABERNA_BAR" | "SALA_CONCIERTOS" | "RECINTO_ABIERTO" | "GAZTETXE" | "SIN_CATEGORIA";

type VenueItem = {
  id: string;
  slug: string;
  name: string;
  city: string;
  capacity: number | null;
  category: string | null;
  logoUrl: string | null;
  imageUrl: string | null;
  images: string[] | null;
};

const PAGE_SIZE = 12;
const CARD_HEIGHT_ESTIMATE = 100;
const CARD_GAP = 12;

async function fetchSalas(
  page: number,
  category: FilterValue,
  search: string
): Promise<{ items: VenueItem[]; total: number; hasMore: boolean }> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(PAGE_SIZE));
  if (category) params.set("category", category);
  if (search.trim()) params.set("search", search.trim());
  const res = await fetch(`/api/salas?${params.toString()}`);
  if (!res.ok) throw new Error("Error al cargar salas");
  return res.json();
}

function VenueCard({ venue }: { venue: VenueItem }) {
  return (
    <Link
      href={`/salas/${venue.slug}`}
      className="group relative flex items-stretch overflow-hidden border-2 border-punk-pink bg-punk-black transition-all duration-300 active:scale-[0.99] hover:shadow-[0_0_40px_rgba(255,0,110,0.15)]"
    >
      <div
        className="absolute right-0 top-0 h-12 w-12 border-t-2 border-r-2 border-punk-pink"
        style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }}
      />
      <div className="h-20 w-20 shrink-0 overflow-hidden border-r-2 border-punk-pink/30">
        {venue.logoUrl || venue.imageUrl || (venue.images && venue.images[0]) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={venue.logoUrl || venue.imageUrl || venue.images?.[0] ?? ""}
            alt={venue.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-punk-black/80 font-display text-2xl text-punk-pink/50">
            {venue.name.charAt(0)}
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3">
        <h2 className="font-display text-base font-medium tracking-tighter text-punk-white transition-colors group-hover:text-punk-pink line-clamp-2">
          {venue.name}
        </h2>
        {venue.city && (
          <p className="mt-0.5 font-body text-sm text-punk-white/60">{venue.city}</p>
        )}
        {venue.capacity && (
          <p className="mt-0.5 font-punch text-[10px] uppercase tracking-widest text-punk-pink/80">
            Aforo: {venue.capacity} personas
          </p>
        )}
      </div>
    </Link>
  );
}

export function SalasMobileView() {
  const t = useTranslations("scene.venues");

  const [category, setCategory] = useState<FilterValue>("");
  const [search, setSearch] = useState("");

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["salas", category, search],
    queryFn: ({ pageParam }) => fetchSalas(pageParam, category, search),
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
  }, [category, search]);

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
      <SalasMobilePanel
        visible={panelVisible}
        category={category}
        onCategoryChange={setCategory}
        search={search}
        onSearchChange={setSearch}
        onSubmit={handleSearchSubmit}
        controlled
      />
      <div className="flex flex-col pb-24 md:hidden">
        {isLoading ? (
          <PunkLoadingIndicator label={t("loading") || "Cargando espacios"} />
        ) : isError ? (
          <div className="border-2 border-punk-white/20 border-dashed p-16 text-center">
            <p className="font-body text-punk-white/60">{t("error") || "Error al cargar espacios"}</p>
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
                const venue = allItems[virtualRow.index];
                return (
                  <div
                    key={venue.id}
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
                      <VenueCard venue={venue} />
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
                    <PunkLoadingIndicator label={t("loading") || "Cargando"} variant="inline" />
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
